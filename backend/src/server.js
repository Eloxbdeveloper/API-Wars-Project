const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');

async function startServer() {
  await connectDB();
  
  app.listen(env.PORT, () => {
    console.log(`✅ Server running on port ${env.PORT}`);
    console.log(`✅ Health check: http://localhost:${env.PORT}/api/health`);
  });
}

startServer();
