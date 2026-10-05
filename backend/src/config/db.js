const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  try {
    // Si no hay URI, saltamos la conexión para que el servidor pueda arrancar en Fase 1
    if (!env.MONGO_URI) {
      console.warn('⚠️ MONGO_URI no definida. Base de datos no conectada (Fase 1).');
      return;
    }
    
    await mongoose.connect(env.MONGO_URI);
    console.log('✅ Conexión a MongoDB establecida');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
