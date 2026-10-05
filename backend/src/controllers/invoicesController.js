const mongoose = require('mongoose');
const { InvoiceService } = require('../services/invoiceService');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const createInvoice = async (req, res, next) => {
  try {
    const { customerId, items } = req.body || {};

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'El ID del cliente es obligatorio.'
      });
    }

    if (!isValidObjectId(customerId)) {
      return res.status(400).json({
        success: false,
        message: 'El ID del cliente no es un ObjectId válido de MongoDB.'
      });
    }

    if (Array.isArray(items)) {
      for (const item of items) {
        if (item.productId && !isValidObjectId(item.productId)) {
          return res.status(400).json({
            success: false,
            message: `El productId '${item.productId}' no es un ObjectId válido de MongoDB.`
          });
        }
      }
    }

    const invoice = await InvoiceService.createInvoice(req.body);
    return res.status(201).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    next(error);
  }
};

const getInvoices = async (req, res, next) => {
  try {
    const invoices = await InvoiceService.getInvoices(req.query);
    return res.status(200).json({
      success: true,
      data: invoices
    });
  } catch (error) {
    next(error);
  }
};

const getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'El ID de la factura proporcionado no es un ObjectId válido.'
      });
    }

    const invoice = await InvoiceService.getInvoiceById(id);
    return res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    next(error);
  }
};

const updateInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { customerId, items } = req.body || {};

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'El ID de la factura proporcionado no es un ObjectId válido.'
      });
    }

    if (customerId && !isValidObjectId(customerId)) {
      return res.status(400).json({
        success: false,
        message: 'El ID del cliente no es un ObjectId válido de MongoDB.'
      });
    }

    if (Array.isArray(items)) {
      for (const item of items) {
        if (item.productId && !isValidObjectId(item.productId)) {
          return res.status(400).json({
            success: false,
            message: `El productId '${item.productId}' no es un ObjectId válido de MongoDB.`
          });
        }
      }
    }

    const invoice = await InvoiceService.updateInvoice(id, req.body);
    return res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    next(error);
  }
};

const issueInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'El ID de la factura proporcionado no es un ObjectId válido.'
      });
    }

    const updatedInvoice = await InvoiceService.issueInvoice(id);

    return res.status(200).json({
      success: true,
      data: updatedInvoice
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
      details: error.details || null
    });
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  issueInvoice
};