const CustomerModule = require('../models/Customer');
const InvoiceModule = require('../models/Invoice');
const Product = require('../models/product');

const Customer = CustomerModule.Customer || CustomerModule;
const Invoice = InvoiceModule.Invoice || InvoiceModule;

const { transmitInvoiceToFactus } = require('../integrations/factus/invoices');

class InvoiceService {
  /**
   * Crea un borrador de factura (DRAFT).
   * Realiza la búsqueda del cliente, snapshot de productos desde MongoDB, 
   * generación de referenceCode e impide manipulación de precios desde el cliente.
   */
  static async createInvoice(data) {
    const { customerId, items } = data;

    // 1. Validar y buscar el cliente
    const customer = await Customer.findById(customerId);
    if (!customer) {
      const error = new Error('El cliente asociado no fue encontrado.');
      error.status = 404;
      throw error;
    }

    // 2. Validar ítems
    if (!Array.isArray(items) || items.length === 0) {
      const error = new Error('La factura debe contener al menos un ítem.');
      error.status = 400;
      throw error;
    }

    // 3. Construir el snapshot de los productos consultándolos directamente de la base de datos
    const processedItems = [];
    for (const item of items) {
      if (!item.productId) {
        const error = new Error('Cada ítem debe incluir un productId.');
        error.status = 400;
        throw error;
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        const error = new Error(`El producto con ID ${item.productId} no fue encontrado.`);
        error.status = 404;
        throw error;
      }

      const quantity = parseInt(item.quantity, 10);
      if (isNaN(quantity) || quantity <= 0) {
        const error = new Error('La cantidad debe ser un número entero mayor a 0.');
        error.status = 400;
        throw error;
      }

      // Snapshot protegido contra manipulación de precios desde el frontend
      processedItems.push({
        productId: product._id,
        code: product.code,
        name: product.name,
        quantity: quantity,
        unitPrice: product.price, // Precio oficial de MongoDB
        taxRate: product.taxRate ?? 19 // Tasa impositiva oficial
      });
    }

    // 4. Generar referenceCode único
    const referenceCode = `INV-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;

    // 5. Crear la factura (el middleware pre('validate') de Mongoose calculará subtotales e impuestos automáticamente)
    const newInvoice = new Invoice({
      referenceCode,
      customer: customer._id,
      items: processedItems,
      status: 'DRAFT'
    });

    await newInvoice.save();
    return await Invoice.findById(newInvoice._id).populate('customer');
  }

  static async getInvoices(query = {}) {
    return await Invoice.find(query).populate('customer');
  }

  static async getInvoiceById(id) {
    return await Invoice.findById(id).populate('customer');
  }

  /**
   * Actualiza un borrador de factura (DRAFT). 
   * Bloquea la edición si la factura ya se encuentra emitida (ISSUED).
   */
  static async updateInvoice(id, data) {
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      const error = new Error('La factura especificada no existe.');
      error.status = 404;
      throw error;
    }

    if (invoice.status === 'ISSUED') {
      const error = new Error('No se puede modificar una factura que ya ha sido emitida.');
      error.status = 400;
      throw error;
    }

    const { customerId, items } = data;

    if (customerId) {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        const error = new Error('El cliente asociado no fue encontrado.');
        error.status = 404;
        throw error;
      }
      invoice.customer = customer._id;
    }

    if (items && Array.isArray(items)) {
      if (items.length === 0) {
        const error = new Error('La factura debe contener al menos un ítem.');
        error.status = 400;
        throw error;
      }

      const processedItems = [];
      for (const item of items) {
        if (!item.productId) {
          const error = new Error('Cada ítem debe incluir un productId.');
          error.status = 400;
          throw error;
        }

        const product = await Product.findById(item.productId);
        if (!product) {
          const error = new Error(`El producto con ID ${item.productId} no fue encontrado.`);
          error.status = 404;
          throw error;
        }

        const quantity = parseInt(item.quantity, 10);
        if (isNaN(quantity) || quantity <= 0) {
          const error = new Error('La cantidad debe ser un número entero mayor a 0.');
          error.status = 400;
          throw error;
        }

        processedItems.push({
          productId: product._id,
          code: product.code,
          name: product.name,
          quantity: quantity,
          unitPrice: product.price,
          taxRate: product.taxRate ?? 19
        });
      }
      invoice.items = processedItems;
    }

    await invoice.save(); // Dispara validación y recálculo automático de totales
    return await Invoice.findById(invoice._id).populate('customer');
  }

  /**
   * Emite una factura electrónica ante Factus / DIAN.
   * Respetando idempotencia mediante referenceCode y actualización local de estado.
   */
  static async issueInvoice(invoiceId) {
    // 1. Buscar la factura local
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      const error = new Error('La factura especificada no existe.');
      error.status = 404;
      throw error;
    }

    // 2. Validaciones de estado previo
    if (invoice.status === 'ISSUED') {
      const error = new Error('La factura ya ha sido emitida previamente y no se puede volver a emitir.');
      error.status = 400;
      throw error;
    }

    if (invoice.status === 'CANCELLED') {
      const error = new Error('No se puede emitir una factura en estado CANCELADA.');
      error.status = 400;
      throw error;
    }

    // 3. Buscar cliente asociado
    const customerTargetId = invoice.customer || invoice.customerId;
    const customer = await Customer.findById(customerTargetId);

    if (!customer) {
      const error = new Error('El cliente asociado a la factura no fue encontrado.');
      error.status = 400;
      throw error;
    }

    try {
      // 4. Transmitir a Factus
      const result = await transmitInvoiceToFactus(invoice, customer);

      // Extraer datos desglosando 'data', 'bill' y 'links'
      const responseData = result?.data || result || {};
      const innerData = responseData.data || responseData;
      const bill = innerData.bill || {};
      const links = innerData.links || responseData.links || {};

      // 5. Actualización exitosa en MongoDB
      invoice.status = 'ISSUED';

      const rawId = bill.id ?? innerData.id ?? responseData.id;
      invoice.factusId = rawId !== undefined && rawId !== null ? String(rawId) : null;

      invoice.numbering =
        innerData.number ||
        bill.number ||
        responseData.number ||
        null;

      invoice.cufe =
        innerData.cufe ||
        bill.cufe ||
        responseData.cufe ||
        null;

      const rawQr =
        links.qr ||
        bill.qr ||
        bill.qr_image ||
        innerData.qr;

      invoice.qrCodeUrl = typeof rawQr === 'object' && rawQr !== null
        ? (rawQr.qr || rawQr.url || rawQr.image || JSON.stringify(rawQr))
        : (rawQr || null);

      invoice.pdfUrl =
        links.public_url ||
        bill.public_url ||
        bill.pdf_url ||
        innerData.public_url ||
        null;

      invoice.factusResponse = result;
      invoice.errorMessage = null;

      await invoice.save();
      return invoice;

    } catch (error) {
      // 6. Manejo de idempotencia y respuestas de Factus (HTTP 409 / duplicados)
      const errorDetails = error.details || error.response?.data || {};
      const rawErrorPayload = errorDetails.data || errorDetails;
      const factusErrorData = rawErrorPayload.data || rawErrorPayload;
      const existingBill = factusErrorData.bill || factusErrorData;
      const existingLinks = factusErrorData.links || {};

      if (
        error.status === 409 || 
        existingBill?.cufe || 
        (error.message && error.message.toLowerCase().includes('ya fue creada'))
      ) {
        if (existingBill?.cufe || existingBill?.number || existingBill?.id) {
          invoice.status = 'ISSUED';

          const rawId = existingBill.id ?? factusErrorData.id;
          invoice.factusId = rawId !== undefined && rawId !== null ? String(rawId) : null;

          invoice.numbering = existingBill.number || existingBill.full_number || factusErrorData.number || null;
          invoice.cufe = existingBill.cufe || factusErrorData.cufe || null;
          
          const rawQr = existingLinks.qr || existingBill.qr || existingBill.qr_image || factusErrorData.qr;
          invoice.qrCodeUrl = typeof rawQr === 'object' && rawQr !== null
            ? (rawQr.qr || rawQr.url || rawQr.image || null)
            : (rawQr || null);

          invoice.pdfUrl = existingLinks.public_url || existingBill.public_url || existingBill.pdf_url || factusErrorData.public_url || null;

          invoice.factusResponse = errorDetails;
          invoice.errorMessage = null;

          await invoice.save();
          return invoice;
        }
      }

      invoice.status = 'ERROR';
      invoice.errorMessage = error.message || 'Error al procesar la factura en Factus';
      invoice.factusResponse = {
        error: error.message,
        details: errorDetails,
        timestamp: new Date()
      };
      await invoice.save();

      throw error;
    }
  }
}

module.exports = { InvoiceService, issueInvoice: InvoiceService.issueInvoice };