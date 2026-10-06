const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  if (!env.MONGO_URI) {
    console.warn('⚠️  MONGO_URI no está configurada en las variables de entorno. Operando sin base de datos por ahora.');
    return false;
  }

  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    console.log(`✅ MongoDB conectado exitosamente: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ Error de conexión a MongoDB: ${error.message}`);
    return false;
  }
};

module.exports = connectDB;