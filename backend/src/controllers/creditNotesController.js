const mongoose = require('mongoose');
const { CreditNoteService } = require('../services/creditNoteService');
const { CORRECTION_CONCEPTS } = require('../integrations/factus/creditNotes');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const createCreditNote = async (req, res, next) => {
  try {
    const { invoiceId, correctionConceptCode, observation } = req.body || {};

    if (!invoiceId) {
      return res.status(400).json({ success: false, message: 'El ID de la factura es obligatorio.' });
    }
    if (!isValidObjectId(invoiceId)) {
      return res.status(400).json({ success: false, message: 'El ID de la factura no es un ObjectId válido.' });
    }
    if (correctionConceptCode && !CORRECTION_CONCEPTS[String(correctionConceptCode)]) {
      return res.status(400).json({
        success: false,
        message: `Código de concepto de corrección inválido. Valores permitidos: ${Object.keys(CORRECTION_CONCEPTS).join(', ')}.`
      });
    }

    const note = await CreditNoteService.createCreditNote({ invoiceId, correctionConceptCode, observation });
    return res.status(201).json({ success: true, data: note });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error al crear la nota crédito',
      details: error.details || null
    });
  }
};

const getCreditNotes = async (req, res, next) => {
  try {
    const notes = await CreditNoteService.getCreditNotes(req.query);
    return res.status(200).json({ success: true, data: notes });
  } catch (error) {
    next(error);
  }
};

const getCreditNoteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'El ID de la nota crédito no es un ObjectId válido.' });
    }
    const note = await CreditNoteService.getCreditNoteById(id);
    return res.status(200).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

const getCorrectionConcepts = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: Object.entries(CORRECTION_CONCEPTS).map(([code, name]) => ({ code, name }))
  });
};

module.exports = {
  createCreditNote,
  getCreditNotes,
  getCreditNoteById,
  getCorrectionConcepts
};
