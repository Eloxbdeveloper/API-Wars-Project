// Cliente HTTP para Factus Pay (Sandbox/Producción).
// Autenticación INDEPENDIENTE de Factus API: POST /auth con email/password
// y un token Bearer cacheado en memoria (no se expira por tiempo, pero
// autenticar de nuevo revoca el token anterior).
// Documentación oficial: https://pay-developers.factus.com.co/

const DEFAULT_BASE_URL = 'https://pay-api-sandbox.factus.com.co';

const getBaseUrl = () =>
  (process.env.FACTUS_PAY_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');

let cachedToken = null;

function clearTokenCache() {
  cachedToken = null;
}

// Nunca se incluye el token ni la contraseña en los mensajes de error.
function buildError(message, statusCode = null, details = null) {
  const error = new Error(message);
  error.status = statusCode;
  error.details = details;
  return error;
}

async function authenticate() {
  const email = process.env.FACTUS_PAY_EMAIL;
  const password = process.env.FACTUS_PAY_PASSWORD;

  if (!email || !password) {
    throw buildError(
      'CONFIG_ERROR: faltan FACTUS_PAY_EMAIL y/o FACTUS_PAY_PASSWORD en el entorno del backend.',
      500
    );
  }

  const response = await fetch(`${getBaseUrl()}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.token) {
    throw buildError(
      `Factus Pay: autenticación fallida (HTTP ${response.status}).`,
      502,
      data.message || null
    );
  }

  cachedToken = data.token;
  return cachedToken;
}

/**
 * Ejecuta una petición autenticada contra Factus Pay.
 * Si el token es rechazado (401), se renueva una sola vez y se reintenta.
 */
async function factusPayClient(endpoint, options = {}, isRetry = false) {
  if (!cachedToken) {
    await authenticate();
  }

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${cachedToken}`,
    ...options.headers
  };

  const response = await fetch(`${getBaseUrl()}${endpoint}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && !isRetry) {
    clearTokenCache();
    return factusPayClient(endpoint, options, true);
  }

  if (!response.ok) {
    const message =
      (typeof data.message === 'string' && data.message) ||
      `Factus Pay: error HTTP ${response.status} en ${options.method || 'GET'} ${endpoint}.`;
    throw buildError(message, response.status === 404 ? 404 : 502, data.errors || null);
  }

  return data;
}

module.exports = {
  factusPayClient,
  authenticate,
  clearTokenCache
};
