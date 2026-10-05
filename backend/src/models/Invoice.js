const mongoose = require('mongoose');

// Placeholder de Schema para Facturas
const invoiceSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  items: [],
  total: { type: Number, default: 0 },
  factus_id: { type: String },
  status: { type: String, default: 'DRAFT' }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
