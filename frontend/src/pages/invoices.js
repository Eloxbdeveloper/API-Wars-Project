import { 
  getCustomers, 
  getProducts, 
  getInvoices, 
  getInvoiceById,
  createInvoiceDraft, 
  issueInvoice 
} from '../services/api.js';
import { escapeHtml, formatCOP, formatDate } from '../utils/format.js';

export async function renderInvoicesPage(container) {
  container.innerHTML = `
    <div class="header-actions" style="display: flex; gap: 10px; margin-bottom: 20px;">
      <h2>Gestión de Facturación</h2>
      <button id="btn-show-create" class="btn btn-primary">Nueva Factura</button>
      <button id="btn-show-history" class="btn btn-secondary">Ver Historial</button>
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
        <p><strong>CUFE:</strong> <span id="res-cufe" style="word-break: break-all; font-family: monospace;"></span></p>
        <div id="res-qr-container" style="margin: 15px 0;"></div>
        <div style="margin-top: 1rem;">
          <a id="res-public-url" href="#" target="_blank" rel="noopener noreferrer" class="btn btn-link">Ver Documento Público (Factus)</a>
        </div>
        <div style="margin-top: 1.5rem;">
          <button id="btn-new-invoice-again" class="btn btn-primary">Crear Otra Factura</button>
        </div>
      </div>
    </section>

    <!-- SECCIÓN 2: HISTORIAL DE FACTURAS -->
    <section id="section-invoice-history" class="card-section" style="display: none;">
      <h3>Historial de Facturas</h3>
      <div id="history-loading">Cargando historial...</div>
      <table id="table-history" class="data-table" style="display: none; width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="border-bottom: 2px solid #ccc; text-align: left;">
            <th style="padding: 8px;">Número / Ref</th>
            <th style="padding: 8px;">Cliente</th>
            <th style="padding: 8px;">Fecha</th>
            <th style="padding: 8px;">Total</th>
            <th style="padding: 8px;">Estado</th>
            <th style="padding: 8px;">Acción</th>
          </tr>
        </thead>
        <tbody id="history-rows"></tbody>
      </table>
    </section>

    <!-- MODAL / VISTA DE DETALLE DE FACTURA -->
    <div id="invoice-detail-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center;">
      <div style="background: white; padding: 20px; border-radius: 8px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto;">
        <h3>Detalle de Factura</h3>
        <div id="modal-detail-content" style="margin: 15px 0;"></div>
        <div style="text-align: right;">
          <button type="button" id="btn-close-modal" class="btn btn-secondary">Cerrar</button>
        </div>
      </div>
    </div>
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

  const btnShowCreate = container.querySelector('#btn-show-create');
  const btnShowHistory = container.querySelector('#btn-show-history');
  const secCreate = container.querySelector('#section-create-invoice');
  const secHistory = container.querySelector('#section-invoice-history');
  const btnNewAgain = container.querySelector('#btn-new-invoice-again');

  const detailModal = container.querySelector('#invoice-detail-modal');
  const modalContent = container.querySelector('#modal-detail-content');
  const btnCloseModal = container.querySelector('#btn-close-modal');

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

  // Alternar pestañas
  btnShowCreate.addEventListener('click', () => {
    secCreate.style.display = 'block';
    secHistory.style.display = 'none';
    hideAlert();
  });

  btnShowHistory.addEventListener('click', async () => {
    secCreate.style.display = 'none';
    secHistory.style.display = 'block';
    hideAlert();
    await loadInvoiceHistory(container);
  });

  // Cerrar modal de detalle
  btnCloseModal.addEventListener('click', () => {
    detailModal.style.display = 'none';
  });

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

      container.querySelector('#res-number').textContent = escapeHtml(issued.numbering || issued.number || issued.bill_number || 'Emitido');
      container.querySelector('#res-cufe').textContent = escapeHtml(issued.cufe || 'N/A');
      
      const qrContainer = container.querySelector('#res-qr-container');
      const qrUrl = issued.qrCodeUrl || issued.qr || issued.qr_code;
      if (qrUrl) {
        qrContainer.innerHTML = `<img src="${escapeHtml(qrUrl)}" alt="Código QR Factura" style="max-width: 150px; border: 1px solid #ddd; padding: 4px;"/>`;
      } else {
        qrContainer.innerHTML = '<span style="color: #66c;">(QR no disponible en esta respuesta)</span>';
      }

      const publicUrlBtn = container.querySelector('#res-public-url');
      const finalPdfUrl = issued.pdfUrl || issued.publicUrl || issued.url;
      if (finalPdfUrl) {
        publicUrlBtn.href = finalPdfUrl;
        publicUrlBtn.style.display = 'inline-block';
      } else {
        publicUrlBtn.style.display = 'none';
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

// Historial y Detalle por ID
async function loadInvoiceHistory(container) {
  const loading = container.querySelector('#history-loading');
  const table = container.querySelector('#table-history');
  const tbody = container.querySelector('#history-rows');
  const detailModal = container.querySelector('#invoice-detail-modal');
  const modalContent = container.querySelector('#modal-detail-content');

  loading.style.display = 'block';
  table.style.display = 'none';

  try {
    const res = await getInvoices();
    const invoices = Array.isArray(res) ? res : (res?.data && Array.isArray(res.data) ? res.data : (res?.data?.data || res?.data?.items || []));

    tbody.innerHTML = '';

    if (!invoices || invoices.length === 0) {
      loading.textContent = 'No hay facturas registradas.';
      return;
    }

    invoices.forEach(inv => {
      const invId = escapeHtml(inv._id || inv.id);
      const customerName = escapeHtml(inv.customer?.names || inv.customer?.name || inv.customer?.legal_name || 'N/A');
      const refNumber = escapeHtml(inv.numbering || inv.referenceCode || invId);
      const invoiceTotal = inv.grandTotal ?? inv.total ?? 0;
      const invStatus = escapeHtml(inv.status || 'DRAFT');

      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid #eee';
      tr.innerHTML = `
        <td style="padding: 8px;">${refNumber}</td>
        <td style="padding: 8px;">${customerName}</td>
        <td style="padding: 8px;">${formatDate(inv.createdAt || Date.now())}</td>
        <td style="padding: 8px;">${formatCOP(invoiceTotal)}</td>
        <td style="padding: 8px;"><span class="badge state-${invStatus.toLowerCase()}">${invStatus}</span></td>
        <td style="padding: 8px;"><button class="btn btn-small btn-secondary btn-detail" data-id="${invId}">Ver Detalle</button></td>
      `;

      tr.querySelector('.btn-detail').addEventListener('click', async () => {
        modalContent.innerHTML = 'Cargando detalle...';
        detailModal.style.display = 'flex';

        try {
          const detailRes = await getInvoiceById(invId);
          const detail = detailRes.data || detailRes;

          const dCust = escapeHtml(detail.customer?.names || detail.customer?.name || 'Cliente');
          const dNum = escapeHtml(detail.numbering || detail.referenceCode || 'N/A');
          const dCufe = escapeHtml(detail.cufe || 'No emitido o no disponible');
          const dStatus = escapeHtml(detail.status || 'DRAFT');
          const dSub = formatCOP(detail.subtotal || 0);
          const dTax = formatCOP(detail.taxTotal || 0);
          const dTotal = formatCOP(detail.grandTotal || 0);
          const dPdf = detail.pdfUrl;
          const dQr = detail.qrCodeUrl;

          let itemsList = '<ul>';
          if (Array.isArray(detail.items)) {
            detail.items.forEach(i => {
              itemsList += `<li>${i.quantity || 1}x ${escapeHtml(i.name || 'Producto')} - ${formatCOP(i.unitPrice || 0)}</li>`;
            });
          }
          itemsList += '</ul>';

          modalContent.innerHTML = `
            <p><strong>Número / Ref:</strong> ${dNum}</p>
            <p><strong>Estado:</strong> ${dStatus}</p>
            <p><strong>Cliente:</strong> ${dCust}</p>
            <p><strong>Productos:</strong></p>
            ${itemsList}
            <p><strong>Subtotal:</strong> ${dSub}</p>
            <p><strong>Impuestos:</strong> ${dTax}</p>
            <p><strong>Total:</strong> ${dTotal}</p>
            <hr style="margin: 10px 0;" />
            <p><strong>CUFE:</strong> <span style="font-family: monospace; word-break: break-all;">${dCufe}</span></p>
            ${dQr ? `<div style="margin: 10px 0;"><img src="${escapeHtml(dQr)}" alt="QR" style="max-width: 120px;" /></div>` : ''}
            ${dPdf ? `<p><a href="${escapeHtml(dPdf)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="padding: 6px 12px; font-size: 0.9rem;">Ver Documento Público (PDF/Factus)</a></p>` : ''}
          `;
        } catch (detailErr) {
          modalContent.innerHTML = `<p style="color: red;">Error al cargar el detalle: ${escapeHtml(detailErr.message)}</p>`;
        }
      });

      tbody.appendChild(tr);
    });

    loading.style.display = 'none';
    table.style.display = 'table';
  } catch (err) {
    loading.textContent = 'Error al cargar historial: ' + err.message;
  }
}