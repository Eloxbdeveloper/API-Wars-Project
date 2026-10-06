import { getInvoices } from '../services/api.js';
import { badge, getStatus, loader, emptyState, alertBox } from '../components/ui.js';
import { formatCOP, formatCompact, formatMonth } from '../utils/format.js';

const MONTHS_SHOWN = 6;
const isIssued = (inv) => inv.status === 'ISSUED';
const sum = (list) => list.reduce((total, inv) => total + (Number(inv.grandTotal ?? inv.total) || 0), 0);

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

  const byStatus = {};
  invoices.forEach((inv) => {
    const key = inv.status ?? '';
    byStatus[key] = (byStatus[key] ?? 0) + 1;
  });

  return {
    monthTotal: months[months.length - 1].total,
    monthCount: months[months.length - 1].count,
    totalBilled: sum(issued),
    totalAll: sum(invoices),
    total: invoices.length,
    issued: issued.length,
    errors: invoices.filter((inv) => getStatus(inv.status).tone === 'danger').length,
    cancelled: invoices.filter((inv) => inv.status === 'CANCELLED').length,
    drafts: invoices.filter((inv) => inv.status === 'DRAFT').length,
    months,
    byStatus: Object.entries(byStatus).sort((a, b) => b[1] - a[1]),
  };
}

function summaryHTML(stats) {
  const cells = [
    ['Total facturado (emitidas)', stats ? formatCOP(stats.totalBilled) : '—'],
    ['Total registrado', stats ? formatCOP(stats.totalAll) : '—'],
    ['Facturas', stats ? stats.total : '—'],
    ['Emitidas', stats ? stats.issued : '—'],
    ['Con error', stats ? stats.errors : '—'],
    ['Canceladas', stats ? stats.cancelled : '—'],
  ];
  return cells
    .map(([label, value]) => `<div class="stat"><p class="stat-label">${label}</p><p class="stat-value">${value}</p></div>`)
    .join('');
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
      <div class="meter-wrap"><span class="meter"><span style="width:${total ? (count / total) * 100 : 0}%"></span></span>
      <span class="row-amount">${count}</span></div>
    </li>`).join('')}</ul>`;
}

export function renderDashboard(container) {
  container.innerHTML = `
    <div class="page-head">
      <h1>Estadísticas</h1>
      <div class="actions" style="margin-bottom: 0;">
        <a class="btn btn-secondary" href="#/facturas">Ver facturas</a>
        <a class="btn btn-primary" href="#/facturas/nueva">Nueva factura</a>
      </div>
    </div>
    <section class="summary" aria-label="Resumen"></section>
    <div data-detail></div>`;

  const summaryEl = container.querySelector('.summary');
  const detailEl = container.querySelector('[data-detail]');

  async function load() {
    summaryEl.innerHTML = summaryHTML(null);
    detailEl.innerHTML = `<section class="panel">${loader('Cargando estadísticas…')}</section>`;
    try {
      const invoices = await getInvoices();
      if (!detailEl.isConnected) return;

      if (!invoices.length) {
        detailEl.innerHTML = `<section class="panel">${emptyState({
          title: 'Aún no hay estadísticas',
          text: 'Aparecerán cuando emitas tu primera factura.',
          actionLabel: 'Crear mi primera factura',
          href: '#/facturas/nueva',
        })}</section>`;
        return;
      }

      const stats = computeStats(invoices);
      summaryEl.innerHTML = summaryHTML(stats);
      detailEl.innerHTML = `
        <section class="panel stack" aria-labelledby="months-title">
          <h2 id="months-title">Facturado por mes (emitidas, últimos ${MONTHS_SHOWN} meses)</h2>
          ${barsHTML(stats.months)}
        </section>
        <section class="panel stack" aria-labelledby="status-title">
          <h2 id="status-title">Facturas por estado</h2>
          ${statusHTML(stats.byStatus, stats.total)}
        </section>
        <section class="panel stack" aria-labelledby="period-title">
          <h2 id="period-title">Resumen del mes actual</h2>
          <ul class="rows">
            <li class="row"><div class="row-main">Facturado este mes (emitidas)</div><span class="row-amount">${formatCOP(stats.monthTotal)}</span></li>
            <li class="row"><div class="row-main">Facturas creadas este mes</div><span class="row-amount">${stats.monthCount}</span></li>
            <li class="row"><div class="row-main">Borradores</div><span class="row-amount">${stats.drafts}</span></li>
          </ul>
        </section>`;
    } catch (err) {
      if (!detailEl.isConnected) return;
      detailEl.innerHTML = `<section class="panel">${alertBox({
        title: 'No pudimos cargar las estadísticas',
        text: err?.message || 'Intenta nuevamente.',
        actionLabel: 'Intentar de nuevo',
      })}</section>`;
      detailEl.querySelector('[data-retry]')?.addEventListener('click', load);
    }
  }

  load();
}
