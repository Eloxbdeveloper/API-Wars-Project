const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

async function request(endpoint, options = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Intentar parsear JSON de la respuesta
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new Error(`Error ${response.status}: Respuesta del servidor no válida.`);
    }
    
    if (!response.ok || data.success === false) {
      throw new Error(data.message || `Error ${response.status}: Ocurrió un problema en la solicitud.`);
    }
    
    return data;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    throw error;
  }
}

// Health check
export const checkBackendHealth = () => request('/health');

// Customers API
export const getCustomers = () => request('/customers');
export const getCustomerById = (id) => request(`/customers/${id}`);
export const createCustomer = (customerData) => request('/customers', { 
  method: 'POST', 
  body: JSON.stringify(customerData) 
});
export const updateCustomer = (id, customerData) => request(`/customers/${id}`, { 
  method: 'PUT', 
  body: JSON.stringify(customerData) 
});

// Products API
export const getProducts = () => request('/products');
export const getProductById = (id) => request(`/products/${id}`);
export const createProduct = (productData) => request('/products', { 
  method: 'POST', 
  body: JSON.stringify(productData) 
});
export const updateProduct = (id, productData) => request(`/products/${id}`, { 
  method: 'PUT', 
  body: JSON.stringify(productData) 
});

// Invoices API
// Normaliza la respuesta { success, data } a un array plano de facturas.
export const getInvoices = async () => {
  const res = await request('/invoices');
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data?.items)) return res.data.items;
  return [];
};
export const getInvoiceById = (id) => request(`/invoices/${encodeURIComponent(id)}`);

// Crear borrador (envía únicamente customerId y items: [{ productId, quantity }])
export const createInvoiceDraft = (payload) => request('/invoices', {
  method: 'POST',
  body: JSON.stringify(payload)
});

export const updateInvoice = (id, payload) => request(`/invoices/${id}`, {
  method: 'PUT',
  body: JSON.stringify(payload)
});

// Emitir factura hacia Factus Sandbox
export const issueInvoice = (id) => request(`/invoices/${id}/issue`, {
  method: 'POST'
});

// Payments API
export const createPayment = (invoiceId) => request('/payments', {
  method: 'POST',
  body: JSON.stringify({ invoiceId })
});

export const getPayment = (referenceCode) => request(`/payments/${encodeURIComponent(referenceCode)}`);

export const getPayments = (query = {}) => {
  const params = new URLSearchParams();
  if (query.invoice) params.set('invoice', query.invoice);
  if (query.status) params.set('status', query.status);
  const qs = params.toString();
  return request(`/payments${qs ? `?${qs}` : ''}`);
};

// Credit notes API (backend propio → Factus)
export const getCreditNotes = async () => {
  const res = await request('/credit-notes');
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
};
export const getCorrectionConcepts = async () => {
  const res = await request('/credit-notes/concepts');
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return [];
};
export const createCreditNote = (payload) => request('/credit-notes', {
  method: 'POST',
  body: JSON.stringify(payload)
});

// ... tus otras funciones existentes ...

export async function deleteCustomer(id) {
  const response = await fetch(`${API_URL}/customers/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': 'Bearer ' + token // si usas token
    }
  });
  if (!response.ok) throw new Error('Error al eliminar cliente');
  return response.json();
}

export async function deleteProduct(id) {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  if (!response.ok) throw new Error('Error al eliminar producto');
  return response.json();
}