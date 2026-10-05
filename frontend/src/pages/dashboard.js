export function renderDashboard(container) {
  container.innerHTML = `
    <div class="dashboard-page">
      <h2>Dashboard de Negocio</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Facturas Hoy</h3>
          <p class="stat-value">0</p>
        </div>
        <div class="stat-card">
          <h3>Total Mes</h3>
          <p class="stat-value">$0.00</p>
        </div>
      </div>
      <div class="quick-actions">
        <!-- Espacio para acciones rápidas -->
      </div>
    </div>
  `;
}
