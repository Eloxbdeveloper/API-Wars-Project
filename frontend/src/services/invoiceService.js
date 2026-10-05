/**
 * Servicio para la gestión y emisión de facturas en el frontend.
 * Se comunica exclusivamente con el backend de FactuLocal.
 */

const API_BASE_URL = '/api';

export const invoiceService = {
  /**
   * Obtiene el historial de facturas emitidas.
   * @returns {Promise<Array>} Lista de facturas
   */
  async getInvoices() {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'No fue posible obtener el historial de facturas.');
      }

      return result.data;
    } catch (error) {
      console.error('Error in invoiceService.getInvoices:', error);
      throw error;
    }
  },

  /**
   * Envía una nueva factura al backend para ser procesada y emitida en Factus.
   * @param {Object} invoiceData - Datos completos de la factura (cliente, ítems, totales)
   * @returns {Promise<Object>} Resultado de la emisión
   */
  async createInvoice(invoiceData) {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'No fue posible emitir la factura.');
      }

      return result.data;
    } catch (error) {
      console.error('Error in invoiceService.createInvoice:', error);
      throw error;
    }
  }
};
