import { getCustomers, getProducts, createInvoiceDraft, issueInvoice, createPayment, getPayment, getInvoiceById } from '../services/api.js';
import { escapeHtml, formatCOP } from '../utils/format.js';
import { resolveQrSrc, resolveDocUrl } from '../utils/factusAssets.js';
import { qrImageSrc } from '../utils/qr.js';

export async function renderInvoicesPage(container) {
  container.innerHTML = `
    <div class="page-head">
      <h1>Nueva factura</h1>
      <div class="actions" style="margin-bottom: 0;">
        <a class="btn btn-secondary" href="#/facturas">Ver facturas</a>
        <a class="btn btn-secondary" href="#/dashboard">Estadísticas</a>
        <a class="btn btn-secondary" href="#/notas-credito">Notas crédito</a>
      </div>
    </div>

    <!-- CONTENEDOR DE ALERTAS / ERRORES -->
    <div id="invoice-alert-container" style="display: none; margin-bottom: 15px;" class="alert-box"></div>

    <!-- SECCIÓN 1: CREAR FACTURA / REVISIÓN -->
    <section id="section-create-invoice" class="card-section">
      <h3>Crear Factura Electrónica</h3>
      <form id="form-invoice-draft">
        <div class="form-group" style="margin-bottom: 15px;">
          <label for="select-customer"><strong>Cliente:</strong></label>
          <select id="select-customer" class="form-control" required style="width: 100%; padding: 8px; margin-top: 5px;">
            <option value="">Cargando clientes...</option>
          </select>
        </div>

        <h4>Productos</h4>
        <div id="items-container" style="margin-bottom: 15px;"></div>
        <button type="button" id="btn-add-item" class="btn btn-small btn-secondary">+ Agregar Producto</button>

        <div class="form-actions" style="margin-top: 1.5rem;">
          <button type="submit" id="btn-save-draft" class="btn btn-primary">Generar Borrador (DRAFT)</button>
        </div>
      </form>

      <!-- PANTALLA DE REVISIÓN Y PAGO -->
      <div id="draft-review-container" style="display: none; margin-top: 20px; padding: 15px; border: 1px solid #ccc; border-radius: 6px;" class="review-box">
        <h4>Revisión del Borrador</h4>
        <div id="review-details" style="margin: 10px 0;"></div>
        <div class="actions">
          <button id="btn-confirm-pay" class="btn btn-success">Pagar y Generar Factura</button>
        </div>
      </div>

      <!-- PANTALLA DE PAGO (QR / POLLING) -->
      <div id="payment-status-container" style="display: none; margin-top: 20px; padding: 15px; border: 1px solid #007bff; border-radius: 6px; background-color: #f8f9fa;" class="payment-box">
        <h4>Pago mediante Factus Pay</h4>
        <p>Escanea el código QR o usa la referencia para pagar.</p>
        <p><strong>Referencia:</strong> <span id="pay-reference"></span></p>
        <p><strong>Monto:</strong> <span id="pay-amount"></span></p>
        <div id="pay-qr-container" style="margin: 15px 0;"></div>
        <p id="pay-status-text" style="margin: 10px 0; font-weight: bold;"></p>
      </div>

      <!-- VISTA DE RESULTADO FINAL (FACTURA EMITIDA) -->
      <div id="issue-result-container" style="display: none; margin-top: 20px; padding: 15px; border: 1px solid #28a745; border-radius: 6px; background-color: #f8fff9;" class="result-box">
        <h3 style="color: #28a745;">¡Factura Emitida Correctamente!</h3>
        <p><strong>Número:</strong> <span id="res-number"></span></p>
        <p><strong>Estado:</strong> <span id="res-status"></span></p>
        <p><strong>CUFE:</strong> <span id="res-cufe" style="word-break: break-all; font-family: monospace;"></span></p>
        <div id="res-qr-container" style="margin: 15px 0;"></div>
        <div style="margin-top: 1rem; display: flex; flex-wrap: wrap; gap: 10px;">
          <a id="res-public-url" href="#" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Ver Documento Público (Factus)</a>
          <a id="res-detail-url" href="#/facturas" class="btn btn-secondary">Ver detalle de la factura</a>
        </div>
        <div style="margin-top: 1.5rem;">
          <button id="btn-new-invoice-again" class="btn btn-secondary">Crear Otra Factura</button>
        </div>
      </div>
    </section>
  `;

  await initInvoicesModule(container);
}

