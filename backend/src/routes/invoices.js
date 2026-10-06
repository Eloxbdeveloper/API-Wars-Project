const factusClient = require('./client');

const DOCUMENT_TYPE_MAP = {
  'CC': '3',   // Cédula de Ciudadanía
  'NIT': '6',  // Nit
  'CE': '2',   // Cédula de Extranjería
  'PP': '5',   // Pasaporte
  'DIE': '4'   // Documento de Identificación Extranjero
};

/**
 * Transforma un documento Invoice local al payload requerido por Factus.
 */
function buildFactusInvoicePayload(invoice, customer) {
  const documentTypeCode = DOCUMENT_TYPE_MAP[customer.identificationType] || '3';
  const isCompany = customer.identificationType === 'NIT';

  return {
    numbering_range_id: Number(process.env.FACTUS_NUMBERING_RANGE_ID || 1),
    reference_code: invoice.referenceCode || `INV-${invoice._id}`,
    observation: invoice.notes || 'Factura generada electrónicamente.',
    payment_method_code: invoice.paymentMethodCode || '1', // 1: Contado, 2: Crédito
    customer: {
      identification: customer.identificationNumber,
      dv: customer.verificationDigit || null,
      company: isCompany ? customer.name : '',
      trade_name: isCompany ? customer.tradeName || customer.name : '',
      names: isCompany ? '' : customer.firstName || customer.name,
      surnames: isCompany ? '' : customer.lastName || '.',
      email: customer.email,
      phone: customer.phone || '3000000000',
      legal_organization_id: isCompany ? '1' : '2', // 1: Persona Jurídica, 2: Persona Natural
      tribute_id: customer.tributeId || '21',       // 21: No aplica / IVA
      identification_document_id: documentTypeCode,
      municipality_id: customer.municipalityId || '149' // 149: Bogotá por defecto
    },
    items: invoice.items.map((item) => {
      const price = Number(item.unitPrice);
      const qty = Number(item.quantity);
      const taxRate = Number(item.taxRate || 19);

      return {
        code_reference: item.code || `ITEM-${item.productId || 'GEN'}`,
        name: item.name,
        quantity: qty,
        discount_rate: Number(item.discountRate || 0),
        price: price,
        tax_rate: taxRate.toFixed(2),
        unit_measure_id: item.unitMeasureId || 70, // 70: Unidad
        standard_item_id: 1,
        is_excluded: taxRate === 0 ? 1 : 0,
        tribute_id: 1, // 1: IVA
        withholding_taxes: []
      };
    })
  };
}

/**
 * Envía la factura a validar ante Factus y la DIAN.
 */
async function transmitInvoiceToFactus(invoice, customer) {
  try {
    const payload = buildFactusInvoicePayload(invoice, customer);
    const responseData = await factusClient('/v1/bills/validate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return responseData;
  } catch (error) {
    const formattedError = new Error(`[FactusTransmitError] ${error.message}`);
    formattedError.status = error.statusCode || 500;
    formattedError.details = error.details || null;
    throw formattedError;
  }
}

module.exports = {
  buildFactusInvoicePayload,
  transmitInvoiceToFactus
};