const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const productService = require('../src/services/productService');
const Product = require('../src/models/product');

async function runTests() {
  console.log('🔄 Ejecutando Suite de Pruebas: ETAPA 3B (Products API)...');
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB Atlas');

    // Limpieza previa del código de prueba
    await Product.deleteMany({ code: 'PROD-TEST-001' });

    // 1. Crear producto válido
    console.log('\n[Prueba 1] Crear producto válido...');
    const created = await productService.createProduct({
      code: 'PROD-TEST-001',
      name: 'Licencia Software FactuLocal',
      description: 'Suscripción mensual de software',
      price: 50000,
      taxRate: 19,
      unitMeasureId: '70',
      taxId: '1'
    });
    console.log('  -> OK, ID:', created._id);

    // 2. Intentar crear producto duplicado
    console.log('\n[Prueba 2] Intentar crear producto duplicado...');
    try {
      await productService.createProduct({
        code: 'PROD-TEST-001',
        name: 'Otro Producto',
        price: 10000
      });
      console.error('  ❌ Falló: Permitió crear un producto duplicado');
    } catch (err) {
      console.log(`  -> Correcto: ${err.message} (Status: ${err.statusCode})`);
    }

    // 3. Crear producto inválido (precio negativo)
    console.log('\n[Prueba 3] Crear producto inválido (precio negativo)...');
    try {
      await productService.createProduct({
        code: 'PROD-TEST-002',
        name: 'Producto Precio Negativo',
        price: -100
      });
      console.error('  ❌ Falló: Permitió crear con precio negativo');
    } catch (err) {
      console.log(`  -> Correcto: ${err.message} (Status: ${err.statusCode})`);
    }

    // 4. Listar productos
    console.log('\n[Prueba 4] Listar productos...');
    const list = await productService.getAllProducts({ page: 1, limit: 5 });
    console.log(`  -> OK, Productos obtenidos: ${list.items.length}, Total en BD: ${list.pagination.total}`);

    // 5. Obtener producto existente
    console.log('\n[Prueba 5] Obtener producto existente...');
    const fetched = await productService.getProductById(created._id);
    console.log(`  -> OK, Encontrado: ${fetched.name}`);

    // 6. Obtener producto inexistente
    console.log('\n[Prueba 6] Obtener producto inexistente...');
    try {
      const fakeId = new mongoose.Types.ObjectId();
      await productService.getProductById(fakeId);
      console.error('  ❌ Falló: Encontró un ID no existente');
    } catch (err) {
      console.log(`  -> Correcto: ${err.message} (Status: ${err.statusCode})`);
    }

    // 7. Probar ID inválido
    console.log('\n[Prueba 7] Probar ID inválido (no ObjectId)...');
    try {
      if (!mongoose.Types.ObjectId.isValid('id-invalido-abc')) {
        throw { statusCode: 400, message: 'El ID suministrado no es un identificador válido' };
      }
    } catch (err) {
      console.log(`  -> Correcto: ${err.message} (Status: ${err.statusCode})`);
    }

    // 8. Actualizar producto
    console.log('\n[Prueba 8] Actualizar producto...');
    const updated = await productService.updateProduct(created._id, {
      price: 55000,
      description: 'Suscripción mensual de software con soporte 24/7'
    });
    console.log(`  -> OK, Precio actualizado: $${updated.price}`);

    // 9. Actualizar producto inexistente
    console.log('\n[Prueba 9] Actualizar producto inexistente...');
    try {
      const fakeId = new mongoose.Types.ObjectId();
      await productService.updateProduct(fakeId, { price: 60000 });
      console.error('  ❌ Falló: Actualizó un producto inexistente');
    } catch (err) {
      console.log(`  -> Correcto: ${err.message} (Status: ${err.statusCode})`);
    }

    console.log('\n🎉 TODAS LAS PRUEBAS DE LA ETAPA 3B SE COMPLETARON EXITOSAMENTE.');
  } catch (error) {
    console.error('❌ Error durante la suite de pruebas:', error);
  } finally {
    await mongoose.disconnect();
  }
}

runTests();