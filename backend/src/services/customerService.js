const Customer = require('../models/Customer');

class CustomerService {
  /**
   * Obtiene la lista de clientes con soporte para paginación opcional
   */
  async getAllCustomers({ page = 1, limit = 10 } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Customer.find().sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Customer.countDocuments()
    ]);

    return {
      items,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  /**
   * Obtiene un cliente por su ID de MongoDB
   */
  async getCustomerById(id) {
    const customer = await Customer.findById(id).lean();
    if (!customer) {
      const error = new Error('Cliente no encontrado');
      error.statusCode = 404;
      throw error;
    }
    return customer;
  }

  /**
   * Crea un cliente verificando no duplicar tipo + número de identificación
   */
  async createCustomer(customerData) {
    const { identificationType, identificationNumber, email, names } = customerData;

    if (!identificationType || !identificationNumber || !email || !names) {
      const error = new Error('Los campos identificationType, identificationNumber, names y email son obligatorios');
      error.statusCode = 400;
      throw error;
    }

    // Verificar si ya existe un cliente con la misma identificación
    const existing = await Customer.findOne({
      identificationType,
      identificationNumber: identificationNumber.trim()
    });

    if (existing) {
      const error = new Error(`Ya existe un cliente con ${identificationType} N° ${identificationNumber}`);
      error.statusCode = 409; // Conflict
      throw error;
    }

    const newCustomer = new Customer(customerData);
    return await newCustomer.save();
  }

  /**
   * Actualiza un cliente existente
   */
  async updateCustomer(id, updateData) {
    // Si se intenta actualizar el documento, verificar que no choque con otro cliente
    if (updateData.identificationType && updateData.identificationNumber) {
      const existing = await Customer.findOne({
        _id: { $ne: id },
        identificationType: updateData.identificationType,
        identificationNumber: updateData.identificationNumber.trim()
      });

      if (existing) {
        const error = new Error(`Ya existe otro cliente con ${updateData.identificationType} N° ${updateData.identificationNumber}`);
        error.statusCode = 409;
        throw error;
      }
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).lean();

    if (!updatedCustomer) {
      const error = new Error('Cliente no encontrado para actualizar');
      error.statusCode = 404;
      throw error;
    }

    return updatedCustomer;
  }
}

module.exports = new CustomerService();