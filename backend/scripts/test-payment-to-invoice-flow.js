const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const app = require('../src/app');
const Invoice = require('../src/models/Invoice');
const Payment = require('../src/models/Payment');
const Customer = require('../src/models/Customer');
const Product = require('../src/models/product');
const { PaymentService } = require('../src/services/paymentService');

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

async function run() {
  console.log('🧪 Prueba end-to-end: Pago → paid → Factura emitida');
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('✅ MongoDB conectado');

  server = app.listen(0);
  await new Promise((r) => server.on('listening', r));
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  // 1. Preparar datos
  const customer = await Customer.create({
    identificationType: 'CC',
    identificationNumber: `E2E-${Date.now()}`,
    names: 'Cliente E2E',
    email: 'e2e@test.com'
  });
  const product = await Product.create({
    code: `E2E-PROD-${Date.now()}`,
    name: 'Producto E2E',
    price: 50000,
    taxRate: 19
  });
  const invoice = await Invoice.create({
    customer: customer._id,
    referenceCode: `E2E-INV-${Date.now()}`,
    status: 'DRAFT',
    items: [{
      code: product.code,
      productId: product._id,
      name: product.name,
      quantity: 1,
      unitPrice: product.price,
      taxRate: product.taxRate
    }]
  });

  // 2. Crear payment
  const created = await api('POST', '/api/payments', { invoiceId: invoice._id.toString() });
  if (created.status !== 201) throw new Error('No se pudo crear el payment: ' + JSON.stringify(created.body));
  const payment = created.body.data;
  console.log(`✅ Payment creado: ${payment.referenceCode} status=${payment.status}`);

  // 3. Simular pago aprobado en MongoDB (sandbox no tiene API para esto)
  await Payment.findOneAndUpdate({ referenceCode: payment.referenceCode }, { status: 'paid', paidAt: new Date() });
  console.log('🔧 Payment marcado como paid (simulación sandbox)');

  // 4. Sincronizar (debería disparar emisión)
  const synced = await api('GET', `/api/payments/${encodeURIComponent(payment.referenceCode)}`);
  if (synced.status !== 200) throw new Error('Fallo sync: ' + JSON.stringify(synced.body));
  const syncedPayment = synced.body.data;
  console.log(`✅ Payment sincronizado: status=${syncedPayment.status} invoiceIssuedAt=${syncedPayment.invoiceIssuedAt}`);

  // 5. Verificar factura emitida
  const invoiceRes = await api('GET', `/api/invoices/${invoice._id}`);
  if (invoiceRes.status !== 200) throw new Error('Fallo al obtener factura: ' + JSON.stringify(invoiceRes.body));
  const issued = invoiceRes.body.data;
  console.log(`✅ Factura estado: ${issued.status}`);
  console.log(`   numbering: ${issued.numbering}`);
  console.log(`   cufe: ${issued.cufe}`);
  console.log(`   qr: ${issued.qrCodeUrl ? 'SI' : 'NO'}`);
  console.log(`   pdf: ${issued.pdfUrl ? 'SI' : 'NO'}`);

  if (issued.status !== 'ISSUED' || !issued.numbering || !issued.cufe) {
    throw new Error('La factura no se emitió correctamente.');
  }

  // Limpieza
  await Payment.deleteMany({ referenceCode: payment.referenceCode });
  await Invoice.deleteMany({ _id: invoice._id });
  await Customer.deleteMany({ _id: customer._id });
  await Product.deleteMany({ _id: product._id });
  server.close();
  await mongoose.disconnect();
  console.log('\n🎉 FLUJO END-TO-END OK');
  process.exit(0);
}

run().catch(async (err) => {
  console.error('❌ Error:', err.message);
  if (server) server.close();
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
