const { factusPayClient } = require('./client');

// Límites documentados oficialmente por Factus Pay para el monto (COP).
const MIN_AMOUNT = 10000;
const MAX_AMOUNT = 12000000;

// Estados documentados oficialmente: started, ready, paid, failed, rejected.
const COLLECTION_STATUSES = ['started', 'ready', 'paid', 'failed', 'rejected'];

/**
 * Construye el payload de POST /v1/collections a partir de la Invoice real.
 * El monto y la referencia provienen SIEMPRE de MongoDB (nunca del frontend).
 */
function buildCollectionPayload(invoice) {
  const referenceCode = String(invoice.referenceCode || '').trim();

  if (!referenceCode) {
    const error = new Error('La factura no tiene un referenceCode utilizable para el cobro.');
    error.status = 400;
    throw error;
  }

  if (referenceCode.length > 100) {
    const error = new Error('El referenceCode de la factura supera los100 caracteres permitidos por Factus Pay.');
    error.status = 400;
    throw error;
  }

  const amount = Number(invoice.grandTotal);

  if (!Number.isFinite(amount) || amount <= 0) {
    const error = new Error('La factura no tiene un monto válido para cobrar (grandTotal).');
    error.status = 400;
    throw error;
  }

  if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
    const error = new Error(
      `El monto (${amount}) está fuera de los límites permitidos por Factus Pay (${MIN_AMOUNT} a ${MAX_AMOUNT} COP).`
    );
    error.status = 400;
    throw error;
  }

  return { reference_code: referenceCode, amount };
}

/** POST /v1/collections — crea (o devuelve el ya existente) el recaudo. */
async function createCollection(payload) {
  return factusPayClient('/v1/collections', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

/** GET /v1/collections/:referenceCode — consulta estado y QR del recaudo. */
async function getCollection(referenceCode) {
  return factusPayClient(
    `/v1/collections/${encodeURIComponent(String(referenceCode))}`,
    { method: 'GET' }
  );
}

module.exports = {
  MIN_AMOUNT,
  MAX_AMOUNT,
  COLLECTION_STATUSES,
  buildCollectionPayload,
  createCollection,
  getCollection
};
