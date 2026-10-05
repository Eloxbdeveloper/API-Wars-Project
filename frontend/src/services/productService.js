/**
 * Servicio para la gestión de productos y servicios en el frontend.
 * Se comunica exclusivamente con el backend de FactuLocal.
 */

const API_BASE_URL = '/api';

export const productService = {
  /**
   * Obtiene la lista de todos los productos y servicios.
   * @returns {Promise<Array>} Lista de productos
   */
  async getProducts() {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'No fue posible obtener la lista de productos.');
      }

      return result.data;
    } catch (error) {
      console.error('Error in productService.getProducts:', error);
      throw error;
    }
  },

  /**
   * Crea un nuevo producto o servicio en el sistema.
   * @param {Object} productData - Datos del producto (nombre, descripción, precio, impuestos, etc.)
   * @returns {Promise<Object>} Producto creado
   */
  async createProduct(productData) {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'No fue posible registrar el producto.');
      }

      return result.data;
    } catch (error) {
      console.error('Error in productService.createProduct:', error);
      throw error;
    }
  }
};
