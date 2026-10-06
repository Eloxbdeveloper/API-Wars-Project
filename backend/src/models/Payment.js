const mongoose = require('mongoose');

// Estados documentados oficialmente por Factus Pay para un recaudo.
const PAYMENT_STATUSES = ['started', 'ready', 'paid', 'failed', 'rejected'];

const paymentSchema = new mongoose.Schema(
  {
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
      index: true
    },
    referenceCode: {
      type: String,
      required: true,
      unique: true,   // índice único: un solo cobro por factura/referencia
      index: true,
      trim: true,
      maxlength: 100
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'started',
      index: true
    },
    qr: { type: String, default: null }, // data URI real devuelto por Factus Pay
    factusResponse: { type: Object, default: null },
    errorMessage: { type: String, default: null },
    paidAt: { type: Date, default: null },
    invoiceIssuedAt: { type: Date, default: null },
    invoiceIssueError: { type: String, default: null },
    lastSyncedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
module.exports.PAYMENT_STATUSES = PAYMENT_STATUSES;
