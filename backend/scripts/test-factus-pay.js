// Verificación de la integración Factus Pay (Sandbox).
// Cubre: autenticación, creación de recaudo, QR real, idempotencia,
// consulta de estado, reglas de negocio y persistencia.
// Uso: node scripts/test-factus-pay.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const app = require('../src/app');
const Invoice = require('../src/models/Invoice');
const Payment = require('../src/models/Payment');
const Customer = require('../src/models/Customer');
const Product = require('../src/models/product');
const { authenticate, clearTokenCache } = require('../src/integrations/factusPay/client');
const { PaymentService } = require('../src/services/paymentService');
const { InvoiceService } = require('../src/services/invoiceService');

const http = require('http');
let server;
let baseUrl;

function api(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, baseUrl);
    const req = http.request(
      {
        method,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        headers: { 'Content-Type': 'application/json' }
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
          catch { resolve({ status: res.statusCode, body: data }); }
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

const results = [];
const check = (name, ok, extra = '') => {
  results.push({ name, ok });
  console.log(`${ok ? '  ✅' : '  ❌'} ${name}${extra ? ' | ' + extra : ''}`);
};

async function run() {
  console.log('🔄 Prueba de integración Factus Pay (Sandbox)…');
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('✅ MongoDB conectado');

  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  // ---1. Autenticación ---
  console.log('\n[1] Autenticación Factus Pay');
  clearTokenCache();
  try {
    const token = await authenticate();
    check('POST /auth devuelve token', typeof token === 'string' && token.length > 0, `longitud=${token ? token.length : 0}`);
  } catch (err) {
    check('POST /auth devuelve token', false, err.message);
    throw err;
  }

  // ---2. Factura real de prueba (DRAFT, monto válido) ---
  console.log('\n[2] Preparación de factura de prueba');
  const customer = await Customer.create({
    identificationType: 'CC',
    identificationNumber: `PAY-TEST-${Date.now()}`,
    names: 'Cliente Prueba Factus Pay',
    email: 'test.factuspay@empresa.com'
  });
  const product = await Product.create({
    code: `PAY-PROD-${Date.now()}`,
    name: 'Producto Prueba Factus Pay',
    price: 50000,
    taxRate: 19
  });
  const invoice = await InvoiceService.createInvoice({
    customerId: customer._id.toString(),
    items: [{ productId: product._id.toString(), quantity: 1 }]
  });
  console.log(`  factura ${invoice.referenceCode} · total ${invoice.grandTotal} · estado ${invoice.status}`);
  check('Factura creada con grandTotal válido (59.500)', invoice.grandTotal === 59500, `total=${invoice.grandTotal}`);

  // ---3. Crear cobro ---
  console.log('\n[3] POST /api/payments (crear recaudo)');
  const created = await api('POST', '/api/payments', { invoiceId: invoice._id.toString() });
  check('POST /api/payments → 201', created.status === 201, `status=${created.status} ${created.body.message || ''}`);
  const payment = created.body.data || {};
  check('referenceCode = referenceCode de la factura', payment.referenceCode === invoice.referenceCode, payment.referenceCode);
  check('amount = grandTotal de MongoDB', Number(payment.amount) === invoice.grandTotal, `amount=${payment.amount}`);
  check('QR real (data URI de Factus Pay)', /^data:image\/(png|svg\+xml|jpeg)/.test(payment.qr || ''), String(payment.qr || '').slice(0, 40));
  check('estado inicial documentado', ['started', 'ready', 'paid'].includes(payment.status), payment.status);

  // ---4. Idempotencia ---
  console.log('\n[4] Idempotencia del cobro');
  const again = await api('POST', '/api/payments', { invoiceId: invoice._id.toString() });
  check('Segundo POST reutiliza el cobro (200)', again.status === 200, `status=${again.status}`);
  check('Mismo referenceCode', again.body.data?.referenceCode === payment.referenceCode);
  const count = await Payment.countDocuments({ referenceCode: invoice.referenceCode });
  check('Un solo Payment persistido', count === 1, `count=${count}`);

  // ---5. Consulta y persistencia ---
  console.log('\n[5] GET /api/payments/:referenceCode');
  const fetched = await api('GET', `/api/payments/${encodeURIComponent(payment.referenceCode)}`);
  check('GET → 200', fetched.status === 200, `status=${fetched.status}`);
  const fetchedPayment = fetched.body.data || {};
  check('Estado consultable', ['started', 'ready', 'paid', 'failed', 'rejected'].includes(fetchedPayment.status), fetchedPayment.status);
  check('QR persistido en MongoDB', Boolean(fetchedPayment.qr));
  check('Invoice poblada en la respuesta', Boolean(fetchedPayment.invoice && fetchedPayment.invoice.referenceCode));
  check('createdAt/updatedAt presentes', Boolean(fetchedPayment.createdAt && fetchedPayment.updatedAt));

  const list = await api('GET', '/api/payments');
  check('GET /api/payments → lista', list.status === 200 && Array.isArray(list.body.data), `n=${(list.body.data || []).length}`);

  // ---6. Reglas de negocio ---
  console.log('\n[6] Reglas de negocio');
  const missing = await api('POST', '/api/payments', { invoiceId: '000000000000000000000000' });
  check('Invoice inexistente → 404', missing.status === 404, `status=${missing.status}`);
  const badId = await api('POST', '/api/payments', { invoiceId: 'no-es-id' });
  check('invoiceId inválido → 400', badId.status === 400, `status=${badId.status}`);
  const noBody = await api('POST', '/api/payments', {});
  check('Sin invoiceId → 400', noBody.status === 400, `status=${noBody.status}`);

  const cancelled = await InvoiceService.createInvoice({
    customerId: customer._id.toString(),
    items: [{ productId: product._id.toString(), quantity: 1 }]
  });
  await Invoice.findByIdAndUpdate(cancelled._id, { status: 'CANCELLED' });
  const cancelledRes = await api('POST', '/api/payments', { invoiceId: cancelled._id.toString() });
  check('Invoice CANCELLED → 400', cancelledRes.status === 400, `status=${cancelledRes.status} ${cancelledRes.body.message || ''}`);

  const tinyProduct = await Product.create({
    code: `PAY-TINY-${Date.now()}`,
    name: 'Producto Mínimo Factus Pay',
    price: 5000,
    taxRate: 0
  });
  const tinyInvoice = await InvoiceService.createInvoice({
    customerId: customer._id.toString(),
    items: [{ productId: tinyProduct._id.toString(), quantity: 1 }]
  });
  const tinyRes = await api('POST', '/api/payments', { invoiceId: tinyInvoice._id.toString() });
  check('Monto < 10.000 → 400 (límite documentado)', tinyRes.status === 400, `status=${tinyRes.status} ${tinyRes.body.message || ''}`);

  const missingRef = await api('GET', '/api/payments/REF-NO-EXISTE-XYZ');
  check('Cobro inexistente → 404', missingRef.status === 404, `status=${missingRef.status}`);

  // ---7. Seguridad: nunca exponer secretos ---
  console.log('\n[7] Seguridad');
  const raw = JSON.stringify(fetched.body) + JSON.stringify(created.body);
  check('Sin password en respuestas HTTP', !/FACTUS_PAY_PASSWORD|password/i.test(raw));
  check('Sin token/Authorization en respuestas HTTP', !/authorization|bearer\s+[0-9a-z|]{10,}/i.test(raw));

  // --- Limpieza local de la prueba (el recaudo permanece en Factus Pay) ---
  await Payment.deleteMany({
    referenceCode: { $in: [invoice.referenceCode, cancelled.referenceCode, tinyInvoice.referenceCode] }
  });
  await Invoice.deleteMany({ _id: { $in: [invoice._id, cancelled._id, tinyInvoice._id] } });
  await Customer.deleteMany({ _id: customer._id });
  await Product.deleteMany({ _id: { $in: [product._id, tinyProduct._id] } });

  server.close();
  await mongoose.disconnect();

  const failed = results.filter((r) => !r.ok);
  console.log(failed.length === 0
    ? `\n🎉 FACTUS PAY: TODAS LAS COMPROBACIONES OK (${results.length})`
    : `\n❌ FACTUS PAY: ${failed.length}/${results.length} fallidas: ${failed.map((f) => f.name).join(' | ')}`);
  process.exit(failed.length === 0 ? 0 : 1);
}

run().catch(async (err) => {
  console.error('❌ Error en la prueba Factus Pay:', err.message);
  if (server) server.close();
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});

