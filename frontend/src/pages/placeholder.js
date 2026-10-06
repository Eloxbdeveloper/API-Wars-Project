import { escapeHtml } from '../utils/format.js';

// Páginas que todavía no existen. Integrante 3 las reemplaza (facturas, clientes, productos).
export const placeholderPage = (title, text = 'Esta sección estará disponible pronto.') => (container) => {
  container.innerHTML = `
    <div class="page-head"><h1>${escapeHtml(title)}</h1></div>
    <section class="panel"><div class="state"><h3>En construcción</h3><p>${escapeHtml(text)}</p>
    <a class="btn btn-secondary" href="#/">Volver al inicio</a></div></section>`;
};
