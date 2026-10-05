import { productService } from '../services/productService.js';

export class ProductManager {
  constructor(containerElement, onSelectProduct = null) {
    this.container = containerElement;
    this.onSelectProduct = onSelectProduct;
    this.state = {
      loading: false,
      error: null,
      successMessage: null,
      products: []
    };
  }

  async init() {
    await this.loadProducts();
  }

  async loadProducts() {
    this.state.loading = true;
    this.state.error = null;
    this.render();

    try {
      this.state.products = await productService.getProducts();
    } catch (err) {
      this.state.error = err.message;
    } finally {
      this.state.loading = false;
      this.render();
    }
  }

  async handleCreateProduct(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const productData = {
      name: formData.get('name')?.trim(),
      description: formData.get('description')?.trim(),
      price: parseFloat(formData.get('price')),
      taxRate: parseFloat(formData.get('taxRate') || 0)
    };

    // Validaciones frontend básicas
    if (!productData.name || isNaN(productData.price) || productData.price <= 0) {
      this.state.error = 'Por favor ingresa un nombre válido y un precio mayor a cero.';
      this.render();
      return;
    }

    this.state.loading = true;
    this.state.error = null;
    this.state.successMessage = null;
    this.render();

    try {
      await productService.createProduct(productData);
      this.state.successMessage = 'Producto o servicio registrado correctamente.';
      form.reset();
      await this.loadProducts(); // Recarga la lista
    } catch (err) {
      this.state.error = err.message;
      this.state.loading = false;
      this.render();
    }
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="product-manager">
        <h2>Gestión de Productos y Servicios</h2>

        ${this.state.error ? `<div class="alert error">${this.state.error}</div>` : ''}
        ${this.state.successMessage ? `<div class="alert success">${this.state.successMessage}</div>` : ''}

        <form id="product-form" class="product-form">
          <div class="form-group">
            <label for="name">Nombre del Producto / Servicio *</label>
            <input type="text" id="name" name="name" required />
          </div>
          <div class="form-group">
            <label for="description">Descripción</label>
            <textarea id="description" name="description"></textarea>
          </div>
          <div class="form-group">
            <label for="price">Precio Unitario ($) *</label>
            <input type="number" id="price" name="price" step="0.01" min="0" required />
          </div>
          <div class="form-group">
            <label for="taxRate">Impuesto (%) - Opcional</label>
            <input type="number" id="taxRate" name="taxRate" step="0.1" min="0" value="0" />
          </div>
          <button type="submit" class="btn-primary" ${this.state.loading ? 'disabled' : ''}>
            ${this.state.loading ? 'Guardando...' : 'Registrar Producto'}
          </button>
        </form>

        <div class="product-list-container">
          <h3>Catálogo Actual</h3>
          ${this.state.loading && this.state.products.length === 0 ? '<p>Cargando productos...</p>' : ''}
          <ul id="product-list">
            ${
              this.state.products.length === 0 && !this.state.loading
                ? '<li>No hay productos o servicios registrados.</li>'
                : this.state.products
                    .map(
                      (p) => `
                <li class="product-item" data-id="${p.id}">
                  <div>
                    <strong>${p.name}</strong> - <span>$${p.price.toLocaleString()}</span>
                    <br/><small>${p.description \vert{}\vert{} 'Sin descripción'} \vert{} Impuesto: ${p.taxRate || 0}%</small>
                  </div>
                  ${
                    this.onSelectProduct
                      ? `<button class="btn-select" data-id="${p.id}">Seleccionar</button>`
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
    const form = this.container.querySelector('#product-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleCreateProduct(e));
    }

    if (this.onSelectProduct) {
      this.container.querySelectorAll('.btn-select').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const productId = e.target.getAttribute('data-id');
          const selected = this.state.products.find((p) => p.id == productId);
          if (selected && typeof this.onSelectProduct === 'function') {
            this.onSelectProduct(selected);
          }
        });
      });
    }
  }
}
