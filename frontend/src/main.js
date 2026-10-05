import { renderDashboard } from './pages/dashboard.js';
import { checkBackendHealth } from './services/api.js';

document.querySelector('#app').innerHTML = `
  <header class="app-header">
    <h1>API WARS</h1>
    <nav>
      <button id="btn-dashboard">Dashboard</button>
      <button id="btn-new-invoice">+ Nueva Factura</button>
    </nav>
  </header>
  <main id="content" class="container">
    <p>Cargando aplicación...</p>
  </main>
  <footer id="status-footer">Verificando conexión con el servidor...</footer>
`;

// Inicialización
async function init() {
  const isHealthy = await checkBackendHealth();
  const footer = document.getElementById('status-footer');
  
  if (isHealthy) {
    footer.innerHTML = '🟢 Conectado al servidor Backend';
    footer.style.color = '#2ecc71';
  } else {
    footer.innerHTML = '🔴 Sin conexión al servidor Backend';
    footer.style.color = '#e74c3c';
  }
  
  // Renderizar vista por defecto
  renderDashboard(document.getElementById('content'));
}

init();
