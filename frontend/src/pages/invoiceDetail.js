import { getInvoiceById } from '../services/api.js';
import { getStatus, badge, loader, alertBox } from '../components/ui.js';
import { escapeHtml, formatCOP, formatDate } from '../utils/format.js';
import { resolveQrSrc, resolveDocUrl } from '../utils/factusAssets.js';
import { qrImageSrc } from '../utils/qr.js';

const na = (value) => (value ? escapeHtml(String(value)) : 'No disponible');

export async function renderInvoiceDetail(container, id) {
  container.innerHTML = `
    <div class="page-head">
      <h1>Detalle de factura</h1>
      <div class="actions" style="margin-bottom: 0;">
        <a class="btn btn-secondary" href="#/facturas">Volver a facturas</a>
        <a class="btn btn-primary" href="#/facturas/nueva">Nueva factura</a>
      </div>
    </div>
    <section class="panel" data-detail>${loader('Cargando factura…')}</section>`;

  const el = container.querySelector('[data-detail]');

  try {
    const res = await getInvoiceById(id);
    if (!el.isConnected) return;

    const d = res?.data || res;
    if (!d || !d._id) {
      throw Object.assign(new Error('La factura solicitada no existe (404).'), { status: 404 });
    }

    const cust = typeof d.customer === 'object' && d.customer ? d.customer : null;
    const customerName = cust?.names || cust?.name || cust?.legal_name || null;
    const number = d.numbering || d.referenceCode || null;
    const statusRaw = d.status || 'DRAFT';

    const qrValue = resolveQrSrc(d);
    const qrSrc = await qrImageSrc(qrValue);
    const docUrl = resolveDocUrl(d);

    const items = Array.isArray(d.items) ? d.items : [];
    const itemsRows = items.length
      ? items.map((it) => `
          <tr>
            <td>${escapeHtml(it.name || 'Producto')}</td>
            <td>${escapeHtml(it.code || '')}</td>
            <td class="num">${Number(it.quantity) || 0}</td>
            <td class="num">${formatCOP(it.unitPrice || 0)}</td>
            <td class="num">${formatCOP(it.subtotal || 0)}</td>
            <td class="num">${formatCOP(it.taxAmount || 0)}</td>
            <td class="num">${formatCOP(it.total || 0)}</td>
          </tr>`).join('')
      : '<tr><td colspan="7" style="text-align:center;color:var(--ink-soft);">No disponible</td></tr>';

    if (!el.isConnected) return;
    el.innerHTML = `
      <div class="detail-head">
        <div>
          <p class="detail-number">${na(number)}</p>
          <p class="detail-customer">${na(customerName)}${cust?.identificationNumber ? ` · ${escapeHtml(cust.identificationNumber)}` : ''}</p>
        </div>
        ${badge(statusRaw)}
      </div>

      <dl class="detail-grid">
        <div><dt>Número</dt><dd>${na(number)}</dd></div>
        <div><dt>Cliente</dt><dd>${na(customerName)}</dd></div>
        <div><dt>Identificación</dt><dd>${na(cust?.identificationNumber)}</dd></div>
        <div><dt>Fecha</dt><dd>${d.createdAt ? formatDate(d.createdAt) : 'No disponible'}</dd></div>
        <div><dt>Estado</dt><dd>${escapeHtml(getStatus(statusRaw).label)} (${escapeHtml(statusRaw)})</dd></div>
        <div><dt>Referencia interna</dt><dd>${na(d.referenceCode)}</dd></div>
      </dl>

      ${d.errorMessage ? `<p class="alert-error">Error de emisión: ${escapeHtml(d.errorMessage)}</p>` : ''}

      <h2>Productos</h2>
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Producto</th><th>Código</th><th class="num">Cant.</th><th class="num">Precio</th>
              <th class="num">Subtotal</th><th class="num">Impuestos</th><th class="num">Total</th>
            </tr>
          </thead>
          <tbody>${itemsRows}</tbody>
        </table>
      </div>

      <dl class="detail-grid totals">
        <div><dt>Subtotal</dt><dd>${formatCOP(d.subtotal || 0)}</dd></div>
        <div><dt>Impuestos</dt><dd>${formatCOP(d.taxTotal || d.taxes || 0)}</dd></div>
        <div><dt>Total</dt><dd class="total-strong">${formatCOP(d.grandTotal || d.total || 0)}</dd></div>
      </dl>

      <h2>Validación DIAN</h2>
      <dl class="detail-grid">
        <div style="grid-column: 1 / -1;"><dt>CUFE</dt><dd class="mono">${na(d.cufe)}</dd></div>
      </dl>

      <div class="qr-block">
        ${qrSrc
          ? `<img src="${qrSrc}" alt="Código QR de la factura ${escapeHtml(number || '')}" width="200" height="200" />`
          : '<p class="muted">QR: No disponible</p>'}
        <div class="qr-links">
          ${qrValue && /^https?:\/\//i.test(qrValue)
            ? `<a class="btn btn-secondary" href="${escapeHtml(qrValue)}" target="_blank" rel="noopener noreferrer">Abrir verificación DIAN</a>`
            : ''}
          ${docUrl
            ? `<a class="btn btn-primary" href="${escapeHtml(docUrl)}" target="_blank" rel="noopener noreferrer">Ver documento público (Factus)</a>`
            : '<p class="muted">Documento público: No disponible</p>'}
        </div>
      </div>`;
  } catch (err) {
    if (!el.isConnected) return;
    const notFound = err?.status === 404 || /no existe|404|not found/i.test(err?.message || '');
    el.innerHTML = `
      ${alertBox({
        title: notFound ? 'Factura no encontrada' : 'No pudimos cargar la factura',
        text: err?.message || 'Error desconocido.',
        actionLabel: notFound ? null : 'Intentar de nuevo',
      })}
      <div style="text-align:center; padding-bottom: var(--space-6);">
        <a class="btn btn-secondary" href="#/facturas">Volver a facturas</a>
      </div>`;
    if (!notFound) {
      el.querySelector('[data-retry]')?.addEventListener('click', () => renderInvoiceDetail(container, id));
    }
  }
}
