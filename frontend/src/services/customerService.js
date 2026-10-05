/**
 * Servicio para la gestión de clientes en el frontend.
 * Se comunica exclusivamente con el backend de FactuLocal.
 */

const API_BASE_URL = '/api';

export const customerService = {
  /**
   * Obtiene la lista de todos los clientes.
   * @returns {Promise<Array>} Lista de clientes
   */
  async getCustomers() {
    try {
      const response = await fetch(`${API_BASE_URL}/customers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'No fue posible obtener la lista de clientes.');
      }

      return result.data;
    } catch (error) {
      console.error('Error in customerService.getCustomers:', error);
      throw error;
    }
  },

  /**
   * Crea un nuevo cliente en el sistema.
   * @param {Object} customerData - Datos del cliente (identificación, nombre, email, teléfono, etc.)
   * @returns {Promise<Object>} Cliente creado
   */
  async createCustomer(customerData) {
    try {
      const response = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customerData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'No fue posible registrar el cliente.');
      }

      return result.data;
    } catch (error) {
      console.error('Error in customerService.createCustomer:', error);
      throw error;
    }
  }
};
