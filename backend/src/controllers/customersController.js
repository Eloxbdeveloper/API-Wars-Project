const mongoose = require('mongoose');
const customerService = require('../services/customerService');

// Middleware interno para validar ObjectId de Mongoose
const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('El ID suministrado no es un identificador válido');
    error.statusCode = 400;
    throw error;
  }
};

exports.getCustomers = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await customerService.getAllCustomers({ page, limit });
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id);
    const customer = await customerService.getCustomerById(id);
    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

exports.createCustomer = async (req, res, next) => {
  try {
    const newCustomer = await customerService.createCustomer(req.body);
    res.status(201).json({
      success: true,
      data: newCustomer
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id);
    const updatedCustomer = await customerService.updateCustomer(id, req.body);
    res.status(200).json({
      success: true,
      data: updatedCustomer
    });
  } catch (error) {
    next(error);
  }
};