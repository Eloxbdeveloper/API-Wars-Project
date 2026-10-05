import { customerService } from '../services/customerService.js';

export class CustomerManager {
  constructor(containerElement, onSelectCustomer = null) {
    this.container = containerElement;
    this.onSelectCustomer = onSelectCustomer;
    this.state = {
      loading: false,
      error: null,
      successMessage: null,
      customers: []
    };
  }

  async init() {
    await this.loadCustomers();
  }

  async loadCustomers() {
    this.state.loading = true;
    this.state.error = null;
    this.render();

    try {
      this.state.customers = await customerService.getCustomers();
    } catch (err) {
      this.state.error = err.message;
    } finally {
      this.state.loading = false;
      this.render();
    }
  }

  async handleCreateCustomer(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const customerData = {
      identification: formData.get('identification')?.trim(),
      name: formData.get('name')?.trim(),
      email: formData.get('email')?.trim(),
      phone: formData.get('phone')?.trim()
    };

    // Validaciones frontend básicas
    if (!customerData.identification || !customerData.name || !customerData.email) {
      this.state.error = 'Por favor completa los campos obligatorios (Identificación, Nombre y Correo).';
      this.render();
      return;
    }

    this.state.loading = true;
    this.state.error = null;
    this.state.successMessage = null;
    this.render();

    try {
      const newCustomer = await customerService.createCustomer(customerData);
      this.state.successMessage = 'Cliente registrado correctamente.';
      form.reset();
      await this.loadCustomers(); // Recarga la lista
    } catch (err) {
      this.state.error = err.message;
      this.state.loading = false;
      this.render();
    }
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="customer-manager">
        <h2>Gestión de Clientes</h2>

        ${this.state.error ? `<div class="alert error">${this.state.error}</div>` : ''}
        ${this.state.successMessage ? `<div class="alert success">${this.state.successMessage}</div>` : ''}

        <form id="customer-form" class="customer-form">
          <div class="form-group">
            <label for="identification">Identificación / NIT *</label>
            <input type="text" id="identification" name="identification" required />
          </div>
          <div class="form-group">
            <label for="name">Nombre / Razón Social *</label>
            <input type="text" id="name" name="name" required />
          </div>
          <div class="form-group">
            <label for="email">Correo Electrónico *</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div class="form-group">
            <label for="phone">Teléfono</label>
            <input type="tel" id="phone" name="phone" />
          </div>
          <button type="submit" class="btn-primary" ${this.state.loading ? 'disabled' : ''}>
            ${this.state.loading ? 'Guardando...' : 'Registrar Cliente'}
          </button>
        </form>

        <div class="customer-list-container">
          <h3>Clientes Registrados</h3>
          ${this.state.loading && this.state.customers.length === 0 ? '<p>Cargando clientes...</p>' : ''}
          <ul id="customer-list">
            ${
              this.state.customers.length === 0 && !this.state.loading
                ? '<li>No hay clientes registrados.</li>'
                : this.state.customers
                    .map(
                      (c) => `
                <li class="customer-item" data-id="${c.id}">
                  <div>
                    <strong>${c.name}</strong> - <span>NIT:${c.identification}</span>
                    <br/><small>${c.email} \vert{}${c.phone || 'Sin teléfono'}</small>
                  </div>
                  ${
                    this.onSelectCustomer
                      ? `<button class="btn-select" data-id="${c.id}">Seleccionar</button>`
                      : ''
                  }
                </li>
              `
                    )
                    .join('')
            }
          </ul>
        </div>
      </div>
    `;

    // Event listeners
    const form = this.container.querySelector('#customer-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleCreateCustomer(e));
    }

    if (this.onSelectCustomer) {
      this.container.querySelectorAll('.btn-select').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const customerId = e.target.getAttribute('data-id');
          const selected = this.state.customers.find((c) => c.id == customerId);
          if (selected && typeof this.onSelectCustomer === 'function') {
            this.onSelectCustomer(selected);
          }
        });
      });
    }
  }
}
