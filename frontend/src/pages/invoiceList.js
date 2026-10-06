import { getInvoices, createPayment } from '../services/api.js';
import { badge, loader, emptyState, alertBox } from '../components/ui.js';
import { escapeHtml, formatCOP, formatDate } from '../utils/format.js';

export async function renderInvoicesList(container) {
  container.innerHTML = `
    <div class="page-head">
      <h1>Facturas</h1>
      <div class="actions" style="margin-bottom: 0;">
        <a class="btn btn-primary" href="#/facturas/nueva">Nueva factura</a>
        <a class="btn btn-secondary" href="#/dashboard">Estadísticas</a>
      </div>
    </div>
    <section class="panel" data-list>${loader('Cargando facturas…')}</section>`;

  const el = container.querySelector('[data-list]');

  async function load() {
    el.innerHTML = loader('Cargando facturas…');
    try {
      const invoices = await getInvoices();
      if (!el.isConnected) return;

      if (!invoices.length) {
        el.innerHTML = emptyState({
          title: 'Aún no hay facturas',
          text: 'Cuando crees la primera factura aparecerá aquí.',
          actionLabel: 'Crear mi primera factura',
          href: '#/facturas/nueva',
        });
        return;
      }

      const sorted = [...invoices].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );

      const rows = sorted.map((inv) => {
        const id = inv._id || inv.id || '';
        const cust = typeof inv.customer === 'object' && inv.customer ? inv.customer : null;
        const customer = cust?.names || cust?.name || cust?.legal_name || 'Cliente sin nombre';
        const number = inv.numbering || inv.referenceCode || id;
        const isDraft = String(inv.status || '').toUpperCase() === 'DRAFT';
        return `
          <tr>
            <td>${escapeHtml(number)}</td>
            <td>${escapeHtml(customer)}</td>
            <td>${inv.createdAt ? formatDate(inv.createdAt) : '—'}</td>
            <td class="num">${formatCOP(inv.subtotal || 0)}</td>
            <td class="num">${formatCOP(inv.taxTotal || inv.taxes || 0)}</td>
            <td class="num">${formatCOP(inv.grandTotal || inv.total || 0)}</td>
            <td>${badge(inv.status)}</td>
            <td>
              ${isDraft ? `<button class="btn btn-primary btn-small btn-pay" data-id="${escapeHtml(id)}" style="margin-right: 6px;">Pagar</button>` : ''}
              <a class="btn btn-secondary btn-small" href="#/facturas/${escapeHtml(id)}">Ver detalle</a>
            </td>
          </tr>`;
      }).join('');

      el.innerHTML = `
        <p class="muted panel-note">${sorted.length} factura(s) · más recientes primero</p>
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th class="num">Subtotal</th>
                <th class="num">Impuestos</th>
                <th class="num">Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;

      el.querySelectorAll('.btn-pay').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          const invoiceId = btn.getAttribute('data-id');
          if (!invoiceId) return;
          btn.disabled = true;
          btn.textContent = 'Generando cobro...';
          try {
            const payRes = await createPayment(invoiceId);
            const payment = payRes.data || payRes;
            if (payment && payment.referenceCode) {
              window.location.hash = `#/facturas/${invoiceId}`;
            } else {
              throw new Error('No se pudo generar el cobro.');
            }
          } catch (err) {
            btn.disabled = false;
            btn.textContent = 'Pagar';
            alert('Error al generar el cobro: ' + err.message);
          }
        });
      });
    } catch (err) {
      if (!el.isConnected) return;
      el.innerHTML = alertBox({
        title: 'No pudimos cargar las facturas',
        text: err?.message || 'Intenta nuevamente.',
        actionLabel: 'Intentar de nuevo',
      });
      el.querySelector('[data-retry]')?.addEventListener('click', load);
    }
  }

  await load();
}
