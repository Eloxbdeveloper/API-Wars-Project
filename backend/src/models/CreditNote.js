const mongoose = require('mongoose');

const creditNoteSchema = new mongoose.Schema(
  {
    referenceCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
      index: true
    },
    billNumber: { type: String, default: null }, // Número de la factura referenciada (ej: SETP990023407)
    numbering: { type: String, default: null },  // Número de la nota crédito (ej: CRTE781)
    cude: { type: String, default: null },       // CUDE devuelto por Factus/DIAN
    status: {
      type: String,
      enum: ['ISSUED', 'ERROR'],
      default: 'ISSUED',
      index: true
    },
    total: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    correctionConceptCode: { type: String, default: null },
    observation: { type: String, default: null },
    customerNames: { type: String, default: null },
    customerIdentification: { type: String, default: null },
    qrCodeUrl: { type: String, default: null },  // URL de verificación DIAN devuelta por Factus
    publicUrl: { type: String, default: null },  // Documento público en Factus
    factusResponse: { type: Object, default: null },
    errorMessage: { type: String, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CreditNote', creditNoteSchema);
