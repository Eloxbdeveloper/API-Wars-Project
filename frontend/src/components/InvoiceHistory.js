import { invoiceService } from '../services/invoiceService.js';

export class InvoiceHistory {
  constructor(containerElement) {
    this.container = containerElement;
    this.state = {
      loading: false,
      error: null,
      invoices: [],
      selectedInvoice: null
    };
  }

  async init() {
    await this.loadInvoices();
  }

  async loadInvoices() {
    this.state.loading = true;
    this.state.error = null;
    this.render();

    try {
      this.state.invoices = await invoiceService.getInvoices();
    } catch (err) {
      this.state.error = err.message;
    } finally {
      this.state.loading = false;
      this.render();
    }
  }

  handleSelectInvoice(invoiceId) {
    const invoice = this.state.invoices.find(inv => inv.id == invoiceId);
    this.state.selectedInvoice = invoice || null;
    this.render();
  }

  handleCloseDetail() {
    this.state.selectedInvoice = null;
    this.render();
  }

  render() {
    if (!this.container) return;

    // Si hay una factura seleccionada, mostramos su vista de detalle
    if (this.state.selectedInvoice) {
      const inv = this.state.selectedInvoice;
      this.container.innerHTML = `
        <div class="invoice-detail-view">
          <button type="button" id="btn-back" class="btn-secondary">← Volver al Historial</button>
          <h2>Detalle de Factura #${inv.referenceCode || inv.id}</h2>

          <div class="section-card">
            <p><strong>Estado:</strong> <span class="badge status-${inv.status?.toLowerCase()}">${inv.status || 'Emitida'}</span></p>
            <p><strong>Fecha:</strong> ${inv.createdAt ? new Date(inv.createdAt).toLocaleString() : 'N/A'}</p>
            <p><strong>ID Factus / DIAN:</strong> ${inv.factusId || 'Pendiente / N/A'}</p>
          </div>

          <div class="section-card">
            <h3>Información del Cliente</h3>
            <p><strong>Nombre:</strong> ${inv.customer?.name || inv.customerName || 'N/A'}</p>
            <p><strong>NIT / CC:</strong> ${inv.customer?.identification || inv.customerIdentification || 'N/A'}</p>
            <p><strong>Email:</strong> ${inv.customer?.email || inv.customerEmail || 'N/A'}</p>
          </div>

          <div class="section-card">
            <h3>Ítems Facturados</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Cantidad</th>
                  <th>Precio Unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${(inv.items || []).map(item => `
                  <tr>
                    <td>${item.productName || item.description || 'Producto'}</td>
                    <td>${item.quantity}</td>
                    <td>$${(item.unitPrice \vert{}\vert{} 0).toLocaleString()}</td>                     <td>$${((item.unitPrice || 0) * (item.quantity || 1)).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totals-summary" style="margin-top: 15px; text-align: right;">
              <p>Subtotal: <span>$${(inv.subtotal || 0).toLocaleString()}</span></p>
              <p>Impuestos: <span>$${(inv.tax || inv.totalTax || 0).toLocaleString()}</span></p>
              <h3>Total: <span>$${(inv.total || 0).toLocaleString()}</span></h3>
            </div>
          </div>
        </div>
      `;

      this.container.querySelector('#btn-back').addEventListener('click', () => this.handleCloseDetail());
      return;
    }

    // Vista principal del Historial
    this.container.innerHTML = `
      <div class="invoice-history">
        <div class="header-flex" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2>Historial de Facturas</h2>
          <button type="button" id="btn-refresh" class="btn-secondary">Actualizar</button>
        </div>

        ${this.state.error ? `<div class="alert error">${this.state.error}</div>` : ''}

        ${this.state.loading ? '<p>Cargando historial de facturas...</p>' : `
          <table class="items-table">
            <thead>
              <tr>
                <th>Referencia</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${this.state.invoices.length === 0 ? '<tr><td colspan="6" style="text-align:center;">No hay facturas registradas en el historial.</td></tr>' :
                this.state.invoices.map(inv => `
                  <tr>
                    <td><strong>${inv.referenceCode || `#${inv.id}`}</strong></td>
                    <td>${inv.customer?.name || inv.customerName || 'Cliente'}</td>
                    <td>${inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td>$${(inv.total || 0).toLocaleString()}</td>
                    <td><span class="badge status-${inv.status?.toLowerCase()}">${inv.status || 'Emitida'}</span></td>
                    <td>
                      <button type="button" class="btn-select btn-detail" data-id="${inv.id}">Ver Detalle</button>
                    </td>
                  </tr>
                `).join('')
              }
            </tbody>
          </table>
        `}
      </div>
    `;

    // Event Listeners
    const btnRefresh = this.container.querySelector('#btn-refresh');
    if (btnRefresh) {
      btnRefresh.addEventListener('click', () => this.loadInvoices());
    }

    this.container.querySelectorAll('.btn-detail').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        this.handleSelectInvoice(id);
      });
    });
  }
}
