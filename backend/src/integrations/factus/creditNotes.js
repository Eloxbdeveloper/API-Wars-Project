const factusClient = require('./client');

// Códigos oficiales de Factus (docs V2 → Tablas de referencia):
// "Códigos de corrección (notas crédito)"
const CORRECTION_CONCEPTS = {
  '1': 'Devolución parcial de los bienes y/o no aceptación parcial del servicio.',
  '2': 'Anulación de factura electrónica.',
  '3': 'Rebaja o descuento parcial o total.',
  '4': 'Ajuste de precio.',
  '5': 'Descuento comercial por pronto pago.',
  '6': 'Descuento comercial por volumen de ventas.'
};

// Docs V2 → "Códigos de tipos de operación (notas crédito)"
const CREDIT_NOTE_TYPE_WITH_BILL = '20'; // Nota Crédito que referencia una factura electrónica

/**
 * Consulta los rangos de numeración reales de la cuenta y devuelve el ID
 * del rango activo de notas crédito (GET /v2/numbering-ranges).
 * Respeta FACTUS_CREDIT_NOTE_RANGE_ID si está definido en el entorno.
 */
async function getCreditNoteRangeId() {
  const fromEnv = Number(process.env.FACTUS_CREDIT_NOTE_RANGE_ID);
  if (Number.isInteger(fromEnv) && fromEnv > 0) return fromEnv;

  const response = await factusClient('/v2/numbering-ranges', { method: 'GET' });
  const list = response?.data?.data || response?.data || [];
  const active = (Array.isArray(list) ? list : [])
    .filter((r) => r && r.is_active && /nota cr[eé]dito/i.test(String(r.document || '')));

  if (active.length === 0) {
    const error = new Error('La cuenta Factus no tiene un rango de numeración activo para notas crédito.');
    error.status = 400;
    throw error;
  }

  const configured = active.find((r) => Number(r.id) === fromEnv);
  return Number((configured || active[0]).id);
}

/**
 * Obtiene la factura real desde Factus (GET /v2/bills/:number).
 * El payload de la nota crédito se construye siempre sobre estos datos reales.
 */
async function getBillFromFactus(number) {
  const response = await factusClient(`/v2/bills/${encodeURIComponent(number)}`, { method: 'GET' });
  const bill = response?.data?.number ? response.data : response?.data?.data;
  if (!bill || !bill.number) {
    const error = new Error(`Factus no devolvió la factura ${number}.`);
    error.status = 404;
    throw error;
  }
  return bill;
}

/**
 * Construye el payload documentado de POST /v2/credit-notes/validate
 * a partir de la factura real devuelta por Factus.
 */
function buildCreditNotePayload({ bill, rangeId, correctionConceptCode, observation, referenceCode }) {
  const concept = String(correctionConceptCode);
  if (!CORRECTION_CONCEPTS[concept]) {
    const error = new Error(`Código de concepto de corrección inválido: ${concept}`);
    error.status = 400;
    throw error;
  }

  const cust = bill.customer || {};

  return {
    reference_code: referenceCode,
    correction_concept_code: concept,
    customization_id: CREDIT_NOTE_TYPE_WITH_BILL,
    bill_number: bill.number,
    numbering_range_id: rangeId,
    observation: String(observation || `Nota crédito sobre factura ${bill.number}`),
    payment_details: (bill.payment_details || []).map((p) => ({
      payment_form: p.payment_form?.code || '1',
      payment_method_code: p.payment_method?.code || '10',
      amount: p.amount
    })),
    customer: {
      identification_document_code: cust.identification_document?.code,
      identification: cust.identification,
      ...(cust.dv ? { dv: cust.dv } : {}),
      names: cust.names || cust.graphic_representation_name || cust.company || '',
      surnames: cust.surnames || cust.graphic_representation_name || '',
      company: cust.company || cust.graphic_representation_name || cust.names || '',
      trade_name: cust.trade_name || cust.graphic_representation_name || '',
      address: cust.address || '',
      email: cust.email,
      phone: cust.phone,
      legal_organization_code: cust.legal_organization?.code,
      tribute_code: cust.tribute?.code,
      country_code: cust.country?.code,
      responsibilities: (cust.responsibilities || []).map((r) => r.code),
      municipality_code: cust.municipality?.code
    },
    items: (bill.items || []).map((it) => ({
      code_reference: it.code_reference,
      name: it.name,
      quantity: it.quantity,
      discount_rate: it.discount_rate || '0.00',
      price: it.price,
      unit_measure_code: it.unit_measure?.code,
      standard_code: it.standard_code?.code,
      taxes: (it.taxes || []).map((t) => ({
        code: t.tribute?.code,
        rate: t.rates?.[0]?.rate
      }))
    }))
  };
}

/**
 * Envía la nota crédito a Factus para su validación.
 */
async function transmitCreditNoteToFactus(payload) {
  try {
    return await factusClient('/v2/credit-notes/validate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch (error) {
    const formatted = new Error(error.message || 'Error al crear la nota crédito en Factus');
    formatted.status = error.statusCode || 500;
    formatted.details = error.details || null;
    throw formatted;
  }
}

module.exports = {
  CORRECTION_CONCEPTS,
  getCreditNoteRangeId,
  getBillFromFactus,
  buildCreditNotePayload,
  transmitCreditNoteToFactus
};
