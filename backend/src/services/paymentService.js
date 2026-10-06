const InvoiceModule = require('../models/Invoice');
const Payment = require('../models/Payment');
const { InvoiceService } = require('./invoiceService');
const {
  buildCollectionPayload,
  createCollection,
  getCollection
} = require('../integrations/factusPay/collections');

const Invoice = InvoiceModule.Invoice || InvoiceModule;

// Evita sincronizaciones duplicadas innecesarias a Factus Pay (polling/reintentos).
const SYNC_THROTTLE_MS = 2000;
const lastSyncCallAt = new Map();

// Margen mínimo entre reintentos de emisión fallida (polling del frontend).
const ISSUE_RETRY_THROTTLE_MS = 5000;
const lastIssueAttemptAt = new Map();

// Bloqueo en memoria: dos detecciones simultáneas de "paid" no pueden
// disparar dos emisiones de Factus para la misma factura.
const issuingLocks = new Map();
const withInvoiceLock = async (invoiceId, fn) => {
  const key = String(invoiceId);
  while (issuingLocks.has(key)) {
    await issuingLocks.get(key).catch(() => {});
  }
  const task = (async () => fn())();
  issuingLocks.set(key, task);
  try {
    return await task;
  } finally {
    issuingLocks.delete(key);
  }
};

const TERMINAL_STATUSES = ['paid', 'failed', 'rejected'];

const failureMessageFor = (status) => {
  if (status === 'failed') return 'El pago fue rechazado por el banco (failed).';
  if (status === 'rejected') return 'El pago fue rechazado en Factus Pay (rejected).';
  return null;
};

const extractCollectionData = (response) => {
  const data = response?.data || null;
  if (!data || typeof data !== 'object') {
    const error = new Error('Factus Pay devolvió una respuesta inesperada.');
    error.status = 502;
    throw error;
  }
  return data;
};

class PaymentService {
  /**
   * Crea (o reutiliza) el cobro de una factura en Factus Pay.
   * El monto y la referencia salen SIEMPRE de MongoDB (nunca del frontend).
   */
  static async createPayment(invoiceId) {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      const error = new Error('La factura especificada no existe.');
      error.status = 404;
      throw error;
    }

    if (invoice.status === 'CANCELLED') {
      const error = new Error('No se puede generar un cobro para una factura cancelada.');
      error.status = 400;
      throw error;
    }

    // Idempotencia local: un solo cobro por factura/referencia.
    const existing = await Payment.findOne({ referenceCode: invoice.referenceCode });
    if (existing) {
      return { payment: existing, created: false };
    }

    const payload = buildCollectionPayload(invoice);
    const response = await createCollection(payload);
    const data = extractCollectionData(response);

    const payment = new Payment({
      invoice: invoice._id,
      referenceCode: data.reference_code || payload.reference_code,
      amount: Number(data.amount ?? payload.amount),
      status: data.status || 'started',
      qr: data.qr || null,
      factusResponse: response,
      errorMessage: null
    });
    await payment.save();

    // El POST puede responder "started" sin QR; se consulta una vez para
    // obtener el recaudo "ready" con su QR real.
    if (!payment.qr || payment.status === 'started') {
      try {
        const refreshed = extractCollectionData(await getCollection(payment.referenceCode));
        payment.status = refreshed.status || payment.status;
        payment.qr = refreshed.qr || payment.qr;
        payment.factusResponse = { created: response, detail: refreshed };
      } catch (error) {
        // El cobro ya quedó creado; el siguiente sincronismo completa el QR.
      }
      payment.lastSyncedAt = new Date();
      await payment.save();
    }

