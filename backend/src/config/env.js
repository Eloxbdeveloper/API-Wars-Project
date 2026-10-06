const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI || '',
  FACTUS_BASE_URL: process.env.FACTUS_BASE_URL || '',
  FACTUS_USERNAME: process.env.FACTUS_USERNAME || '',
  FACTUS_PASSWORD: process.env.FACTUS_PASSWORD || '',
  FACTUS_CLIENT_ID: process.env.FACTUS_CLIENT_ID || '',
  FACTUS_CLIENT_SECRET: process.env.FACTUS_CLIENT_SECRET || '',
  // Factus Pay (autenticación independiente de Factus API)
  FACTUS_PAY_BASE_URL: process.env.FACTUS_PAY_BASE_URL || 'https://pay-api-sandbox.factus.com.co',
  FACTUS_PAY_EMAIL: process.env.FACTUS_PAY_EMAIL || '',
  FACTUS_PAY_PASSWORD: process.env.FACTUS_PAY_PASSWORD || ''
};