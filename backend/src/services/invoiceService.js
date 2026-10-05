const factusClient = require('../integrations/factus/client');
const Invoice = require('../models/Invoice'); // Modelo placeholder

exports.getAllInvoices = async () => {
  // En el futuro: return await Invoice.find();
  return [];
};

exports.createInvoice = async (invoiceData) => {
  // Lógica de negocio futura:
  // 1. Validar datos
  // 2. Comunicarse con Factus
  // const factusResponse = await factusClient.createDocument(invoiceData);
  // 3. Guardar en base de datos local
  // return await Invoice.create({ ...invoiceData, factus_id: factusResponse.id });
  
  return { message: "Factura simulada (Fase 1)", data: invoiceData };
};
