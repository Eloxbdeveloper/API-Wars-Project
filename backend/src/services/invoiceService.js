const CustomerModule = require('../models/Customer');
const InvoiceModule = require('../models/Invoice');

const Customer = CustomerModule.Customer || CustomerModule;
const Invoice = InvoiceModule.Invoice || InvoiceModule;

const { transmitInvoiceToFactus } = require('../integrations/factus/invoices');

class InvoiceService {
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

      // ID numérico asignado por Factus (data.bill.id)
      const rawId = bill.id ?? innerData.id ?? responseData.id;
      invoice.factusId = rawId !== undefined && rawId !== null ? String(rawId) : null;

      // Número consecutivo de la factura (ej. SETP990023274)
      invoice.numbering =
        innerData.number ||
        bill.number ||
        responseData.number ||
        null;

      // CUFE
      invoice.cufe =
        innerData.cufe ||
        bill.cufe ||
        responseData.cufe ||
        null;

      // Código QR (prioridad: data.links.qr -> bill.qr -> bill.qr_image)
      const rawQr =
        links.qr ||
        bill.qr ||
        bill.qr_image ||
        innerData.qr;

      invoice.qrCodeUrl = typeof rawQr === 'object' && rawQr !== null
        ? (rawQr.qr || rawQr.url || rawQr.image || JSON.stringify(rawQr))
        : (rawQr || null);

      // URL pública de Factus (prioridad: data.links.public_url -> bill.public_url)
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

      // Si es un error fiscal, de validación o de red
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

  static async createInvoice(data) {
    return await Invoice.create(data);
  }

  static async getInvoices(query = {}) {
    return await Invoice.find(query).populate('customer');
  }

  static async getInvoiceById(id) {
    return await Invoice.findById(id).populate('customer');
  }

  static async updateInvoice(id, data) {
    return await Invoice.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }
}

module.exports = { InvoiceService, issueInvoice: InvoiceService.issueInvoice };