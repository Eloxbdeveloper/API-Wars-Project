import fs from 'fs';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';

const API = 'http://localhost:3000/api';

const req = async (method, path, body) => {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json };
};

const log = (name, ok, extra = '') => console.log(`${ok ? '✅' : '❌'} ${name}${extra ? ' | ' + extra : ''}`);

//1. Cliente + producto + factura (venta real a través del backend)
const stamp = Date.now();
const customer = await req('POST', '/customers', {
  identificationType: 'CC',
  identificationNumber: `E2E-${stamp}`,
  names: 'Cliente E2E Factus Pay',
  email: `e2e.${stamp}@empresa.com`
});
log('Cliente creado', customer.status === 201 || customer.status === 200, `status=${customer.status}`);

const product = await req('POST', '/products', {
  code: `E2E-${stamp}`,
  name: 'Producto E2E Factus Pay',
  price: 50000,
  taxRate: 19
});
log('Producto creado', product.status === 201 || product.status === 200, `status=${product.status}`);

const invoice = await req('POST', '/invoices', {
  customerId: customer.body.data._id,
  items: [{ productId: product.body.data._id, quantity: 1 }]
});
log('Factura DRAFT creada', invoice.status === 201, `status=${invoice.status} total=${invoice.body.data?.grandTotal}`);
const invoiceId = invoice.body.data._id;

//2. Crear cobro con Factus Pay
const payment = await req('POST', '/payments', { invoiceId });
log('Cobro creado (POST /api/payments)', payment.status === 201, `status=${payment.status}`);
const p = payment.body.data || {};
log('QR recibido (data URI real)', /^data:image\/png;base64,/.test(p.qr || ''), String(p.qr || '').slice(0, 32));
log('Estado inicial', ['started', 'ready'].includes(p.status), p.status);

//3. Decodificar el QR real para obtener la URL de pago
let paymentUrl = null;
if (p.qr) {
  const base64 = p.qr.split(',')[1];
  const png = PNG.sync.read(Buffer.from(base64, 'base64'));
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  paymentUrl = decoded?.data || null;
  log('QR decodificado a URL de pago', Boolean(paymentUrl), paymentUrl ? '(longitud ' + paymentUrl.length + ')' : 'sin decodificar');
}

fs.writeFileSync('__pay_state.json', JSON.stringify({
  invoiceId,
  referenceCode: p.referenceCode,
  amount: p.amount,
  status: p.status,
  paymentUrl,
  customerId: customer.body.data._id,
  productId: product.body.data._id
}, null, 2));

console.log('\nreferenceCode:', p.referenceCode);
console.log('paymentUrl:', paymentUrl);
console.log('estado guardado en __pay_state.json');
