const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');

const startServer = async () => {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`🚀 Servidor backend ejecutándose en el puerto ${env.PORT}`);
    console.log(`📍 Health Check disponible en: http://localhost:${env.PORT}/api/health`);
  });
};

startServer();