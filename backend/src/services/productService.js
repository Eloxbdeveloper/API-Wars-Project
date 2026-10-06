const Product = require('../models/product');

class ProductService {
  /**
   * Obtiene productos con paginación básica
   */
  async getAllProducts({ page = 1, limit = 10 } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Product.countDocuments()
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
   * Obtiene un producto por ID
   */
  async getProductById(id) {
    const product = await Product.findById(id).lean();
    if (!product) {
      const error = new Error('Producto no encontrado');
      error.statusCode = 404;
      throw error;
    }
    return product;
  }

  /**
   * Crea un nuevo producto validando campos requeridos y código único
   */
  async createProduct(productData) {
    const { code, name, price } = productData;

    if (!code || !name || price === undefined || price === null) {
      const error = new Error('Los campos code, name y price son obligatorios');
      error.statusCode = 400;
      throw error;
    }

    if (typeof price !== 'number' || price < 0) {
      const error = new Error('El precio debe ser un número mayor o igual a 0');
      error.statusCode = 400;
      throw error;
    }

    // Verificar si el código de producto ya existe
    const existing = await Product.findOne({ code: code.trim() });
    if (existing) {
      const error = new Error(`Ya existe un producto con el código "${code}"`);
      error.statusCode = 409; // Conflict
      throw error;
    }

    const newProduct = new Product({
      ...productData,
      code: code.trim()
    });

    return await newProduct.save();
  }

  /**
   * Actualiza un producto existente
   */
  async updateProduct(id, updateData) {
    if (updateData.price !== undefined) {
      if (typeof updateData.price !== 'number' || updateData.price < 0) {
        const error = new Error('El precio debe ser un número mayor o igual a 0');
        error.statusCode = 400;
        throw error;
      }
    }

    // Si intenta actualizar el código, verificar que no colisione con otro producto
    if (updateData.code) {
      const existing = await Product.findOne({
        _id: { $ne: id },
        code: updateData.code.trim()
      });

      if (existing) {
        const error = new Error(`Ya existe otro producto con el código "${updateData.code}"`);
        error.statusCode = 409;
        throw error;
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).lean();

    if (!updatedProduct) {
      const error = new Error('Producto no encontrado para actualizar');
      error.statusCode = 404;
      throw error;
    }

    return updatedProduct;
  }
}

module.exports = new ProductService();