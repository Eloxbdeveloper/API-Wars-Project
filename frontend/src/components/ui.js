import { escapeHtml, formatCOP, formatDate } from '../utils/format.js';

// Estados de factura. SUPUESTO: hoy el modelo solo tiene DRAFT;
// confirmar con Emanuel los estados reales que devolverá la API.
export const STATUS = {
  DRAFT: { label: 'Borrador', tone: 'warn' },
  ISSUED: { label: 'Emitida', tone: 'ok' },
  REJECTED: { label: 'Rechazada', tone: 'danger' },
  ERROR: { label: 'Error', tone: 'danger' },
  CANCELLED: { label: 'Cancelada', tone: 'neutral' },
};
const UNKNOWN_STATUS = { label: 'Sin estado', tone: 'neutral' };

export const getStatus = (status) => STATUS[status] ?? UNKNOWN_STATUS;

export function badge(status) {
  const { label, tone } = getStatus(status);
  return `<span class="badge badge-${tone}">${label}</span>`;
}

export function loader(text = 'Cargando…') {
  return `<div class="skeleton" role="status" aria-live="polite">
    <span class="visually-hidden">${escapeHtml(text)}</span><span></span><span></span><span></span>
  </div>`;
}

export function emptyState({ title, text, actionLabel, href }) {
  return `<div class="state">
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(text)}</p>
    ${actionLabel ? `<a class="btn btn-primary" href="${href}">${escapeHtml(actionLabel)}</a>` : ''}
  </div>`;
}

export function alertBox({ title, text, actionLabel }) {
  return `<div class="state state-error" role="alert">
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(text)}</p>
    ${actionLabel ? `<button class="btn btn-secondary" type="button" data-retry>${escapeHtml(actionLabel)}</button>` : ''}
  </div>`;
}

export function invoiceRow(inv) {
  const customerObj = typeof inv.customer === 'object' && inv.customer ? inv.customer : null;
  const customer =
    customerObj?.names ||
    customerObj?.name ||
    customerObj?.legal_name ||
    'Cliente sin nombre';
  const ref = inv.numbering || inv.referenceCode || `Factura #${String(inv._id ?? '').slice(-6)}`;
  const total = inv.grandTotal ?? inv.total ?? 0;
  const id = inv._id || inv.id || '';
  const href = id ? `#/facturas/${id}` : '#/facturas';
  return `<li>
    <a class="row row-link" href="${href}">
      <div class="row-main">
        <p class="row-title">${escapeHtml(customer)}</p>
        <p class="row-sub">${escapeHtml(ref)} · ${formatDate(inv.createdAt)}</p>
      </div>
      <div class="row-end"><span class="row-amount">${formatCOP(total)}</span>${badge(inv.status)}</div>
    </a>
  </li>`;
}
