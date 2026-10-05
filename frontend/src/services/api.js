const API_URL = 'http://localhost:3000/api';

// Cliente HTTP centralizado
export async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function checkBackendHealth() {
  try {
    const res = await fetchAPI('/health');
    return res.success === true;
  } catch (e) {
    return false;
  }
}