    return { payment, created: true };
  }

  static async getPayment(referenceCode) {
    const payment = await Payment.findOne({ referenceCode: String(referenceCode) }).populate('invoice');
    if (!payment) {
      const error = new Error('El cobro especificado no existe.');
      error.status = 404;
      throw error;
    }
    return payment;
  }

  static async getPayments(query = {}) {
    const filter = {};
    if (query && query.invoice) filter.invoice = query.invoice;
    if (query && query.status) filter.status = query.status;
    return await Payment.find(filter).sort({ createdAt: -1 }).populate('invoice');
  }

  /**
   * Sincroniza el estado del cobro con Factus Pay y, si el pago está
   * confirmado (paid), dispara automáticamente la emisión de la factura.
   */
  static async syncPaymentStatus(referenceCode, { force = false } = {}) {
    const payment = await Payment.findOne({ referenceCode: String(referenceCode) });
    if (!payment) {
      const error = new Error('El cobro especificado no existe.');
      error.status = 404;
      throw error;
    }
    return PaymentService.syncPayment(payment, { force });
  }

  static async syncPayment(payment, { force = false } = {}) {
    const isTerminal = TERMINAL_STATUSES.includes(payment.status);

    // Estados terminales: sin nuevas llamadas a Factus Pay.
    if (!isTerminal || force) {
      const key = String(payment.referenceCode);
      const last = lastSyncCallAt.get(key) || 0;
      const wait = SYNC_THROTTLE_MS - (Date.now() - last);

      if (wait > 0 && !force) {
        // Solicitud repetida dentro del margen: se responde el estado local.
        return await Payment.findOne({ _id: payment._id }).populate('invoice');
      }
      lastSyncCallAt.set(key, Date.now());

      const data = extractCollectionData(await getCollection(payment.referenceCode));

      payment.status = data.status || payment.status;
      payment.qr = data.qr || payment.qr;
      payment.amount = Number(data.amount ?? payment.amount);
      payment.factusResponse = data;
      payment.lastSyncedAt = new Date();

      if (payment.status === 'paid' && !payment.paidAt) {
        payment.paidAt = new Date();
      }
      if (payment.status === 'failed' || payment.status === 'rejected') {
        payment.errorMessage =
          (typeof data.message === 'string' && data.message) || failureMessageFor(payment.status);
      }

      await payment.save();
    }

    // Pago confirmado → emisión automática de la factura (solo una vez).
    if (payment.status === 'paid') {
      await PaymentService.issueInvoiceForPayment(payment);
    }

    return await Payment.findOne({ _id: payment._id }).populate('invoice');
  }

  /**
   * Emite la factura asociada al pago usando el mecanismo existente
   * (InvoiceService.issueInvoice). Idempotente: no re-emite si ya está ISSUED.
   */
  static async issueInvoiceForPayment(payment) {
    // Reintento de emisión: si el último intento falló, se espera un margen
    // para no saturar Factus con peticiones repetidas por el polling.
    const lockKey = String(payment._id);
    if (payment.invoiceIssueError) {
      const lastAttempt = lastIssueAttemptAt.get(lockKey) || 0;
      if (Date.now() - lastAttempt < ISSUE_RETRY_THROTTLE_MS) {
        return null;
      }
    }
    lastIssueAttemptAt.set(lockKey, Date.now());

    return withInvoiceLock(payment.invoice, async () => {
      const invoice = await Invoice.findById(payment.invoice);
      if (!invoice) {
        payment.invoiceIssueError = 'La factura relacionada con el cobro no existe.';
        await payment.save();
        return null;
      }

      if (invoice.status === 'ISSUED') {
        // Ya emitida (por este flujo o manualmente): nada que re-emitir.
        if (payment.invoiceIssueError) {
          payment.invoiceIssueError = null;
          await payment.save();
        }
        lastIssueAttemptAt.delete(lockKey);
        return invoice;
      }

      if (invoice.status === 'CANCELLED') {
        payment.invoiceIssueError = 'La factura está cancelada; no se puede emitir.';
        await payment.save();
        return invoice;
      }

      try {
        const issued = await InvoiceService.issueInvoice(invoice._id);
        payment.invoiceIssuedAt = new Date();
        payment.invoiceIssueError = null;
        await payment.save();
        lastIssueAttemptAt.delete(lockKey);
        return issued;
      } catch (error) {
        // El pago sigue "paid"; el error de facturación queda registrado y
        // puede reintentarse con una nueva sincronización (sin crear otro cobro).
        payment.invoiceIssueError = error.message || 'Error al emitir la factura en Factus.';
        await payment.save();
        return null;
      }
    });
  }
}

module.exports = { PaymentService };

