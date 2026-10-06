const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Invoice = require('../src/models/Invoice');
const Payment = require('../src/models/Payment');
const Customer = require('../src/models/Customer');
const Product = require('../src/models/product');

async function run() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  await Payment.deleteMany({ referenceCode: 'INV-1791275455640-5786' });
  await Invoice.deleteMany({ _id: '6ac4b1bf1f39354a5d97c85c' });
  await Customer.deleteMany({ _id: '6ac4b1aa1f39354a5d97c855' });
  await Product.deleteMany({ _id: '6ac4b1b51f39354a5d97c858' });
  await mongoose.disconnect();
  console.log('Limpieza OK');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
