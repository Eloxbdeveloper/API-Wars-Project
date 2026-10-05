const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI || '',
  FACTUS_BASE_URL: process.env.FACTUS_BASE_URL || '',
  FACTUS_USERNAME: process.env.FACTUS_USERNAME || '',
  FACTUS_PASSWORD: process.env.FACTUS_PASSWORD || '',
  FACTUS_CLIENT_ID: process.env.FACTUS_CLIENT_ID || '',
  FACTUS_CLIENT_SECRET: process.env.FACTUS_CLIENT_SECRET || ''
};