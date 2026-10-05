const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const http = require('http');
const app = require('../src/app');

const Customer = require('../src/models/Customer');
const Product = require('../src/models/product');
const Invoice = require('../src/models/Invoice');

let server;
let baseUrl;

function makeRequest(method, endpoint, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, baseUrl);
    const options = {
      method: method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runHttpTests() {
  console.log('🔄 Iniciando Suite de Pruebas HTTP (ETAPA 4)...');
  let testCustomer, testProduct1, testProduct2, createdInvoiceId;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB Atlas');

    // Iniciar servidor en puerto libre
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        console.log(`🚀 Servidor HTTP iniciado para pruebas en ${baseUrl}`);
        resolve();
      });
    });

    // Limpieza preliminar de datos de prueba
    await Customer.deleteMany({ identificationNumber: 'TEST-HTTP-999' });
    await Product.deleteMany({ code: { $in: ['HTTP-PROD-01', 'HTTP-PROD-02'] } });

    testCustomer = await Customer.create({
      identificationType: 'NIT',
      identificationNumber: 'TEST-HTTP-999',
      dv: '1',
      names: 'Cliente Prueba HTTP S.A.S.',
      email: 'test.http@empresa.com'
    });

    testProduct1 = await Product.create({
      code: 'HTTP-PROD-01',
      name: 'Producto HTTP 1',
      price: 100000,
      taxRate: 19
    });

    testProduct2 = await Product.create({
      code: 'HTTP-PROD-02',
      name: 'Producto HTTP 2',
      price: 50000,
      taxRate: 19
    });

    console.log('\n--- PRUEBAS HTTP POST /api/invoices ---');

    // 1. POST Factura Válida -> 201
    const res1 = await makeRequest('POST', '/api/invoices', {
      customerId: testCustomer._id.toString(),
      items: [{ productId: testProduct1._id.toString(), quantity: 1 }]
    });
    if (res1.status === 201 && res1.body.success && res1.body.data._id) {
      createdInvoiceId = res1.body.data._id;
      console.log('  ✅ [PASS] POST factura válida → 201 Created | ID:', createdInvoiceId);
    } else {
      console.error('  ❌ [FAIL] POST factura válida:', res1);
    }

    // 2. POST sin customer -> 400/404
    const res2 = await makeRequest('POST', '/api/invoices', {
      items: [{ productId: testProduct1._id.toString(), quantity: 1 }]
    });
    if (res2.status >= 400 && !res2.body.success) {
      console.log(`  ✅ [PASS] POST sin customer → ${res2.status} Rechazado correctamente`);
    } else {
      console.error('  ❌ [FAIL] POST sin customer:', res2);
    }

    // 3. POST customer inexistente -> 404
    const fakeCustomerObjectId = new mongoose.Types.ObjectId().toString();
    const res3 = await makeRequest('POST', '/api/invoices', {
      customerId: fakeCustomerObjectId,
      items: [{ productId: testProduct1._id.toString(), quantity: 1 }]
    });
    if (res3.status === 404) {
      console.log('  ✅ [PASS] POST customer inexistente → 404 Not Found');
    } else {
      console.error('  ❌ [FAIL] POST customer inexistente:', res3);
    }

    // 4. POST customer con ObjectId inválido -> 400
    const res4 = await makeRequest('POST', '/api/invoices', {
      customerId: '123-id-invalido',
      items: [{ productId: testProduct1._id.toString(), quantity: 1 }]
    });
    if (res4.status === 400) {
      console.log('  ✅ [PASS] POST customer con ObjectId inválido → 400 Bad Request');
    } else {
      console.error('  ❌ [FAIL] POST customer ObjectId inválido:', res4);
    }

    // 5. POST sin items -> 400
    const res5 = await makeRequest('POST', '/api/invoices', {
      customerId: testCustomer._id.toString(),
      items: []
    });
    if (res5.status === 400) {
      console.log('  ✅ [PASS] POST sin items → 400 Bad Request');
    } else {
      console.error('  ❌ [FAIL] POST sin items:', res5);
    }

    // 6. POST producto inexistente -> 404
    const fakeProductObjectId = new mongoose.Types.ObjectId().toString();
    const res6 = await makeRequest('POST', '/api/invoices', {
      customerId: testCustomer._id.toString(),
      items: [{ productId: fakeProductObjectId, quantity: 1 }]
    });
    if (res6.status === 404) {
      console.log('  ✅ [PASS] POST producto inexistente → 404 Not Found');
    } else {
      console.error('  ❌ [FAIL] POST producto inexistente:', res6);
    }

    // 7. POST producto con ObjectId inválido -> 400
    const res7 = await makeRequest('POST', '/api/invoices', {
      customerId: testCustomer._id.toString(),
      items: [{ productId: 'prod-invalido', quantity: 1 }]
    });
    if (res7.status === 400) {
      console.log('  ✅ [PASS] POST producto con ObjectId inválido → 400 Bad Request');
    } else {
      console.error('  ❌ [FAIL] POST producto ObjectId inválido:', res7);
    }

    // 8. POST quantity = 0 -> 400
    const res8 = await makeRequest('POST', '/api/invoices', {
      customerId: testCustomer._id.toString(),
      items: [{ productId: testProduct1._id.toString(), quantity: 0 }]
    });
    if (res8.status === 400) {
      console.log('  ✅ [PASS] POST quantity = 0 → 400 Bad Request');
    } else {
      console.error('  ❌ [FAIL] POST quantity = 0:', res8);
    }

    // 9. POST quantity negativa -> 400
    const res9 = await makeRequest('POST', '/api/invoices', {
      customerId: testCustomer._id.toString(),
      items: [{ productId: testProduct1._id.toString(), quantity: -5 }]
    });
    if (res9.status === 400) {
      console.log('  ✅ [PASS] POST quantity negativa → 400 Bad Request');
    } else {
      console.error('  ❌ [FAIL] POST quantity negativa:', res9);
    }

    // 10. POST múltiples productos, totales y manipulación -> 201
    const res10 = await makeRequest('POST', '/api/invoices', {
      customerId: testCustomer._id.toString(),
      items: [
        { productId: testProduct1._id.toString(), quantity: 2, unitPrice: 1, subtotal: 1 },
        { productId: testProduct2._id.toString(), quantity: 1, unitPrice: 1, subtotal: 1 }
      ],
      subtotal: 1,
      taxTotal: 1,
      grandTotal: 1
    });

    if (res10.status === 201) {
      const inv = res10.body.data;
      if (inv.subtotal === 250000 && inv.taxTotal === 47500 && inv.grandTotal === 297500) {
        console.log('  ✅ [PASS] Múltiples productos y protección contra manipulación de precios → 201 (Subtotal: 250000, Tax: 47500, Total: 297500)');
      } else {
        console.error('  ❌ [FAIL] Cálculos o manipulación de precios falló:', inv);
      }
    } else {
      console.error('  ❌ [FAIL] POST múltiples productos:', res10);
    }

    console.log('\n--- PRUEBA SNAPSHOT DE PRODUCTO ---');
    // 11. Cambiar precio original en BD y verificar que la factura conserve precio original
    await Product.findByIdAndUpdate(testProduct1._id, { price: 300000 });
    const resSnap = await makeRequest('GET', `/api/invoices/${createdInvoiceId}`);
    if (resSnap.status === 200 && resSnap.body.data.items[0].unitPrice === 100000) {
      console.log('  ✅ [PASS] Snapshot verificado: La factura conserva $100.000 tras modificar precio en BD');
    } else {
      console.error('  ❌ [FAIL] Snapshot falló:', resSnap.body);
    }

    console.log('\n--- PRUEBAS HTTP GET /api/invoices ---');

    // 12. GET /api/invoices -> 200
    const resGetList = await makeRequest('GET', '/api/invoices');
    if (resGetList.status === 200 && resGetList.body.success) {
      console.log('  ✅ [PASS] GET /api/invoices → 200 OK');
    } else {
      console.error('  ❌ [FAIL] GET /api/invoices:', resGetList);
    }

    // 13. GET /api/invoices/:id inexistente -> 404
    const resGet404 = await makeRequest('GET', `/api/invoices/${fakeCustomerObjectId}`);
    if (resGet404.status === 404) {
      console.log('  ✅ [PASS] GET /api/invoices/:id inexistente → 404 Not Found');
    } else {
      console.error('  ❌ [FAIL] GET inexistente:', resGet404);
    }

    // 14. GET con ObjectId inválido -> 400
    const resGet400 = await makeRequest('GET', '/api/invoices/id-invalido-123');
    if (resGet400.status === 400) {
      console.log('  ✅ [PASS] GET /api/invoices con ObjectId inválido → 400 Bad Request');
    } else {
      console.error('  ❌ [FAIL] GET ObjectId inválido:', resGet400);
    }

    console.log('\n--- PRUEBAS HTTP PUT /api/invoices/:id ---');

    // 15. PUT Factura DRAFT -> 200 y recalcula
    const resPut = await makeRequest('PUT', `/api/invoices/${createdInvoiceId}`, {
      items: [{ productId: testProduct2._id.toString(), quantity: 3 }]
    });
    if (resPut.status === 200 && resPut.body.data.grandTotal === 178500) {
      console.log('  ✅ [PASS] PUT factura DRAFT → 200 OK (Recalculado nuevo grandTotal: 178500)');
    } else {
      console.error('  ❌ [FAIL] PUT factura DRAFT:', resPut);
    }

    // 16. Bloqueo de modificación en estado ISSUED
    await Invoice.findByIdAndUpdate(createdInvoiceId, { status: 'ISSUED' });
    const resPutIssued = await makeRequest('PUT', `/api/invoices/${createdInvoiceId}`, {
      items: [{ productId: testProduct1._id.toString(), quantity: 1 }]
    });
    if (resPutIssued.status === 400) {
      console.log('  ✅ [PASS] PUT en factura ISSUED rechazada → 400 Bad Request');
    } else {
      console.error('  ❌ [FAIL] Se permitió editar factura ISSUED:', resPutIssued);
    }

    console.log('\n--- LIMPIEZA DE DATOS ---');
    await Invoice.deleteMany({ customer: testCustomer._id });
    await Customer.deleteMany({ _id: testCustomer._id });
    await Product.deleteMany({ _id: { $in: [testProduct1._id, testProduct2._id] } });
    console.log('  ✅ Registros de prueba limpios');

    console.log('\n🎉 SUITE DE PRUEBAS HTTP COMPLETADA EXITOSAMENTE.');
  } catch (err) {
    console.error('❌ Error en suite HTTP:', err);
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
  }
}

runHttpTests();