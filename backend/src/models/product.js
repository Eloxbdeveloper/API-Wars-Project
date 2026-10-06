const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    unitMeasureId: {
      type: String,
      default: '70' // Código estándar para Unidades (70 en Factus/DIAN)
    },
    taxRate: {
      type: Number,
      default: 0 // Porcentaje de impuesto (ej. 19 para IVA 19%, 0 para Exento)
    },
    taxId: {
      type: String,
      default: '1' // 1: IVA, 01: Exento/Excluido según catálogo
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Product', productSchema);