async function initInvoicesModule(container) {
  let availableProducts = [];
  let currentDraftId = null;
  let pollTimer = null;
  let currentPaymentRef = null;

  const selectCustomer = container.querySelector('#select-customer');
  const itemsContainer = container.querySelector('#items-container');
  const btnAddItem = container.querySelector('#btn-add-item');
  const formDraft = container.querySelector('#form-invoice-draft');
  const alertContainer = container.querySelector('#invoice-alert-container');

  const draftReview = container.querySelector('#draft-review-container');
  const reviewDetails = container.querySelector('#review-details');
  const btnConfirmPay = container.querySelector('#btn-confirm-pay');
  const paymentStatus = container.querySelector('#payment-status-container');
  const payReference = container.querySelector('#pay-reference');
  const payAmount = container.querySelector('#pay-amount');
  const payQrContainer = container.querySelector('#pay-qr-container');
  const payStatusText = container.querySelector('#pay-status-text');
  const issueResult = container.querySelector('#issue-result-container');

  const btnNewAgain = container.querySelector('#btn-new-invoice-again');

  function showAlert(message, isError = true) {
    alertContainer.style.display = 'block';
    alertContainer.style.padding = '10px';
    alertContainer.style.backgroundColor = isError ? '#f8d7da' : '#d4edda';
    alertContainer.style.color = isError ? '#721c24' : '#155724';
    alertContainer.style.borderColor = isError ? '#f5c6cb' : '#c3e6cb';
    alertContainer.textContent = message;
  }

  function hideAlert() {
    alertContainer.style.display = 'none';
    alertContainer.textContent = '';
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  async function checkPaymentStatus() {
    if (!currentPaymentRef) return;
    try {
      const res = await getPayment(currentPaymentRef);
      const payment = res.data || res;
      if (!payment) return;

      const status = String(payment.status || '').toLowerCase();
      if (status === 'paid') {
        stopPolling();
        payStatusText.textContent = '¡Pago confirmado! Emitiendo factura...';
        payStatusText.style.color = '#155724';

        try {
          const invoiceRes = await getInvoiceById(currentDraftId);
          const issued = invoiceRes.data || invoiceRes;
          showIssuedResult(issued);
        } catch (invoiceErr) {
          showAlert('Pago confirmado, pero no se pudo cargar la factura emitida: ' + invoiceErr.message);
        }
      } else if (status === 'failed' || status === 'rejected') {
        stopPolling();
        payStatusText.textContent = `Pago ${status === 'failed' ? 'rechazado por el banco' : 'rechazado en Factus Pay'}. Intenta nuevamente.`;
        payStatusText.style.color = '#721c24';
} else {
      const qrSrc = await qrImageSrc(payment.qr || '');
      const simulatorUrl = 'https://pay-api-sandbox.factus.com.co/simulator';
      payStatusText.innerHTML = `
        Estado del pago: <strong>${escapeHtml(status)}</strong> (ESPERANDO PAGO)
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
      payStatusText.style.color = '#004085';
      if (qrSrc) {
        payQrContainer.innerHTML = `<img src="${qrSrc}" alt="Código QR de pago" width="200" height="200" />`;
      }
    }
    } catch (err) {
      console.error('Error consultando pago:', err);
    }
  }

  function showIssuedResult(issued) {
    paymentStatus.style.display = 'none';
    draftReview.style.display = 'none';
    formDraft.style.display = 'none';

    container.querySelector('#res-number').textContent = issued.numbering || issued.number || 'No disponible';
    container.querySelector('#res-status').textContent = issued.status || 'No disponible';
    container.querySelector('#res-cufe').textContent = issued.cufe || 'No disponible';

    const qrContainer = container.querySelector('#res-qr-container');
    const qrImg = qrImageSrc(resolveQrSrc(issued));
    if (qrImg) {
      qrContainer.innerHTML = `<img src="${qrImg}" alt="Código QR de la factura" width="180" height="180" />`;
    } else {
      qrContainer.innerHTML = '<p class="muted">QR: No disponible</p>';
    }

    const publicUrlBtn = container.querySelector('#res-public-url');
    const finalPdfUrl = resolveDocUrl(issued);
    if (finalPdfUrl) {
      publicUrlBtn.href = finalPdfUrl;
      publicUrlBtn.style.display = '';
    } else {
      publicUrlBtn.style.display = 'none';
    }

    const detailLink = container.querySelector('#res-detail-url');
    const issuedId = issued._id || issued.id;
    if (issuedId) {
      detailLink.href = `#/facturas/${issuedId}`;
      detailLink.style.display = '';
    } else {
      detailLink.style.display = 'none';
    }

    issueResult.style.display = 'block';
    issueResult.scrollIntoView({ behavior: 'smooth' });
  }

  if (btnNewAgain) {
    btnNewAgain.addEventListener('click', () => {
      stopPolling();
      currentDraftId = null;
      currentPaymentRef = null;
      issueResult.style.display = 'none';
      paymentStatus.style.display = 'none';
      draftReview.style.display = 'none';
      formDraft.style.display = 'block';
      formDraft.reset();
      itemsContainer.innerHTML = '';
      addProductRow();
    });
  }

  function extractArray(response) {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.data)) return response.data.data;
    if (response.data && response.data.items && Array.isArray(response.data.items)) return response.data.items;
    if (response.docs && Array.isArray(response.docs)) return response.docs;
    if (response.results && Array.isArray(response.results)) return response.results;
    return [];
  }

  function addProductRow() {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.style.display = 'flex';
    row.style.flexWrap = 'wrap';
    row.style.gap = '10px';
    row.style.marginBottom = '10px';

    let optionsHTML = '<option value="">Seleccione producto...</option>';
    if (availableProducts.length === 0) {
      optionsHTML += '<option value="" disabled>(No hay productos disponibles)</option>';
    } else {
      availableProducts.forEach(p => {
        const pId = escapeHtml(p._id || p.id);
        const pName = escapeHtml(p.name || p.title || p.code || 'Producto sin nombre');
        const pPrice = p.price ? ` ($${p.price})` : '';
        optionsHTML += `<option value="${pId}">${pName}${pPrice}</option>`;
      });
    }

    row.innerHTML = `
      <select class="item-product form-control" required style="flex: 2; padding: 6px;">${optionsHTML}</select>
      <input type="number" class="item-qty form-control" min="1" value="1" required style="flex: 1; padding: 6px;" />
      <button type="button" class="btn-remove-row btn btn-danger" style="padding: 6px 12px;">X</button>
    `;

    row.querySelector('.btn-remove-row').addEventListener('click', () => {
      if (itemsContainer.querySelectorAll('.item-row').length > 1) {
        row.remove();
      } else {
        showAlert('La factura debe tener al menos un producto.');
      }
    });
    itemsContainer.appendChild(row);
  }

  btnAddItem.addEventListener('click', () => {
    hideAlert();
    addProductRow();
  });

  try {
    const [customersRes, productsRes] = await Promise.all([getCustomers(), getProducts()]);

    const customers = extractArray(customersRes);
    availableProducts = extractArray(productsRes);

    selectCustomer.innerHTML = '<option value="">Seleccione un cliente...</option>';

    if (!customers || customers.length === 0) {
      selectCustomer.innerHTML += '<option value="" disabled>(No hay clientes registrados)</option>';
    } else {
      customers.forEach(c => {
        const cId = escapeHtml(c._id || c.id);
        const displayName = escapeHtml(c.names || c.name || c.legal_name || c.identificationNumber || 'Cliente sin nombre');
        selectCustomer.innerHTML += `<option value="${cId}">${displayName}</option>`;
      });
    }

    itemsContainer.innerHTML = '';
    addProductRow();

  } catch (err) {
    console.error('Error al cargar datos iniciales:', err);
    showAlert('Error al conectar con el servidor para cargar clientes o productos: ' + err.message);
  }

  formDraft.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const customerId = selectCustomer.value;
    const itemRows = itemsContainer.querySelectorAll('.item-row');

    const items = Array.from(itemRows).map(r => ({
      productId: r.querySelector('.item-product').value,
      quantity: parseInt(r.querySelector('.item-qty').value, 10)
    })).filter(i => i.productId && i.quantity > 0);

    if (items.length === 0) {
      showAlert('Debe agregar al menos un producto válido.');
      return;
    }

    try {
      const response = await createInvoiceDraft({ customerId, items });
      const draft = response.data || response;
      currentDraftId = draft._id || draft.id;

      const subtotalVal = draft.subtotal ?? 0;
      const taxVal = draft.taxTotal ?? draft.taxes ?? 0;
      const grandTotalVal = draft.grandTotal ?? draft.total ?? 0;
      const customerName = escapeHtml(draft.customer?.names || draft.customer?.name || 'Cliente asociado');

      let itemsHtml = '<ul style="margin: 5px 0 15px 20px; padding: 0;">';
      if (Array.isArray(draft.items)) {
        draft.items.forEach(it => {
          const name = escapeHtml(it.name || 'Producto');
          const qty = it.quantity || 1;
          const price = formatCOP(it.unitPrice || 0);
          const tax = it.taxRate ? `${it.taxRate}%` : '0%';
          itemsHtml += `<li>${qty}x ${name} - P/U: ${price} (Impuesto: ${tax})</li>`;
        });
      }
      itemsHtml += '</ul>';

      reviewDetails.innerHTML = `
        <p><strong>ID Borrador:</strong> ${escapeHtml(currentDraftId)}</p>
        <p><strong>Cliente:</strong> ${customerName}</p>
        <p><strong>Productos:</strong></p>
        ${itemsHtml}
        <hr style="border: 0; border-top: 1px solid #ddd; margin: 10px 0;" />
        <p><strong>Subtotal:</strong> ${formatCOP(subtotalVal)}</p>
        <p><strong>Total Impuestos:</strong> ${formatCOP(taxVal)}</p>
        <p><strong>Total Final (Grand Total):</strong> <span style="font-size: 1.1em; color: #007bff; font-weight: bold;">${formatCOP(grandTotalVal)}</span></p>
      `;
      draftReview.style.display = 'block';
      draftReview.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      showAlert('Error creando borrador: ' + err.message);
    }
  });

  btnConfirmPay.addEventListener('click', async () => {
    if (!currentDraftId) return;

    btnConfirmPay.disabled = true;
    btnConfirmPay.textContent = 'Generando cobro en Factus Pay...';
    hideAlert();

    try {
      const payRes = await createPayment(currentDraftId);
      const payment = payRes.data || payRes;

      if (!payment || !payment.referenceCode) {
        throw new Error('Factus Pay no devolvió una referencia de cobro válida.');
      }

      currentPaymentRef = payment.referenceCode;
      payReference.textContent = payment.referenceCode;
      payAmount.textContent = formatCOP(Number(payment.amount) || 0);

      const qrSrc = await qrImageSrc(payment.qr || '');
      if (qrSrc) {
        payQrContainer.innerHTML = `<img src="${qrSrc}" alt="Código QR de pago" width="200" height="200" />`;
      } else {
        payQrContainer.innerHTML = '<p class="muted">QR: No disponible aún</p>';
      }

      draftReview.style.display = 'none';
      formDraft.style.display = 'none';
      paymentStatus.style.display = 'block';
      paymentStatus.scrollIntoView({ behavior: 'smooth' });

      payStatusText.textContent = 'Esperando pago...';
      payStatusText.style.color = '#004085';

      pollTimer = setInterval(checkPaymentStatus, 3000);
      checkPaymentStatus();
    } catch (err) {
      showAlert('Error al generar el cobro: ' + err.message);
      btnConfirmPay.disabled = false;
      btnConfirmPay.textContent = 'Pagar y Generar Factura';
    }
  });
}
