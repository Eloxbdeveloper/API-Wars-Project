import { invoiceService } from '../services/invoiceService.js';
import { customerService } from '../services/customerService.js';
import { productService } from '../services/productService.js';

export class InvoiceBuilder {
  constructor(containerElement) {
    this.container = containerElement;
    this.state = {
      loading: false,
      emitting: false,
      error: null,
      successMessage: null,
      customers: [],
      products: [],
      selectedCustomer: null,
      items: [] // { product, quantity, unitPrice, taxRate }
    };
  }

  async init() {
    await this.loadDependencies();
  }

  async loadDependencies() {
    this.state.loading = true;
    this.state.error = null;
    this.render();

    try {
      const [customers, products] = await Promise.all([
        customerService.getCustomers(),
        productService.getProducts()
      ]);
      this.state.customers = customers;
      this.state.products = products;
    } catch (err) {
      this.state.error = 'Error al cargar clientes o productos: ' + err.message;
    } finally {
      this.state.loading = false;
      this.render();
    }
  }

  handleSelectCustomer(customerId) {
    const customer = this.state.customers.find(c => c.id == customerId);
    this.state.selectedCustomer = customer || null;
    this.render();
  }

  handleAddItem(productId, quantity = 1) {
    const product = this.state.products.find(p => p.id == productId);
    if (!product) return;

    const existingItemIndex = this.state.items.findIndex(item => item.product.id == productId);

    if (existingItemIndex > -1) {
      this.state.items[existingItemIndex].quantity += parseInt(quantity);
    } else {
      this.state.items.push({
        product,
        quantity: parseInt(quantity),
        unitPrice: product.price,
        taxRate: product.taxRate || 0
      });
    }
    this.render();
  }

  handleUpdateQuantity(index, quantity) {
    const qty = parseInt(quantity);
    if (qty > 0) {
      this.state.items[index].quantity = qty;
    } else {
      this.state.items.splice(index, 1);
    }
    this.render();
  }

  handleRemoveItem(index) {
    this.state.items.splice(index, 1);
    this.render();
  }

  calculateTotals() {
    let subtotal = 0;
    let totalTax = 0;

    for (const item of this.state.items) {
      const itemSubtotal = item.unitPrice * item.quantity;
      const itemTax = itemSubtotal * (item.taxRate / 100);
      subtotal += itemSubtotal;
      totalTax += itemTax;
    }

    return {
      subtotal,
      totalTax,
      total: subtotal + totalTax
    };
  }

