import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../services/api.js';
import { escapeHtml } from '../utils/format.js';

export async function renderCustomersPage(container) {
  container.innerHTML = `
    <div class="header-actions" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2>Gestión de Clientes</h2>
      <button id="btn-toggle-customer-form" class="btn btn-primary">+ Nuevo Cliente</button>
    </div>

    <!-- CONTENEDOR DE ALERTAS -->
    <div id="customer-alert" style="display: none; margin-bottom: 15px;" class="alert-box"></div>

    <!-- FORMULARIO OCULTO PARA CREAR / EDITAR -->
    <div id="customer-form-container" class="card-section" style="display: none; margin-bottom: 20px;">
      <h3 id="form-customer-title">Crear Nuevo Cliente</h3>
      <form id="form-customer">
        <input type="hidden" id="customer-id" />
        <div class="form-group" style="margin-bottom: 10px;">
          <label>Nombres / Razón Social:</label>
          <input type="text" id="cust-names" class="form-control" required style="width: 100%; padding: 8px;" />
        </div>
        <div class="form-group" style="margin-bottom: 10px;">
          <label>Identificación / NIT:</label>
          <input type="text" id="cust-identification" class="form-control" required style="width: 100%; padding: 8px;" />
        </div>
        <div class="form-group" style="margin-bottom: 10px;">
          <label>Correo Electrónico:</label>
          <input type="email" id="cust-email" class="form-control" required style="width: 100%; padding: 8px;" />
        </div>
        <div class="form-group" style="margin-bottom: 15px;">
          <label>Teléfono:</label>
          <input type="text" id="cust-phone" class="form-control" style="width: 100%; padding: 8px;" />
        </div>
        <div style="display: flex; gap: 10px;">
          <button type="submit" class="btn btn-success" id="btn-save-customer">Guardar Cliente</button>
          <button type="button" class="btn btn-secondary" id="btn-cancel-customer">Cancelar</button>
        </div>
      </form>
    </div>

    <!-- LISTADO DE CLIENTES -->
    <section class="card-section">
      <div id="customers-loading">Cargando clientes...</div>
      <table id="table-customers" class="data-table" style="display: none; width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 2px solid #ccc; text-align: left;">
            <th style="padding: 8px;">Nombre / Razón Social</th>
            <th style="padding: 8px;">Identificación</th>
            <th style="padding: 8px;">Correo</th>
            <th style="padding: 8px;">Teléfono</th>
            <th style="padding: 8px;">Acciones</th>
          </tr>
        </thead>
        <tbody id="customers-rows"></tbody>
      </table>
    </section>
  `;

  await initCustomersModule(container);
}

async function initCustomersModule(container) {
  const loading = container.querySelector('#customers-loading');
  const table = container.querySelector('#table-customers');
  const tbody = container.querySelector('#customers-rows');
  const formContainer = container.querySelector('#customer-form-container');
  const btnToggleForm = container.querySelector('#btn-toggle-customer-form');
  const btnCancel = container.querySelector('#btn-cancel-customer');
  const form = container.querySelector('#form-customer');
  const alertBox = container.querySelector('#customer-alert');
  const formTitle = container.querySelector('#form-customer-title');
  const inputId = container.querySelector('#customer-id');

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
    formTitle.textContent = 'Crear Nuevo Cliente';
    formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
    hideAlert();
  });

  btnCancel.addEventListener('click', () => {
    formContainer.style.display = 'none';
  });

  async function loadCustomers() {
    loading.style.display = 'block';
    table.style.display = 'none';
    try {
      const res = await getCustomers();
      const list = Array.isArray(res) ? res : (res?.data && Array.isArray(res.data) ? res.data : (res?.data?.data || []));

      tbody.innerHTML = '';
      if (!list || list.length === 0) {
        loading.textContent = 'No hay clientes registrados.';
        return;
      }

      list.forEach(c => {
        const cId = escapeHtml(c._id || c.id);
        const name = escapeHtml(c.names || c.name || c.legal_name || 'Sin nombre');
        const ident = escapeHtml(c.identificationNumber || c.identification || 'N/A');
        const email = escapeHtml(c.email || 'N/A');
        const phone = escapeHtml(c.phone || 'N/A');

        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #eee';
        tr.innerHTML = `
          <td style="padding: 8px;">${name}</td>
          <td style="padding: 8px;">${ident}</td>
          <td style="padding: 8px;">${email}</td>
          <td style="padding: 8px;">${phone}</td>
          <td style="padding: 8px;">
            <button class="btn btn-small btn-secondary btn-edit" style="padding: 4px 8px; margin-right: 5px;">Editar</button>
            <button class="btn btn-small btn-danger btn-delete" style="padding: 4px 8px;">Eliminar</button>
          </td>
        `;

        tr.querySelector('.btn-edit').addEventListener('click', () => {
          inputId.value = cId;
          container.querySelector('#cust-names').value = c.names || c.name || c.legal_name || '';
          container.querySelector('#cust-identification').value = c.identificationNumber || c.identification || '';
          container.querySelector('#cust-email').value = c.email || '';
          container.querySelector('#cust-phone').value = c.phone || '';
          formTitle.textContent = 'Editar Cliente';
          formContainer.style.display = 'block';
          formContainer.scrollIntoView({ behavior: 'smooth' });
        });

        tr.querySelector('.btn-delete').addEventListener('click', async () => {
          if (confirm('¿Estás seguro de eliminar este cliente?')) {
            try {
              await deleteCustomer(cId);
              loadCustomers();
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
      loading.textContent = 'Error cargando clientes: ' + err.message;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const id = inputId.value;
    const payload = {
      names: container.querySelector('#cust-names').value,
      identificationNumber: container.querySelector('#cust-identification').value,
      email: container.querySelector('#cust-email').value,
      phone: container.querySelector('#cust-phone').value
    };

    try {
      if (id) {
        await updateCustomer(id, payload);
      } else {
        await createCustomer(payload);
      }
      formContainer.style.display = 'none';
      loadCustomers();
    } catch (err) {
      showAlert('Error al guardar cliente: ' + err.message);
    }
  });

  await loadCustomers();
}