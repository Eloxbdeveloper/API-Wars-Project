import { getCustomers, getProducts, createInvoiceDraft, issueInvoice } from '../services/api.js';
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

      <!-- PANTALLA DE REVISIÓN Y EMISIÓN -->
      <div id="draft-review-container" style="display: none; margin-top: 20px; padding: 15px; border: 1px solid #ccc; border-radius: 6px;" class="review-box">
        <h4>Revisión del Borrador</h4>
        <div id="review-details" style="margin: 10px 0;"></div>
        <div class="actions">
          <button id="btn-confirm-issue" class="btn btn-success">Confirmar y Emitir a Factus</button>
        </div>
      </div>

      <!-- VISTA DE RESULTADO FINAL (FACTUS) -->
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

  const selectCustomer = container.querySelector('#select-customer');
  const itemsContainer = container.querySelector('#items-container');
  const btnAddItem = container.querySelector('#btn-add-item');
  const formDraft = container.querySelector('#form-invoice-draft');
  const alertContainer = container.querySelector('#invoice-alert-container');

  const draftReview = container.querySelector('#draft-review-container');
  const reviewDetails = container.querySelector('#review-details');
  const btnConfirmIssue = container.querySelector('#btn-confirm-issue');
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

  // Botón para reiniciar flujo y crear otra factura
  if (btnNewAgain) {
    btnNewAgain.addEventListener('click', () => {
      issueResult.style.display = 'none';
      formDraft.style.display = 'block';
      formDraft.reset();
      itemsContainer.innerHTML = '';
      addProductRow();
      currentDraftId = null;
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

  // Crear DRAFT con revisión detallada
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

  // Confirmar y Emitir
  btnConfirmIssue.addEventListener('click', async () => {
    if (!currentDraftId) return;

    btnConfirmIssue.disabled = true;
    btnConfirmIssue.textContent = 'Emitiendo a Factus...';
    hideAlert();

    try {
      const res = await issueInvoice(currentDraftId);
      const issued = res.data || res;

      draftReview.style.display = 'none';
      formDraft.style.display = 'none';

      container.querySelector('#res-number').textContent = issued.numbering || issued.number || 'No disponible';
      container.querySelector('#res-status').textContent = issued.status || 'No disponible';
      container.querySelector('#res-cufe').textContent = issued.cufe || 'No disponible';

      // QR real: se codifica el contenido devuelto por Factus/DIAN como imagen visible
      const qrContainer = container.querySelector('#res-qr-container');
      const qrImg = await qrImageSrc(resolveQrSrc(issued));
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
    } catch (err) {
      showAlert('Error en emisión: ' + err.message);
      btnConfirmIssue.disabled = false;
      btnConfirmIssue.textContent = 'Confirmar y Emitir a Factus';
    }
  });
}
