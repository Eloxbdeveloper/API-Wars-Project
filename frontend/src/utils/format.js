const cop = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatCOP = (value) => cop.format(Number(value) || 0);
export const formatDate = (iso) => (iso ? date.format(new Date(iso)) : '');

// Todo dato que venga del backend y se pinte con innerHTML pasa por aquí.
export function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const compact = new Intl.NumberFormat('es-CO', { notation: 'compact', maximumFractionDigits: 1 });
const monthShort = new Intl.DateTimeFormat('es-CO', { month: 'short' });

export const formatCompact = (value) => compact.format(Number(value) || 0);
export const formatMonth = (date) => monthShort.format(date).replace('.', '');
