import { getInvoiceById, createPayment, getPayment } from '../services/api.js';
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
    const isDraft = String(statusRaw).toUpperCase() === 'DRAFT';
    const isIssued = String(statusRaw).toUpperCase() === 'ISSUED';

    let paymentHtml = '';
    if (isDraft) {
      paymentHtml = `
        <div id="detail-payment-container" style="margin-top: 20px; padding: 15px; border: 1px solid #007bff; border-radius: 6px; background-color: #f8f9fa;">
          <h4>Pago mediante Factus Pay</h4>
          <button id="btn-detail-pay" class="btn btn-primary">Generar cobro y Pagar</button>
          <div id="detail-payment-status" style="margin-top: 15px; display: none;"></div>
        </div>
      `;
    }

    el.innerHTML = `
      <div class="detail-head">
        <div>
          <p class="detail-number">${na(number)}</p>
          <p class="detail-customer">${na(customerName)}${cust?.identificationNumber ? ` · ${escapeHtml(cust?.identificationNumber)}` : ''}</p>
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

      ${paymentHtml}

      ${isIssued ? `
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
      </div>` : ''}`;

    if (isDraft) {
      const btnDetailPay = container.querySelector('#btn-detail-pay');
      const detailPaymentStatus = container.querySelector('#detail-payment-status');
      if (btnDetailPay) {
        btnDetailPay.addEventListener('click', async () => {
          btnDetailPay.disabled = true;
          btnDetailPay.textContent = 'Generando cobro...';
          detailPaymentStatus.style.display = 'block';
          detailPaymentStatus.innerHTML = '<p>Consultando Factus Pay...</p>';

          try {
            const payRes = await createPayment(id);
            const payment = payRes.data || payRes;
            if (!payment || !payment.referenceCode) {
              throw new Error('Factus Pay no devolvió una referencia válida.');
            }

            // Cambiar UI: cobro generado, esperar pago
            btnDetailPay.textContent = 'Cobro generado - Esperando pago...';
            btnDetailPay.disabled = true;

            const poll = async () => {
              try {
                const statusRes = await getPayment(payment.referenceCode);
                const p = statusRes.data || statusRes;
                const status = String(p.status || '').toLowerCase();
                if (status === 'paid') {
                  detailPaymentStatus.innerHTML = '<p style="color:#155724; font-weight:bold;">Pago confirmado. Cargando factura emitida...</p>';
                  btnDetailPay.textContent = 'Pago completado';
                  try {
                    await renderInvoiceDetail(container, id);
                    return true;
                  } catch (reloadErr) {
                    detailPaymentStatus.innerHTML = '<p style="color:#155724; font-weight:bold;">Pago confirmado. Factura emitida (recarga para ver detalle).</p>';
                    return true;
                  }
                } else if (status === 'failed' || status === 'rejected') {
                  detailPaymentStatus.innerHTML = `<p style="color:#721c24; font-weight:bold;">Pago ${status === 'failed' ? 'rechazado por el banco' : 'rechazado en Factus Pay'}.</p>`;
                  btnDetailPay.disabled = false;
                  btnDetailPay.textContent = 'Reintentar pago';
                  return true;
} else {
                  const qrSrc = await qrImageSrc(p.qr || '');
                  const simulatorUrl = 'https://pay-api-sandbox.factus.com.co/simulator';
                  detailPaymentStatus.innerHTML = `
                    <p><strong>Referencia:</strong> ${escapeHtml(p.referenceCode)}</p>
                    <p><strong>Monto:</strong> ${formatCOP(Number(p.amount) || 0)}</p>
                    <p><strong>Estado:</strong> ${escapeHtml(status)} (ESPERANDO PAGO)</p>
                    ${qrSrc ? `<img src="${qrSrc}" alt="QR pago" width="200" height="200" />` : ''}
                    <div style="margin-top: 15px; padding: 10px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px;">
                      <p style="margin: 0 0 10px; font-size: 0.85em; color: #856404;">
                        <strong>Demo:</strong> Use el simulador oficial de Factus Pay Sandbox para completar el pago.
                      </p>
                      <a href="${simulatorUrl}" target="_blank" rel="noopener noreferrer" 
                         class="btn btn-warning" style="font-size: 0.9em;">
                        🔧 Abrir simulador Sandbox
                      </a>
                    </div>
                  `;
                }
              } catch (err) {
                detailPaymentStatus.innerHTML = `<p style="color:#721c24;">Error consultando pago: ${escapeHtml(err.message)}</p>`;
              }
              return false;
            };

            const done = await poll();
            if (!done) {
              const timer = setInterval(async () => {
                if (container.querySelector('#detail-payment-status') !== detailPaymentStatus) {
                  clearInterval(timer);
                  return;
                }
                const finished = await poll();
                if (finished) clearInterval(timer);
              }, 3000);
            }
          } catch (err) {
            detailPaymentStatus.innerHTML = `<p style="color:#721c24;">Error al generar el cobro: ${escapeHtml(err.message)}</p>`;
            btnDetailPay.disabled = false;
            btnDetailPay.textContent = 'Reintentar pago';
          }
        });
      }
    }
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