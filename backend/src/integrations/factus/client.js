// Usaren ti native fetch ti Node.js (v18+) - awan ti kailangan a require('node-fetch')

async function factusClient(endpoint, options = {}) {
  const baseUrl = process.env.FACTUS_BASE_URL || 'https://api-sandbox.factus.com.co';
  const url = `${baseUrl}${endpoint}`;

  // Kumpirmaen ken alaen ti Auth Token
  const token = await getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Error iti peticion para iti Factus');
    error.statusCode = response.status;
    error.details = data.errors || data.data || data;
    throw error;
  }

  return data;
}

// Función auxiliar para alaen ti Token idiay Sandbox
async function getAuthToken() {
  const baseUrl = process.env.FACTUS_BASE_URL || 'https://api-sandbox.factus.com.co';
  const response = await fetch(`${baseUrl}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      grant_type: 'password',
      client_id: process.env.FACTUS_CLIENT_ID,
      client_secret: process.env.FACTUS_CLIENT_SECRET,
      username: process.env.FACTUS_USERNAME,
      password: process.env.FACTUS_PASSWORD
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`[Autenticación Factus Fallida] ${data.error_description || data.message}`);
  }
  return data.access_token;
}

module.exports = factusClient;