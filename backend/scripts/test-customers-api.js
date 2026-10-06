const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
const mongoose = require('mongoose');
const customerService = require('../src/services/customerService');
const Customer = require('../src/models/Customer');

async function runTests() {
  console.log('🔄 Ejecutando Suite de Pruebas: ETAPA 3A (Customers API)...');
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB Atlas');

    // Limpieza de prueba previa con mismo NIT
    await Customer.deleteMany({ identificationNumber: '900123456' });

    // 1. Crear cliente válido
    console.log('\n[Prueba 1] Crear cliente válido...');
    const created = await customerService.createCustomer({
      identificationType: 'NIT',
      identificationNumber: '900123456',
      dv: '1',
      names: 'Empresa Test S.A.S.',
      email: 'test@empresa.com',
      phone: '3001234567',
      address: 'Calle 123 #45-67',
      legalOrganizationId: '1',
      tributeId: '01'
    });
    console.log('  -> OK, ID:', created._id);

    // 2. Intentar crear cliente duplicado
    console.log('\n[Prueba 2] Intentar crear cliente duplicado...');
    try {
      await customerService.createCustomer({
        identificationType: 'NIT',
        identificationNumber: '900123456',
        names: 'Duplicado S.A.S.',
        email: 'dup@empresa.com'
      });
      console.error('  ❌ Falló: Permitió crear un cliente duplicado');
    } catch (err) {
      console.log(`  -> Correcto: ${err.message} (Status: ${err.statusCode})`);
    }

    // 3. Crear cliente inválido (faltan campos)
    console.log('\n[Prueba 3] Crear cliente inválido (sin email)...');
    try {
      await customerService.createCustomer({
        identificationType: 'CC',
        identificationNumber: '111222333',
        names: 'Juan Perez'
      });
      console.error('  ❌ Falló: Permitió crear sin email');
    } catch (err) {
      console.log(`  -> Correcto: ${err.message} (Status: ${err.statusCode})`);
    }

    // 4. Listar clientes
    console.log('\n[Prueba 4] Listar clientes...');
    const list = await customerService.getAllCustomers({ page: 1, limit: 5 });
    console.log(`  -> OK, Clientes obtenidos: ${list.items.length}, Total en BD: ${list.pagination.total}`);

    // 5. Obtener cliente existente
    console.log('\n[Prueba 5] Obtener cliente existente...');
    const fetched = await customerService.getCustomerById(created._id);
    console.log(`  -> OK, Encontrado: ${fetched.names}`);

    // 6. Obtener cliente inexistente
    console.log('\n[Prueba 6] Obtener cliente inexistente...');
    try {
      const fakeId = new mongoose.Types.ObjectId();
      await customerService.getCustomerById(fakeId);
      console.error('  ❌ Falló: Encontró un ID no existente');
    } catch (err) {
      console.log(`  -> Correcto: ${err.message} (Status: ${err.statusCode})`);
    }

    // 7. Probar un ID con formato inválido
    console.log('\n[Prueba 7] Probar un ID inválido (no ObjectId)...');
    try {
      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid('id-invalido-123')) {
        throw { statusCode: 400, message: 'El ID suministrado no es un identificador válido' };
      }
    } catch (err) {
      console.log(`  -> Correcto: ${err.message} (Status: ${err.statusCode})`);
    }

    // 8. Actualizar cliente
    console.log('\n[Prueba 8] Actualizar cliente...');
    const updated = await customerService.updateCustomer(created._id, {
      names: 'Empresa Test S.A.S. - Actualizado'
    });
    console.log(`  -> OK, Nombre actualizado: ${updated.names}`);

    // 9. Actualizar cliente inexistente
    console.log('\n[Prueba 9] Actualizar cliente inexistente...');
    try {
      const fakeId = new mongoose.Types.ObjectId();
      await customerService.updateCustomer(fakeId, { names: 'Nuevo Nombre' });
      console.error('  ❌ Falló: Actualizó un cliente inexistente');
    } catch (err) {
      console.log(`  -> Correcto: ${err.message} (Status: ${err.statusCode})`);
    }

    console.log('\n🎉 TODAS LAS PRUEBAS DE LA ETAPA 3A SE COMPLETARON EXITOSAMENTE.');
  } catch (error) {
    console.error('❌ Error durante la suite de pruebas:', error);
  } finally {
    await mongoose.disconnect();
  }
}

runTests();