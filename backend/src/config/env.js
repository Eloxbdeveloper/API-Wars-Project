require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI,
  FACTUS: {
    BASE_URL: process.env.FACTUS_BASE_URL,
    USERNAME: process.env.FACTUS_USERNAME,
    PASSWORD: process.env.FACTUS_PASSWORD,
    CLIENT_ID: process.env.FACTUS_CLIENT_ID,
    CLIENT_SECRET: process.env.FACTUS_CLIENT_SECRET,
  }
};
