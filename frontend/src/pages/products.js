import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api.js';
import { escapeHtml, formatCOP } from '../utils/format.js';

export async function renderProductsPage(container) {
  container.innerHTML = `
    <div class="header-actions" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2>Gestión de Productos</h2>
      <button id="btn-toggle-product-form" class="btn btn-primary">+ Nuevo Producto</button>
    </div>

    <!-- CONTENEDOR DE ALERTAS -->
    <div id="product-alert" style="display: none; margin-bottom: 15px;" class="alert-box"></div>

    <!-- FORMULARIO OCULTO PARA CREAR / EDITAR -->
    <div id="product-form-container" class="card-section" style="display: none; margin-bottom: 20px;">
      <h3 id="form-product-title">Crear Nuevo Producto</h3>
      <form id="form-product">
        <input type="hidden" id="product-id" />
        <div class="form-group" style="margin-bottom: 10px;">
          <label>Nombre del Producto:</label>
          <input type="text" id="prod-name" class="form-control" required style="width: 100%; padding: 8px;" />
        </div>
        <div class="form-group" style="margin-bottom: 10px;">
          <label>Código / SKU:</label>
          <input type="text" id="prod-code" class="form-control" required style="width: 100%; padding: 8px;" />
        </div>
        <div class="form-group" style="margin-bottom: 10px;">
          <label>Precio Unitario ($):</label>
          <input type="number" id="prod-price" class="form-control" min="0" step="any" required style="width: 100%; padding: 8px;" />
        </div>
        <div class="form-group" style="margin-bottom: 15px;">
          <label>Tasa de Impuesto (%):</label>
          <input type="number" id="prod-tax" class="form-control" min="0" value="19" required style="width: 100%; padding: 8px;" />
        </div>
        <div style="display: flex; gap: 10px;">
          <button type="submit" class="btn btn-success" id="btn-save-product">Guardar Producto</button>
          <button type="button" class="btn btn-secondary" id="btn-cancel-product">Cancelar</button>
        </div>
      </form>
    </div>

    <!-- LISTADO DE PRODUCTOS -->
    <section class="card-section">
      <div id="products-loading">Cargando productos...</div>
      <table id="table-products" class="data-table" style="display: none; width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 2px solid #ccc; text-align: left;">
            <th style="padding: 8px;">Código</th>
            <th style="padding: 8px;">Nombre</th>
            <th style="padding: 8px;">Precio Unitario</th>
            <th style="padding: 8px;">Impuesto (%)</th>
            <th style="padding: 8px;">Acciones</th>
          </tr>
        </thead>
        <tbody id="products-rows"></tbody>
      </table>
    </section>
  `;

  await initProductsModule(container);
}

async function initProductsModule(container) {
  const loading = container.querySelector('#products-loading');
  const table = container.querySelector('#table-products');
  const tbody = container.querySelector('#products-rows');
  const formContainer = container.querySelector('#product-form-container');
  const btnToggleForm = container.querySelector('#btn-toggle-product-form');
  const btnCancel = container.querySelector('#btn-cancel-product');
  const form = container.querySelector('#form-product');
  const alertBox = container.querySelector('#product-alert');
  const formTitle = container.querySelector('#form-product-title');
  const inputId = container.querySelector('#product-id');

  function showAlert(msg, isError = true) {
    alertBox.style.display = 'block';
    alertBox.style.padding = '10px';
    alertBox.style.backgroundColor = isError ? '#f8d7da' : '#d4edda';
    alertBox.style.color = isError ? '#721c24' : '#155724';
    alertBox.textContent = msg;
  }

  function hideAlert() {
    alertBox.style.display = 'none';
  }

  btnToggleForm.addEventListener('click', () => {
    form.reset();
    inputId.value = '';
    formTitle.textContent = 'Crear Nuevo Producto';
    formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
    hideAlert();
  });

  btnCancel.addEventListener('click', () => {
    formContainer.style.display = 'none';
  });

  async function loadProducts() {
    loading.style.display = 'block';
    table.style.display = 'none';
    try {
      const res = await getProducts();
      const list = Array.isArray(res) ? res : (res?.data && Array.isArray(res.data) ? res.data : (res?.data?.data || []));

      tbody.innerHTML = '';
      if (!list || list.length === 0) {
        loading.textContent = 'No hay productos registrados.';
        return;
      }

      list.forEach(p => {
        const pId = escapeHtml(p._id || p.id);
        const name = escapeHtml(p.name || p.title || 'Sin nombre');
        const code = escapeHtml(p.code || 'S/C');
        const price = formatCOP(p.price || 0);
        const taxRate = p.taxRate ?? p.tax ?? 19;

        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #eee';
        tr.innerHTML = `
          <td style="padding: 8px;">${code}</td>
          <td style="padding: 8px;">${name}</td>
          <td style="padding: 8px;">${price}</td>
          <td style="padding: 8px;">${taxRate}%</td>
          <td style="padding: 8px;">
            <button class="btn btn-small btn-secondary btn-edit" style="padding: 4px 8px; margin-right: 5px;">Editar</button>
            <button class="btn btn-small btn-danger btn-delete" style="padding: 4px 8px;">Eliminar</button>
          </td>
        `;

        tr.querySelector('.btn-edit').addEventListener('click', () => {
          inputId.value = pId;
          container.querySelector('#prod-name').value = p.name || p.title || '';
          container.querySelector('#prod-code').value = p.code || '';
          container.querySelector('#prod-price').value = p.price || 0;
          container.querySelector('#prod-tax').value = taxRate;
          formTitle.textContent = 'Editar Producto';
          formContainer.style.display = 'block';
          formContainer.scrollIntoView({ behavior: 'smooth' });
        });

        tr.querySelector('.btn-delete').addEventListener('click', async () => {
          if (confirm('¿Estás seguro de eliminar este producto?')) {
            try {
              await deleteProduct(pId);
              loadProducts();
            } catch (err) {
              showAlert('Error al eliminar: ' + err.message);
            }
          }
        });

        tbody.appendChild(tr);
      });

      loading.style.display = 'none';
      table.style.display = 'table';
    } catch (err) {
      loading.textContent = 'Error cargando productos: ' + err.message;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const id = inputId.value;
    const payload = {
      name: container.querySelector('#prod-name').value,
      code: container.querySelector('#prod-code').value,
      price: parseFloat(container.querySelector('#prod-price').value),
      taxRate: parseFloat(container.querySelector('#prod-tax').value)
    };

    try {
      if (id) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      formContainer.style.display = 'none';
      loadProducts();
    } catch (err) {
      showAlert('Error al guardar producto: ' + err.message);
    }
  });

  await loadProducts();
}