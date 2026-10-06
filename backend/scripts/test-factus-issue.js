require('dotenv').config();
const mongoose = require('mongoose');

// Importaciones
const CustomerModule = require('../src/models/Customer');
const InvoiceModule = require('../src/models/Invoice');

const Customer = CustomerModule.Customer || CustomerModule;
const Invoice = InvoiceModule.Invoice || InvoiceModule;

// IMPORTACIÓN DIRECTA DE LA INTEGRACIÓN
const { buildFactusInvoicePayload, transmitInvoiceToFactus } = require('../src/integrations/factus/invoices');

async function testFactusIntegration() {
  console.log('----------------------------------------------------');
  console.log('🧪 INICIANDO PRUEBA DIRECTA DE DTO FACTUS V2');
  console.log('----------------------------------------------------');

  try {
    // 1. Conexión
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Conexión establecida a MongoDB.');

    // 2. Cliente de prueba
    console.log('\n👤 1. Creando / verificando cliente de prueba Sandbox...');
    const customer = await Customer.create({
      names: 'Empresa Test Colombia S.A.S.',
      name: 'Empresa Test Colombia S.A.S.',
      identificationType: 'NIT',
      identificationNumber: '901234567',
      verificationDigit: '1',
      email: 'facturacion.prueba@testdomain.com',
      phone: '3001234567',
      municipalityId: '11001'
    });
    console.log(`✅ Cliente creado con ID: ${customer._id}`);

    // 3. Factura Borrador
    console.log('\n📄 2. Creando borrador de factura (DRAFT)...');
    const fakeProductId = new mongoose.Types.ObjectId();

    const invoice = await Invoice.create({
      customer: customer._id,
      customerId: customer._id,
      referenceCode: `TEST-REF-${Date.now()}`,
      status: 'DRAFT',
      notes: 'Factura de prueba de integración Etapa 5',
      grandTotal: 238000,
      totalAmount: 238000,
      items: [
        {
          code: 'SERV-001',
          productId: fakeProductId,
          name: 'Servicio de Desarrollo Web / Integración API',
          quantity: 1,
          unitPrice: 200000,
          taxRate: 19
        }
      ]
    });
    console.log(`✅ Factura creada localmente en borrador con ID: ${invoice._id}`);

    // 4. Verificación del Payload antes de transmitir
    const payload = buildFactusInvoicePayload(invoice, customer);
    console.log('\n📦 PAYLOAD CONSTRUIDO QUE SE ENVIARÁ:');
    console.log(JSON.stringify(payload, null, 2));

    // 5. Transmisión directa a la API
    console.log(`\n🚀 3. Transmitiendo directamente a la API de Factus...`);
    const response = await transmitInvoiceToFactus(invoice, customer);

    console.log('\n🎉 ¡RESPUESTA RECIBIDA DE FACTUS!');
    console.log('----------------------------------------------------');
    console.log(JSON.stringify(response, null, 2));
    console.log('----------------------------------------------------');

  } catch (error) {
    console.error('\n❌ ERROR DURANTE LA PRUEBA DIRECTA:');
    console.error(`Mensaje: ${error.message}`);
    if (error.details) {
      console.error('\n📋 DETALLES RETORNADOS POR FACTUS:');
      console.error(JSON.stringify(error.details, null, 2));
    }
  } finally {
    console.log('\n🧹 Limpiando conexión a la base de datos...');
    await mongoose.disconnect();
    console.log('👋 Prueba finalizada.\n');
    process.exit();
  }
}

testFactusIntegration();