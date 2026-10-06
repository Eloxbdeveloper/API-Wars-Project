const mongoose = require('mongoose');
const productService = require('../services/productService');

const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('El ID suministrado no es un identificador válido');
    error.statusCode = 400;
    throw error;
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await productService.getAllProducts({ page, limit });
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id);
    const product = await productService.getProductById(id);
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const newProduct = await productService.createProduct(req.body);
    res.status(201).json({
      success: true,
      data: newProduct
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id);
    const updatedProduct = await productService.updateProduct(id, req.body);
    res.status(200).json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};