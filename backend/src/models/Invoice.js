const mongoose = require('mongoose');

// Helper para evitar errores de redondeo en JavaScript de coma flotante
const round2 = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

const invoiceItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, default: 0, min: 0 }, // Ej: 19 para 19%
    subtotal: { type: Number, required: true },
    taxAmount: { type: Number, required: true },
    total: { type: Number, required: true }
  },
  { _id: false } // Evita crear un _id por cada subdocumento de ítem
);

const invoiceSchema = new mongoose.Schema(
  {
    referenceCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true
    },
    items: {
      type: [invoiceItemSchema],
      validate: [v => Array.isArray(v) && v.length > 0, 'La factura debe contener al menos un ítem.']
    },
    subtotal: { type: Number, required: true, default: 0 },
    taxTotal: { type: Number, required: true, default: 0 },
    grandTotal: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['DRAFT', 'ISSUED', 'ERROR', 'CANCELLED'],
      default: 'DRAFT',
      index: true
    },
    // Datos retornados tras la emisión exitosa en Factus
    factusId: { type: String, default: null },
    numbering: { type: String, default: null }, // Ej: SETT-1024
    cufe: { type: String, default: null },
    qrCodeUrl: { type: String, default: null },
    pdfUrl: { type: String, default: null },
    factusResponse: { type: Object, default: null },
    errorMessage: { type: String, default: null }
  },
  { timestamps: true }
);

// Middleware pre-validate: Recalcula subtotales e impuestos automáticamente antes de guardar
invoiceSchema.pre('validate', function (next) {
  if (this.items && this.items.length > 0) {
    let subtotalAcc = 0;
    let taxTotalAcc = 0;

    this.items.forEach((item) => {
      item.subtotal = round2(item.quantity * item.unitPrice);
      item.taxAmount = round2(item.subtotal * (item.taxRate / 100));
      item.total = round2(item.subtotal + item.taxAmount);

      subtotalAcc += item.subtotal;
      taxTotalAcc += item.taxAmount;
    });

    this.subtotal = round2(subtotalAcc);
    this.taxTotal = round2(taxTotalAcc);
    this.grandTotal = round2(subtotalAcc + taxTotalAcc);
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);