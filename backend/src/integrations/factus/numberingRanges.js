import { factusClient } from './client.js';

/**
 * Consulta la lista de rangos de numeración autorizados en la cuenta Factus.
 */
export async function getNumberingRanges() {
  try {
    const response = await factusClient.get('/v1/numbering-ranges');
    return response.data;
  } catch (error) {
    throw new Error(`[FactusNumberingError] Error al consultar rangos: ${error.response?.data?.message || error.message}`);
  }
}