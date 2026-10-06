const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    identificationType: {
      type: String,
      required: true,
      enum: ['CC', 'NIT', 'CE', 'PASAPORTE', 'TI'],
      default: 'CC'
    },
    identificationNumber: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    dv: {
      type: String,
      trim: true,
      default: null // Dígito de verificación (requerido para NIT)
    },
    names: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    legalOrganizationId: {
      type: String,
      enum: ['1', '2'], // 1: Persona Jurídica, 2: Persona Natural
      default: '2'
    },
    tributeId: {
      type: String,
      default: '21' // 21: No aplica / Simplificado, 01: IVA
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Customer', customerSchema);