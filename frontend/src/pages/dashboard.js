import { getInvoices } from '../services/api.js';
import { badge, getStatus, loader, emptyState, alertBox } from '../components/ui.js';
import { formatCOP, formatCompact, formatMonth } from '../utils/format.js';

const MONTHS_SHOWN = 6;
const isIssued = (inv) => getStatus(inv.status).tone === 'ok';
const sum = (list) => list.reduce((total, inv) => total + (Number(inv.total) || 0), 0);

function computeStats(invoices) {
  const now = new Date();
  const issued = invoices.filter(isIssued);

  const months = Array.from({ length: MONTHS_SHOWN }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (MONTHS_SHOWN - 1 - i), 1);
    const inMonth = issued.filter((inv) => {
      const c = new Date(inv.createdAt);
      return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear();
    });
    return { label: formatMonth(d), total: sum(inMonth), count: inMonth.length };
  });

  const current = months[months.length - 1];
  const byStatus = {};
  invoices.forEach((inv) => {
    const key = inv.status ?? '';
    byStatus[key] = (byStatus[key] ?? 0) + 1;
  });

  return {
    monthTotal: current.total,
    monthCount: current.count,
    pending: invoices.filter((inv) => getStatus(inv.status).tone === 'warn').length,
    months,
    byStatus: Object.entries(byStatus).sort((a, b) => b[1] - a[1]),
    total: invoices.length,
  };
}

function summaryHTML(stats) {
  const cells = [
    ['Facturado este mes', stats ? formatCOP(stats.monthTotal) : '—'],
    ['Facturas emitidas este mes', stats ? stats.monthCount : '—'],
    ['Pendientes por emitir', stats ? stats.pending : '—'],
  ];
  return cells.map(([label, value]) => `<div class="stat"><p class="stat-label">${label}</p><p class="stat-value">${value}</p></div>`).join('');
}

function barsHTML(months) {
  const max = Math.max(...months.map((m) => m.total), 0);
  const bars = months.map((m) => {
    const height = max ? Math.max((m.total / max) * 100, m.total ? 4 : 0) : 0;
    return `<li class="bar">
      <span class="bar-value">${m.total ? formatCompact(m.total) : '0'}</span>
      <span class="bar-track"><span class="bar-fill" style="height:${height}%"></span></span>
      <span class="bar-label">${m.label}</span>
    </li>`;
  }).join('');
  return `<ul class="bars" aria-label="Facturado por mes, últimos ${MONTHS_SHOWN} meses">${bars}</ul>`;
}

function statusHTML(byStatus, total) {
  return `<ul class="rows">${byStatus.map(([status, count]) => `
    <li class="row">
      <div class="row-main">${badge(status)}</div>
      <div class="meter-wrap"><span class="meter"><span style="width:${(count / total) * 100}%"></span></span>
      <span class="row-amount">${count}</span></div>
    </li>`).join('')}</ul>`;
}

export function renderDashboard(container) {
  container.innerHTML = `
    <div class="page-head"><h1>Dashboard</h1></div>
    <section class="summary" aria-label="Resumen del mes"></section>
    <div data-detail></div>`;

  const summaryEl = container.querySelector('.summary');
  const detailEl = container.querySelector('[data-detail]');

  async function load() {
    summaryEl.innerHTML = summaryHTML(null);
    detailEl.innerHTML = `<section class="panel">${loader('Cargando estadísticas…')}</section>`;
    try {
      const invoices = await getInvoices();
      if (!detailEl.isConnected) return;
      const stats = computeStats(invoices);
      summaryEl.innerHTML = summaryHTML(stats);
      if (invoices.length === 0) {
        detailEl.innerHTML = `<section class="panel">${emptyState({
          title: 'Aún no hay estadísticas',
          text: 'Aparecerán cuando emitas tu primera factura.',
          actionLabel: 'Crear mi primera factura',
          href: '#/facturas/nueva',
        })}</section>`;
        return;
      }
      detailEl.innerHTML = `
        <section class="panel stack" aria-labelledby="months-title">
          <h2 id="months-title">Facturado por mes</h2>
          ${barsHTML(stats.months)}
        </section>
        <section class="panel stack" aria-labelledby="status-title">
          <h2 id="status-title">Facturas por estado</h2>
          ${statusHTML(stats.byStatus, stats.total)}
        </section>`;
    } catch {
      if (!detailEl.isConnected) return;
      detailEl.innerHTML = `<section class="panel">${alertBox({ title: 'No pudimos cargar las estadísticas', text: 'Intenta nuevamente.', actionLabel: 'Intentar de nuevo' })}</section>`;
      detailEl.querySelector('[data-retry]').addEventListener('click', load);
    }
  }

  load();
}
