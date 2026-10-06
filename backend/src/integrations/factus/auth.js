const env = require('../../config/env');

let cachedToken = null;
let tokenExpiresAt = null;

/**
 * Obtiene un Access Token válido de Factus Sandbox.
 * Reutiliza el token existente si sigue siendo válido.
 */
const getAccessToken = async () => {
  // 1. Reutilización del token si aún no ha expirado (con un margen de seguridad de 60 segundos)
  if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  // 2. Validación de credenciales presentes en el entorno
  if (!env.FACTUS_BASE_URL || !env.FACTUS_CLIENT_ID || !env.FACTUS_CLIENT_SECRET || !env.FACTUS_USERNAME || !env.FACTUS_PASSWORD) {
    throw new Error('CONFIG_ERROR: Faltan variables de entorno necesarias para la autenticación en Factus.');
  }

  const endpoint = `${env.FACTUS_BASE_URL.replace(/\/$/, '')}/oauth/token`;

  const payload = {
    grant_type: 'password',
    client_id: env.FACTUS_CLIENT_ID,
    client_secret: env.FACTUS_CLIENT_SECRET,
    username: env.FACTUS_USERNAME,
    password: env.FACTUS_PASSWORD
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok || !data.access_token) {
      const errorMsg = data.message || data.error_description || data.error || 'Autenticación fallida en Factus';
      const err = new Error(`FACTUS_AUTH_FAILED: ${errorMsg}`);
      err.statusCode = response.status;
      throw err;
    }

    // Almacenar token y calcular expiración en milisegundos
    cachedToken = data.access_token;
    const expiresInMs = (data.expires_in || 3600) * 1000;
    tokenExpiresAt = Date.now() + expiresInMs;

    return cachedToken;
  } catch (error) {
    // Sanitización: Evitar la fuga de secretos en el mensaje o traza del error
    if (error.message.includes('FACTUS_AUTH_FAILED') || error.message.includes('CONFIG_ERROR')) {
      throw error;
    }
    throw new Error(`FACTUS_AUTH_ERROR: No fue posible establecer comunicación con el servidor de autenticación de Factus.`);
  }
};

/**
 * Invalida el token en memoria obligando a re-autenticar en la próxima petición.
 */
const clearTokenCache = () => {
  cachedToken = null;
  tokenExpiresAt = null;
};

module.exports = {
  getAccessToken,
  clearTokenCache
};

import axios from 'axios';

class FactusAuthService {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiresAt = null;
  }

  /**
   * Obtiene un token de acceso válido de Factus (Sandbox/Producción).
   * Implementa almacenamiento en memoria y renovación transparente.
   */
  async getAccessToken() {
    const now = Date.now();

    // Reutiliza token si aún no vence (margen de 60s de tolerancia)
    if (this.accessToken && this.tokenExpiresAt && now < this.tokenExpiresAt - 60000) {
      return this.accessToken;
    }

    try {
      const baseUrl = process.env.FACTUS_BASE_URL || 'https://api-sandbox.factus.com.co';
      
      const payload = {
        grant_type: 'password',
        client_id: process.env.FACTUS_CLIENT_ID,
        client_secret: process.env.FACTUS_CLIENT_SECRET,
        username: process.env.FACTUS_USERNAME,
        password: process.env.FACTUS_PASSWORD
      };

      const response = await axios.post(`${baseUrl}/oauth/token`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const { access_token, refresh_token, expires_in } = response.data;

      this.accessToken = access_token;
      this.refreshToken = refresh_token;
      this.tokenExpiresAt = now + expires_in * 1000;

      return this.accessToken;
    } catch (error) {
      const errorMessage = error.response?.data?.error_description || error.response?.data?.message || error.message;
      throw new Error(`[FactusAuthError] Fallo la autenticación OAuth con Factus: ${errorMessage}`);
    }
  }

  /**
   * Invalida el caché local en caso de recepción de un 401.
   */
  clearCache() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiresAt = null;
  }
}

export const factusAuth = new FactusAuthService();