  async handleEmitInvoice() {
    // Validaciones frontend
    if (!this.state.selectedCustomer) {
      this.state.error = 'Debe seleccionar un cliente para emitir la factura.';
      this.render();
      return;
    }

    if (this.state.items.length === 0) {
      this.state.error = 'La factura debe contener al menos un producto o servicio.';
      this.render();
      return;
    }

    const totals = this.calculateTotals();

    const invoicePayload = {
      customerId: this.state.selectedCustomer.id,
      items: this.state.items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate
      })),
      subtotal: totals.subtotal,
      tax: totals.totalTax,
      total: totals.total
    };

    this.state.emitting = true;
    this.state.error = null;
    this.state.successMessage = null;
    this.render();

    try {
      const result = await invoiceService.createInvoice(invoicePayload);
      this.state.successMessage = `¡Factura emitida correctamente! Ref: ${result.referenceCode || 'N/A'} (ID Factus: ${result.factusId || 'N/A'})`;
      // Resetear formulario tras éxito
      this.state.selectedCustomer = null;
      this.state.items = [];
    } catch (err) {
      this.state.error = err.message;
    } finally {
      this.state.emitting = false;
      this.render();
    }
  }

  render() {
    if (!this.container) return;
    const totals = this.calculateTotals();

    this.container.innerHTML = `
      <div class="invoice-builder">
        <h2>Crear y Emitir Factura</h2>

        ${this.state.error ? `<div class="alert error">${this.state.error}</div>` : ''}
        ${this.state.successMessage ? `<div class="alert success">${this.state.successMessage}</div>` : ''}

        ${this.state.loading ? '<p>Cargando datos iniciales...</p>' : `
          
          <!-- 1. Selección de Cliente -->
          <div class="section-card">
            <h3>1. Seleccionar Cliente</h3>
            <div class="form-group">
              <select id="customer-select">
                <option value="">-- Seleccione un cliente --</option>
                ${this.state.customers.map(c => `
                  <option value="${c.id}" ${this.state.selectedCustomer?.id == c.id ? 'selected' : ''}>
                    ${c.name} (NIT/CC: ${c.identification})
                  </option>
                `).join('')}
              </select>
            </div>
            ${this.state.selectedCustomer ? `
              <div class="selected-info">
                <p><strong>Cliente:</strong> ${this.state.selectedCustomer.name}</p>
                <p><strong>Email:</strong> ${this.state.selectedCustomer.email} | <strong>Tel:</strong> ${this.state.selectedCustomer.phone || 'N/A'}</p>
              </div>
            ` : ''}
          </div>

          <!-- 2. Adición de Productos / Servicios -->
          <div class="section-card">
            <h3>2. Agregar Productos o Servicios</h3>
            <div class="add-item-row">
              <select id="product-select">
                <option value="">-- Seleccionar producto --</option>
                ${this.state.products.map(p => `
                  <option value="${p.id}">${p.name} - $${p.price.toLocaleString()}</option>
                `).join('')}
              </select>
              <input type="number" id="item-qty" value="1" min="1" style="width: 80px;" />
              <button type="button" id="btn-add-item" class="btn-secondary">Agregar Ítem</button>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th>Ítem</th>
                  <th>Precio Unit.</th>
                  <th>Cantidad</th>
                  <th>Impuesto</th>
                  <th>Subtotal</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${this.state.items.length === 0 ? '<tr><td colspan="6" style="text-align:center;">No hay ítems agregados.</td></tr>' : 
                  this.state.items.map((item, index) => {
                    const sub = item.unitPrice * item.quantity;
                    return `
                      <tr>
                        <td>${item.product.name}</td>
                        <td>$${item.unitPrice.toLocaleString()}</td>
                        <td>
                          <input type="number" class="qty-input" data-index="${index}" value="${item.quantity}" min="1" style="width: 60px;" />
                        </td>
                        <td>${item.taxRate}%</td>
                        <td>$${sub.toLocaleString()}</td>
                        <td><button type="button" class="btn-remove" data-index="${index}">Eliminar</button></td>
                      </tr>
                    `;
                  }).join('')
                }
              </tbody>
            </table>
          </div>

          <!-- 3. Totales y Emisión -->
          <div class="section-card totals-card">
            <h3>3. Resumen y Emisión</h3>
            <div class="totals-summary">
              <p>Subtotal: <span>$${totals.subtotal.toLocaleString()}</span></p>
              <p>Impuestos / IVA: <span>$${totals.totalTax.toLocaleString()}</span></p>               <h3>Total a Pagar: <span>$${totals.total.toLocaleString()}</span></h3>
            </div>
            
            <button type="button" id="btn-emit" class="btn-primary" ${this.state.emitting ? 'disabled' : ''}>
              ${this.state.emitting ? 'Emitiendo ante Factus...' : 'Emitir Factura Electrónica'}
            </button>
          </div>
        `}
      </div>
    `;

    // Event Listeners
    const customerSelect = this.container.querySelector('#customer-select');
    if (customerSelect) {
      customerSelect.addEventListener('change', (e) => this.handleSelectCustomer(e.target.value));
    }

    const btnAddItem = this.container.querySelector('#btn-add-item');
    if (btnAddItem) {
      btnAddItem.addEventListener('click', () => {
        const prodSelect = this.container.querySelector('#product-select');
        const qtyInput = this.container.querySelector('#item-qty');
        if (prodSelect && prodSelect.value) {
          this.handleAddItem(prodSelect.value, qtyInput ? qtyInput.value : 1);
          prodSelect.value = '';
          if (qtyInput) qtyInput.value = '1';
        }
      });
    }

    this.container.querySelectorAll('.qty-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const index = e.target.getAttribute('data-index');
        this.handleUpdateQuantity(index, e.target.value);
      });
    });

    this.container.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = e.target.getAttribute('data-index');
        this.handleRemoveItem(index);
      });
    });

    const btnEmit = this.container.querySelector('#btn-emit');
    if (btnEmit) {
      btnEmit.addEventListener('click', () => this.handleEmitInvoice());
    }
  }
}
