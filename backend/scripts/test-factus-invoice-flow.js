require('dotenv').config();
const mongoose = require('mongoose');

const CustomerModule = require('../src/models/Customer');
const InvoiceModule = require('../src/models/Invoice');
const { InvoiceService } = require('../src/services/invoiceService');

const Customer = CustomerModule.Customer || CustomerModule;
const Invoice = InvoiceModule.Invoice || InvoiceModule;

async function testFullInvoiceFlow() {
  console.log('====================================================');
  console.log('🧪 PRUEBA INTEGRAL ETAPA 5C: FLUJO REAL DE EMISIÓN');
  console.log('====================================================');

  try {
    // 1. Conexión a MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Conexión establecida a MongoDB.');

    // 2. Crear / verificar cliente de prueba
    console.log('\n👤 1. Creando cliente de prueba...');
    const customer = await Customer.create({
      names: 'Empresa Test Colombia S.A.S.',
      identificationType: 'NIT',
      identificationNumber: '901234567',
      verificationDigit: '1',
      email: 'facturacion.prueba@testdomain.com',
      phone: '3001234567',
      municipalityId: '11001'
    });
    console.log(`✅ Cliente creado: ID = ${customer._id}`);

    // 3. Crear factura borrador DRAFT
    console.log('\n📄 2. Creando factura local DRAFT...');
    const refCode = `TEST-FLOW-${Date.now()}`;
    const fakeProductId = new mongoose.Types.ObjectId();

    let draftInvoice = await Invoice.create({
      customer: customer._id,
      referenceCode: refCode,
      status: 'DRAFT',
      items: [
        {
          code: 'SERV-001',
          productId: fakeProductId,
          name: 'Servicio de Consultoría y Desarrollo',
          quantity: 1,
          unitPrice: 200000,
          taxRate: 19
        }
      ]
    });

    console.log(`✅ Factura DRAFT creada localmente:`);
    console.log(`   - ID: ${draftInvoice._id}`);
    console.log(`   - ReferenceCode: ${draftInvoice.referenceCode}`);
    console.log(`   - Status inicial: ${draftInvoice.status}`);

    // 4. Ejecutar el flujo de emisión vía Service
    console.log('\n🚀 3. Ejecutando la emisión formal de la factura...');
    const issuedInvoice = await InvoiceService.issueInvoice(draftInvoice._id);

    console.log('\n🎉 ¡EMISIÓN COMPLETADA EXITOSAMENTE!');
    console.log('----------------------------------------------------');
    console.log(`  - Status final local : ${issuedInvoice.status}`);
    console.log(`  - Factus ID          : ${issuedInvoice.factusId}`);
    console.log(`  - Número de Factura  : ${issuedInvoice.numbering}`);
    console.log(`  - CUFE               : ${issuedInvoice.cufe}`);
    console.log(`  - QR Code URL        : ${issuedInvoice.qrCodeUrl}`);
    console.log(`  - PDF / Public URL   : ${issuedInvoice.pdfUrl}`);
    console.log('----------------------------------------------------');

    // 5. Verificar persistencia real en MongoDB
    console.log('\n🔍 4. Verificando persistencia en MongoDB...');
    const dbInvoice = await Invoice.findById(draftInvoice._id);
    console.log(`  - BD Status: ${dbInvoice.status}`);
    console.log(`  - BD Numbering: ${dbInvoice.numbering}`);

    if (dbInvoice.status === 'ISSUED' && dbInvoice.numbering && dbInvoice.cufe) {
      console.log('✅ Persistencia validada correctamente.');
    } else {
      throw new Error('La factura no se actualizó correctamente en MongoDB.');
    }

    // 6. Verificar que re-emitir la misma factura NO genere duplicados ni falle inesperadamente
    console.log('\n🔄 5. Probando re-emisión de la misma factura (idempotencia)...');
    try {
      await InvoiceService.issueInvoice(draftInvoice._id);
      console.log('❌ Error: debió bloquear la emisión por estar en estado ISSUED.');
    } catch (reIssueErr) {
      console.log(`✅ Bloqueo/Idempotencia verificado correctamente: "${reIssueErr.message}"`);
    }

  } catch (error) {
    console.error('\n❌ ERROR DURANTE LA PRUEBA INTEGRAL:');
    console.error(`Mensaje: ${error.message}`);
    if (error.details) {
      console.error('Detalles:', JSON.stringify(error.details, null, 2));
    }
  } finally {
    console.log('\n🧹 Desconectando MongoDB...');
    await mongoose.disconnect();
    console.log('👋 Prueba finalizada.\n');
    process.exit();
  }
}

testFullInvoiceFlow();