import { getInvoices } from '../services/api.js';
import { invoiceRow, loader, emptyState, alertBox } from '../components/ui.js';

const RECENT_LIMIT = 5;

export function renderHome(container) {
  container.innerHTML = `
    <div class="page-head"><h1>Inicio</h1></div>
    <div class="actions">
      <a class="btn btn-primary" href="#/facturas/nueva">Nueva factura</a>
    </div>
    <section class="panel" aria-labelledby="recent-title">
      <h2 id="recent-title">Actividad reciente</h2>
      <div data-recent></div>
    </section>`;

  const recentEl = container.querySelector('[data-recent]');

  async function load() {
    recentEl.innerHTML = loader('Cargando facturas…');
    try {
      const invoices = await getInvoices();
      if (!recentEl.isConnected) return; // el usuario ya navegó a otra página
      if (invoices.length === 0) {
        recentEl.innerHTML = emptyState({
          title: 'Aún no tienes facturas',
          text: 'Cuando emitas la primera, la verás aquí.',
          actionLabel: 'Crear mi primera factura',
          href: '#/facturas/nueva',
        });
        return;
      }
      const recent = [...invoices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, RECENT_LIMIT);
      recentEl.innerHTML = `
        <ul class="rows">${recent.map(invoiceRow).join('')}</ul>
        <div style="padding: var(--space-4) var(--space-6); border-top: 1px solid var(--line);">
          <a class="btn btn-secondary" href="#/facturas">Ver todas las facturas</a>
        </div>`;
    } catch {
      if (!recentEl.isConnected) return;
      recentEl.innerHTML = alertBox({ title: 'No pudimos cargar tus facturas', text: 'Intenta nuevamente.', actionLabel: 'Intentar de nuevo' });
      recentEl.querySelector('[data-retry]').addEventListener('click', load);
    }
  }

  load();
}
