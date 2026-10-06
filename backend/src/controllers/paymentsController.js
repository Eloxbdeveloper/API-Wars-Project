const mongoose = require('mongoose');
const { PaymentService } = require('../services/paymentService');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * POST /api/payments  { invoiceId }
 * Crea (o reutiliza) el cobro en Factus Pay para la factura indicada.
 */
const createPayment = async (req, res) => {
  try {
    const { invoiceId } = req.body || {};

    if (!invoiceId) {
      return res.status(400).json({ success: false, message: 'El ID de la factura es obligatorio.' });
    }
    if (!isValidObjectId(invoiceId)) {
      return res.status(400).json({ success: false, message: 'El ID de la factura no es un ObjectId válido.' });
    }

    const { payment, created } = await PaymentService.createPayment(invoiceId);
    return res.status(created ? 201 : 200).json({ success: true, data: payment });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'No se pudo generar el cobro.',
      details: error.details || null
    });
  }
};

/**
 * GET /api/payments/:referenceCode
 * Devuelve el cobro y sincroniza su estado con Factus Pay.
 * Si el pago está confirmado (paid), dispara la emisión de la factura.
 */
const getPayment = async (req, res) => {
  try {
    const { referenceCode } = req.params;
    if (!referenceCode) {
      return res.status(400).json({ success: false, message: 'La referencia del cobro es obligatoria.' });
    }

    let payment;
    try {
      payment = await PaymentService.syncPaymentStatus(referenceCode);
    } catch (syncError) {
      // El cobro existe pero Factus Pay no respondió: no se oculta el error.
      if (syncError.status === 404) throw syncError;

      const local = await PaymentService.getPayment(referenceCode).catch(() => null);
      return res.status(502).json({
        success: false,
        message: `No se pudo consultar el estado del cobro en Factus Pay: ${syncError.message}`,
        data: local
      });
    }

    return res.status(200).json({ success: true, data: payment });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'No se pudo obtener el cobro.'
    });
  }
};

/**
 * GET /api/payments?invoice=&status=
 */
const getPayments = async (req, res) => {
  try {
    const payments = await PaymentService.getPayments(req.query);
    return res.status(200).json({ success: true, data: payments });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'No se pudieron listar los cobros.'
    });
  }
};

module.exports = { createPayment, getPayment, getPayments };
