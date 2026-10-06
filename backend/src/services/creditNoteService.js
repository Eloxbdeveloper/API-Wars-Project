const InvoiceModule = require('../models/Invoice');
const CreditNote = require('../models/CreditNote');
const {
  getCreditNoteRangeId,
  getBillFromFactus,
  buildCreditNotePayload,
  transmitCreditNoteToFactus
} = require('../integrations/factus/creditNotes');

const Invoice = InvoiceModule.Invoice || InvoiceModule;

class CreditNoteService {
  /**
   * Crea y valida una nota crédito en Factus a partir de una factura emitida.
   * Todo el payload se construye con datos reales (factura consultada a Factus).
   */
  static async createCreditNote({ invoiceId, correctionConceptCode = '2', observation }) {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      const error = new Error('La factura especificada no existe.');
      error.status = 404;
      throw error;
    }

    if (invoice.status !== 'ISSUED' || !invoice.numbering) {
      const error = new Error('Solo se pueden generar notas crédito sobre facturas emitidas (ISSUED).');
      error.status = 400;
      throw error;
    }

    const existing = await CreditNote.findOne({ invoice: invoice._id, status: 'ISSUED' });
    if (existing) {
      const error = new Error(`La factura ${invoice.numbering} ya tiene la nota crédito ${existing.numbering}.`);
      error.status = 409;
      error.details = existing;
      throw error;
    }

    const [rangeId, bill] = await Promise.all([
      getCreditNoteRangeId(),
      getBillFromFactus(invoice.numbering)
    ]);

    const referenceCode = `NC-${invoice.numbering}-${Date.now()}`;
    const payload = buildCreditNotePayload({
      bill,
      rangeId,
      correctionConceptCode,
      observation,
      referenceCode
    });

    try {
      const result = await transmitCreditNoteToFactus(payload);
      const data = result?.data?.number ? result.data : (result?.data?.data || result?.data || {});
      const links = data.links || {};

      const note = new CreditNote({
        referenceCode,
        invoice: invoice._id,
        billNumber: invoice.numbering,
        numbering: data.number || null,
        cude: data.cude || data.cufe || null,
        status: 'ISSUED',
        total: Number(data.totals?.total || bill.totals?.total || invoice.grandTotal || 0),
        taxTotal: Number(data.totals?.tax_amount || invoice.taxTotal || 0),
        correctionConceptCode: String(correctionConceptCode),
        observation: observation || null,
        customerNames: data.customer?.names || data.customer?.graphic_representation_name || null,
        customerIdentification: data.customer?.identification || null,
        qrCodeUrl: links.qr || null,
        publicUrl: links.public_url || null,
        factusResponse: result,
        errorMessage: null
      });

      await note.save();
      return note;
    } catch (error) {
      const failed = new CreditNote({
        referenceCode,
        invoice: invoice._id,
        billNumber: invoice.numbering,
        status: 'ERROR',
        total: Number(invoice.grandTotal || 0),
        taxTotal: Number(invoice.taxTotal || 0),
        correctionConceptCode: String(correctionConceptCode),
        observation: observation || null,
        customerNames: null,
        factusResponse: error.details || null,
        errorMessage: error.message || 'Error al crear la nota crédito en Factus'
      });
      await failed.save();
      throw error;
    }
  }

  static async getCreditNotes(query = {}) {
    const filter = {};
    if (query && query.status) filter.status = query.status;
    return await CreditNote.find(filter).sort({ createdAt: -1 });
  }

  static async getCreditNoteById(id) {
    const note = await CreditNote.findById(id);
    if (!note) {
      const error = new Error('La nota crédito especificada no existe.');
      error.status = 404;
      throw error;
    }
    return note;
  }
}

module.exports = { CreditNoteService };
