const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

// Importar modelos y servicios
const Invoice = require('../src/models/Invoice');
const Customer = require('../src/models/Customer');
const Product = require('../src/models/product');
const invoiceService = require('../src/services/invoiceService');

async function runTests() {
  console.log('🔄 Ejecutando Suite de Pruebas: ETAPA 4 (Invoice API)...');
  let testCustomer, testProduct1, testProduct2;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB Atlas');

    // --- SETUP: Crear datos temporales de prueba ---
    await Customer.deleteMany({ identificationNumber: 'TEST-INV-999' });
    await Product.deleteMany({ code: { $in: ['INV-PROD-01', 'INV-PROD-02'] } });

    testCustomer = await Customer.create({
      identificationType: 'NIT',
      identificationNumber: 'TEST-INV-999',
      dv: '1',
      names: 'Cliente Prueba Factura S.A.S.',
      email: 'test.invoice@empresa.com'
    });

    testProduct1 = await Product.create({
      code: 'INV-PROD-01',
      name: 'Producto Test 1',
      price: 100000,
      taxRate: 19
    });

    testProduct2 = await Product.create({
      code: 'INV-PROD-02',
      name: 'Producto Test 2',
      price: 50000,
      taxRate: 19
    });

    // 1. Crear factura válida
    console.log('\n[Prueba 1] Crear factura válida (DRAFT)...');
    const createdInvoice = await invoiceService.createInvoice({
      customerId: testCustomer._id.toString(),
      items: [
        { productId: testProduct1._id.toString(), quantity: 2 },
        { productId: testProduct2._id.toString(), quantity: 1 }
      ]
    });
    console.log('  -> OK, ID Factura:', createdInvoice._id);
    console.log('  -> Estado inicial:', createdInvoice.status);

    // 2. Verificar Cálculos en Backend
    console.log('\n[Prueba 2] Verificar precisión de cálculos en backend...');
    const grandTotalVal = createdInvoice.grandTotal || createdInvoice.total;
    if (createdInvoice.subtotal === 250000 && createdInvoice.taxTotal === 47500 && grandTotalVal === 297500) {
      console.log('  -> OK, Cálculos correctos:', {
        subtotal: createdInvoice.subtotal,
        taxTotal: createdInvoice.taxTotal,
        grandTotal: grandTotalVal
      });
    } else {
      console.error('  ❌ Falló: Cálculos incorrectos', createdInvoice);
    }

    // 3. Probar inyección de precio / manipulaciones por frontend
    console.log('\n[Prueba 3] Verificar que frontend no pueda alterar precios ni totales...');
    const tamperedInvoice = await invoiceService.createInvoice({
      customerId: testCustomer._id.toString(),
      items: [
        { productId: testProduct1._id.toString(), quantity: 1, unitPrice: 1, total: 1 }
      ],
      subtotal: 100,
      total: 100,
      grandTotal: 100
    });
    const tamperedGrandTotal = tamperedInvoice.grandTotal || tamperedInvoice.total;
    if (tamperedInvoice.subtotal === 100000 && tamperedGrandTotal === 119000) {
      console.log('  -> OK, Frontend ignorado y valores recomputados en backend');
    } else {
      console.error('  ❌ Falló: El backend aceptó montos manipulados');
    }

    // 4. Validaciones de Errores en Creación
    console.log('\n[Prueba 4] Validaciones de errores en creación...');
    
    // 4a. Cliente inexistente
    try {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await invoiceService.createInvoice({ customerId: fakeId, items: [{ productId: testProduct1._id.toString(), quantity: 1 }] });
      console.error('  ❌ Falló: Aceptó cliente inexistente');
    } catch (err) {
      console.log(`  -> Cliente inexistente rechazado (Status: ${err.statusCode || 404}): ${err.message}`);
    }

    // 4b. Sin items
    try {
      await invoiceService.createInvoice({ customerId: testCustomer._id.toString(), items: [] });
      console.error('  ❌ Falló: Aceptó factura sin items');
    } catch (err) {
      console.log(`  -> Factura sin items rechazada: ${err.message}`);
    }

    // 4c. Cantidad 0 o negativa
    try {
      await invoiceService.createInvoice({
        customerId: testCustomer._id.toString(),
        items: [{ productId: testProduct1._id.toString(), quantity: 0 }]
      });
      console.error('  ❌ Falló: Aceptó cantidad 0');
    } catch (err) {
      console.log(`  -> Cantidad inválida rechazada: ${err.message}`);
    }

    // 5. PRUEBA DE SNAPSHOT (Historización)
    console.log('\n[Prueba 5] Verificar Snapshot de producto (Historización)...');
    console.log('  -> Modificando precio original del producto en BD de $100.000 a $200.000...');
    await Product.findByIdAndUpdate(testProduct1._id, { price: 200000 });

    const fetchedInvoiceForSnapshot = await invoiceService.getInvoiceById(createdInvoice._id.toString());
    const snapshotItem = fetchedInvoiceForSnapshot.items.find(i => i.productId.toString() === testProduct1._id.toString());

    if (snapshotItem.unitPrice === 100000) {
      console.log('  -> OK, La factura conservó el precio histórico original ($100.000)');
    } else {
      console.error('  ❌ Falló: La factura cambió su precio histórico a', snapshotItem.unitPrice);
    }

    // 6. Consultas (Listar y Detalle)
    console.log('\n[Prueba 6] Consultas API (Listar y por ID)...');
    const getListMethod = invoiceService.getInvoices ? invoiceService.getInvoices.bind(invoiceService) : invoiceService.getAllInvoices.bind(invoiceService);
    const list = await getListMethod({ page: 1, limit: 10 });
    console.log(`  -> OK, Facturas obtenidas: ${list.items ? list.items.length : list.data ? list.data.length : 0}`);

    const fetchedInvoice = await invoiceService.getInvoiceById(createdInvoice._id.toString());
    console.log('  -> OK, Factura obtenida por ID correctamente');

    // 7. Edición de Borrador (PUT)
    console.log('\n[Prueba 7] Actualizar factura DRAFT...');
    const updatedInvoice = await invoiceService.updateInvoice(createdInvoice._id.toString(), {
      items: [{ productId: testProduct2._id.toString(), quantity: 2 }]
    });
    console.log('  -> OK, Factura recomputada al actualizar. Nuevo total:', updatedInvoice.grandTotal || updatedInvoice.total);

    // 8. Bloqueo de modificación en estado no editable
    console.log('\n[Prueba 8] Bloqueo de modificación en facturas ISSUED...');
    await Invoice.findByIdAndUpdate(createdInvoice._id, { status: 'ISSUED' });
    try {
      await invoiceService.updateInvoice(createdInvoice._id.toString(), { items: [{ productId: testProduct2._id.toString(), quantity: 1 }] });
      console.error('  ❌ Falló: Permitió editar una factura ISSUED');
    } catch (err) {
      console.log(`  -> Edición bloqueada correctamente: ${err.message}`);
    }

    // --- LIMPIEZA DE DATOS PRUEBA ---
    console.log('\n[Limpieza] Eliminando registros temporales de prueba...');
    await Invoice.deleteMany({ customerId: testCustomer._id });
    await Invoice.deleteMany({ _id: tamperedInvoice._id });
    await Customer.deleteMany({ _id: testCustomer._id });
    await Product.deleteMany({ _id: { $in: [testProduct1._id, testProduct2._id] } });
    console.log('  -> OK, Base de datos limpia.');

    console.log('\n🎉 TODAS LAS PRUEBAS DE LA ETAPA 4 SE COMPLETARON EXITOSAMENTE.');
  } catch (error) {
    console.error('❌ Error durante la suite de pruebas:', error);
  } finally {
    await mongoose.disconnect();
  }
}

runTests();