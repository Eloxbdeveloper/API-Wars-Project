const factusClient = require('./client');

const DOCUMENT_TYPE_MAP = {
  'CC': '13',  // Cédula de Ciudadanía
  'NIT': '31', // NIT
  'CE': '22',  // Cédula de Extranjería
  'PP': '41',  // Pasaporte
  'DIE': '50'  // Documento de Identificación Extranjero
};

/**
 * Transforma un documento Invoice local al payload requerido por Factus V2.
 */
function buildFactusInvoicePayload(invoice, customer) {
  const documentTypeCode = DOCUMENT_TYPE_MAP[customer.identificationType] || '13';
  const isCompany = customer.identificationType === 'NIT' || documentTypeCode === '31';

  // Desglose de nombre completo para Persona Natural / Razón social para Empresa
  const fullName = String(customer.names || customer.name || 'Empresa Test S.A.S.').trim();
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || 'Cliente';
  const lastName = nameParts.slice(1).join(' ') || 'Prueba';

  // Construcción del objeto Customer según DTO Factus V2
  const customerData = {
    identification: String(customer.identificationNumber || '901234567'),
    company: isCompany ? fullName : '',
    trade_name: isCompany ? fullName : '',
    names: isCompany ? '' : firstName,
    surnames: isCompany ? '' : lastName,
    email: String(customer.email || 'facturacion.prueba@testdomain.com'),
    phone: String(customer.phone || '3001234567'),
    legal_organization_code: isCompany ? '1' : '2',
    tribute_code: String(customer.tributeCode || 'ZZ'),
    identification_document_code: documentTypeCode,
    municipality_code: String(customer.municipalityCode || customer.municipalityId || '11001')
  };

  // Cálculo del DV solo si es NIT
  if (isCompany && customer.verificationDigit) {
    customerData.dv = String(customer.verificationDigit);
  }

  // Monto total en formato decimal string
  const subtotal = Number(invoice.grandTotal || invoice.totalAmount || 238000);
  const totalAmountFormatted = subtotal.toFixed(2);

  return {
    numbering_range_id: Number(process.env.FACTUS_NUMBERING_RANGE_ID || 389),
    reference_code: String(invoice.referenceCode || `TEST-REF-${Date.now()}`),
    observation: String(invoice.notes || 'Factura de prueba de integración V2'),
    operation_type: '10',
    
    // ESTRUCTURA NUEVA OBLIGATORIA
    payment_details: [
      {
        payment_form: '1',            // 1: Contado
        payment_method_code: '10',     // 10: Efectivo
        amount: totalAmountFormatted
      }
    ],
    
    customer: customerData,
    
    items: (invoice.items || []).map((item) => {
      const price = Number(item.unitPrice || 0);
      const qty = Number(item.quantity || 1);
      const taxRate = Number(item.taxRate || 19);

      return {
        code_reference: String(item.code || 'SERV-001'),
        name: String(item.name || 'Servicio de Desarrollo Web'),
        quantity: qty.toFixed(2),
        discount_rate: '0.00',
        price: price.toFixed(2),
        unit_measure_code: '94',      // 94: Unidad estándar de medida DIAN
        standard_code: '999',
        taxes: [
          {
            code: '01',                // 01: IVA
            rate: taxRate.toFixed(2)
          }
        ]
      };
    })
  };
}

/**
 * Envía la factura a validar ante Factus V2.
 */
async function transmitInvoiceToFactus(invoice, customer) {
  try {
    const payload = buildFactusInvoicePayload(invoice, customer);

    const responseData = await factusClient('/v2/bills/validate', {
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