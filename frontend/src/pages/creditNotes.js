import {
  getInvoices,
  getCreditNotes,
  getCorrectionConcepts,
  createCreditNote,
} from '../services/api.js';
import { loader, emptyState, alertBox, badge } from '../components/ui.js';
import { escapeHtml, formatCOP, formatDate } from '../utils/format.js';
import { resolveDocUrl } from '../utils/factusAssets.js';
import { qrImageSrc } from '../utils/qr.js';

export async function renderCreditNotesPage(container) {
  container.innerHTML = `
    <div class="page-head">
      <h1>Notas crédito</h1>
      <div class="actions" style="margin-bottom: 0;">
        <a class="btn btn-secondary" href="#/facturas">Ver facturas</a>
        <a class="btn btn-primary" href="#/facturas/nueva">Nueva factura</a>
      </div>
    </div>

    <section class="panel stack" aria-labelledby="cn-create">
      <h2 id="cn-create">Crear nota crédito sobre una factura emitida</h2>
      <div class="panel-body">
        <div id="cn-alert" style="display:none;" class="alert-inline"></div>

        <div class="form-group">
          <label for="cn-invoice"><strong>Factura emitida:</strong></label>
          <select id="cn-invoice" class="form-control" disabled>
            <option value="">Cargando facturas emitidas…</option>
          </select>
        </div>

        <div id="cn-invoice-info" class="info-box" style="display:none;"></div>

        <div class="form-group">
          <label for="cn-concept"><strong>Concepto de corrección:</strong></label>
          <select id="cn-concept" class="form-control" disabled>
            <option value="">Cargando conceptos…</option>
          </select>
        </div>

        <div class="form-group">
          <label for="cn-observation"><strong>Observación:</strong></label>
          <textarea id="cn-observation" class="form-control" rows="2" placeholder="Motivo de la nota crédito"></textarea>
        </div>

        <div class="form-actions">
          <button id="cn-submit" class="btn btn-primary" disabled>Emitir nota crédito</button>
        </div>

        <div id="cn-result" style="display:none; margin-top: 16px;"></div>
      </div>
    </section>

    <section class="panel stack" aria-labelledby="cn-list" style="margin-top: 1.5rem;">
      <h2 id="cn-list">Notas crédito registradas</h2>
      <div data-notes>${loader('Cargando notas crédito…')}</div>
    </section>`;

  const invoiceSelect = container.querySelector('#cn-invoice');
  const conceptSelect = container.querySelector('#cn-concept');
  const observationInput = container.querySelector('#cn-observation');
  const infoBox = container.querySelector('#cn-invoice-info');
  const alertBoxEl = container.querySelector('#cn-alert');
  const submitBtn = container.querySelector('#cn-submit');
  const resultBox = container.querySelector('#cn-result');
  const notesEl = container.querySelector('[data-notes]');

  const showAlert = (message, isError = true) => {
    alertBoxEl.style.display = 'block';
    alertBoxEl.textContent = message;
    alertBoxEl.classList.toggle('is-error', isError);
    alertBoxEl.classList.toggle('is-ok', !isError);
  };
  const hideAlert = () => {
    alertBoxEl.style.display = 'none';
    alertBoxEl.textContent = '';
  };

  let issuedInvoices = [];
  let selectedInvoice = null;

  const updateSubmitState = () => {
    submitBtn.disabled = !(selectedInvoice && conceptSelect.value);
  };

  invoiceSelect.addEventListener('change', () => {
    hideAlert();
    resultBox.style.display = 'none';
    const id = invoiceSelect.value;
    selectedInvoice = issuedInvoices.find((i) => (i._id || i.id) === id) || null;

    if (!selectedInvoice) {
      infoBox.style.display = 'none';
      updateSubmitState();
      return;
    }

    // Muestra la información real de la factura seleccionada
    const cust = typeof selectedInvoice.customer === 'object' && selectedInvoice.customer
      ? selectedInvoice.customer
      : null;
    infoBox.style.display = 'block';
    infoBox.innerHTML = `
      <p><strong>Número:</strong> ${escapeHtml(selectedInvoice.numbering || selectedInvoice.referenceCode || 'No disponible')}</p>
      <p><strong>Cliente:</strong> ${escapeHtml(cust?.names || cust?.name || 'No disponible')}${cust?.identificationNumber ? ` · ${escapeHtml(cust.identificationNumber)}` : ''}</p>
      <p><strong>Fecha:</strong> ${selectedInvoice.createdAt ? formatDate(selectedInvoice.createdAt) : 'No disponible'}</p>
      <p><strong>Total:</strong> ${formatCOP(selectedInvoice.grandTotal || 0)} (Impuestos ${formatCOP(selectedInvoice.taxTotal || 0)})</p>
      <p><strong>Estado:</strong> ${escapeHtml(selectedInvoice.status || '')}</p>`;
    updateSubmitState();
  });

  conceptSelect.addEventListener('change', () => {
    hideAlert();
    updateSubmitState();
  });

  submitBtn.addEventListener('click', async () => {
    if (!selectedInvoice) return;
    const invoiceId = selectedInvoice._id || selectedInvoice.id;

    hideAlert();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Emitiendo en Factus…';

    try {
      const res = await createCreditNote({
        invoiceId,
        correctionConceptCode: conceptSelect.value,
        observation: observationInput.value.trim() || undefined,
      });
      const note = res?.data || res;

      const qrSrc = await qrImageSrc(note.qrCodeUrl);
      const docUrl = resolveDocUrl(note);

      resultBox.style.display = 'block';
      resultBox.className = 'result-box';
      resultBox.innerHTML = `
        <h3>Nota crédito emitida</h3>
        <p><strong>Número:</strong> ${escapeHtml(note.numbering || 'No disponible')}</p>
        <p><strong>Factura referenciada:</strong> ${escapeHtml(note.billNumber || 'No disponible')}</p>
        <p><strong>Concepto de corrección:</strong> ${escapeHtml(note.correctionConceptCode || '')}</p>
        <p><strong>Total:</strong> ${formatCOP(note.total || 0)}</p>
        <p><strong>CUDE:</strong> <span class="mono">${escapeHtml(note.cude || 'No disponible')}</span></p>
        <div style="margin: 10px 0;">
          ${qrSrc
            ? `<img src="${qrSrc}" alt="Código QR de la nota crédito" width="160" height="160" />`
            : '<p class="muted">QR: No disponible</p>'}
        </div>
        ${docUrl
          ? `<a class="btn btn-primary" href="${escapeHtml(docUrl)}" target="_blank" rel="noopener noreferrer">Ver documento público (Factus)</a>`
          : '<p class="muted">Documento público: No disponible</p>'}`;

      observationInput.value = '';
      showAlert('Nota crédito creada y validada por Factus.', false);
      await loadNotes();
    } catch (err) {
      const details = err?.details && typeof err.details === 'object'
        ? ` ${String(JSON.stringify(err.details.message || err.details)).slice(0, 300)}`
        : '';
      showAlert(`Error al emitir la nota crédito: ${err?.message || 'error desconocido'}${details}`);
    } finally {
      submitBtn.textContent = 'Emitir nota crédito';
      updateSubmitState();
    }
  });

  async function loadNotes() {
    try {
      const notes = await getCreditNotes();
      if (!notesEl.isConnected) return;

      if (!notes.length) {
        notesEl.innerHTML = emptyState({
          title: 'Aún no hay notas crédito',
          text: 'Las notas crédito que emitas sobre facturas aparecerán aquí.',
        });
        return;
      }

      const rows = notes.map((n) => {
        const docUrl = resolveDocUrl(n);
        return `
          <tr>
            <td>${escapeHtml(n.numbering || n.referenceCode || 'No disponible')}</td>
            <td>${escapeHtml(n.billNumber || 'No disponible')}</td>
            <td>${escapeHtml(n.customerNames || 'No disponible')}</td>
            <td>${n.createdAt ? formatDate(n.createdAt) : '—'}</td>
            <td class="num">${formatCOP(n.total || 0)}</td>
            <td>${badge(n.status === 'ISSUED' ? 'ISSUED' : 'ERROR')}</td>
            <td>${docUrl
              ? `<a class="btn btn-secondary btn-small" href="${escapeHtml(docUrl)}" target="_blank" rel="noopener noreferrer">Documento</a>`
              : '<span class="muted">No disponible</span>'}</td>
          </tr>`;
      }).join('');

      notesEl.innerHTML = `
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>Número</th><th>Factura</th><th>Cliente</th><th>Fecha</th>
                <th class="num">Total</th><th>Estado</th><th>Documento</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    } catch (err) {
      if (!notesEl.isConnected) return;
      notesEl.innerHTML = alertBox({
        title: 'No pudimos cargar las notas crédito',
        text: err?.message || 'Intenta nuevamente.',
        actionLabel: 'Intentar de nuevo',
      });
      notesEl.querySelector('[data-retry]')?.addEventListener('click', loadNotes);
    }
  }

  async function init() {
    const [invoicesRes, conceptsRes] = await Promise.allSettled([
      getInvoices(),
      getCorrectionConcepts(),
    ]);

    const invoices = invoicesRes.status === 'fulfilled' ? invoicesRes.value : [];
    issuedInvoices = invoices
      .filter((i) => i.status === 'ISSUED')
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    invoiceSelect.innerHTML = '<option value="">Seleccione una factura emitida…</option>';
    if (invoicesRes.status === 'rejected') {
      invoiceSelect.innerHTML += '<option value="" disabled>No se pudieron cargar las facturas</option>';
      showAlert(`No se pudieron cargar las facturas: ${invoicesRes.reason?.message || 'error'}`);
    } else if (!issuedInvoices.length) {
      invoiceSelect.innerHTML += '<option value="" disabled>No hay facturas emitidas (ISSUED)</option>';
    } else {
      issuedInvoices.forEach((inv) => {
        const id = escapeHtml(inv._id || inv.id);
        const cust = typeof inv.customer === 'object' && inv.customer ? inv.customer : null;
        const label = `${inv.numbering || inv.referenceCode || id} · ${cust?.names || cust?.name || 'Cliente'} · ${formatCOP(inv.grandTotal || 0)}`;
        invoiceSelect.insertAdjacentHTML('beforeend', `<option value="${id}">${escapeHtml(label)}</option>`);
      });
    }
    invoiceSelect.disabled = false;

    const concepts = conceptsRes.status === 'fulfilled' ? conceptsRes.value : [];
    conceptSelect.innerHTML = '<option value="">Seleccione un concepto…</option>';
    if (!concepts.length) {
      conceptSelect.innerHTML += '<option value="" disabled>No hay conceptos disponibles</option>';
      if (conceptsRes.status === 'rejected') {
        showAlert(`No se pudieron cargar los conceptos: ${conceptsRes.reason?.message || 'error'}`);
      }
    } else {
      concepts.forEach((c) => {
        conceptSelect.insertAdjacentHTML(
          'beforeend',
          `<option value="${escapeHtml(c.code)}">${escapeHtml(c.code)} · ${escapeHtml(c.name)}</option>`
        );
      });
    }
    conceptSelect.disabled = false;
    updateSubmitState();

    await loadNotes();
  }

  init();
}

