import { renderHome } from './pages/home.js';
import { renderInvoicesPage } from './pages/invoices.js';
import { renderInvoicesList } from './pages/invoiceList.js';
import { renderInvoiceDetail } from './pages/invoiceDetail.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderCreditNotesPage } from './pages/creditNotes.js';
import { renderCustomersPage } from './pages/customers.js';
import { renderProductsPage } from './pages/products.js';
import { setActiveNav } from './components/nav.js';

export function startRouter(mainContainer) {
  async function handleRoute() {
    // Limpiar pantalla actual antes de renderizar la nueva
    mainContainer.innerHTML = '';

    const path = window.location.hash.slice(1) || '/';

    // Marcar la sección activa en la navegación (sidebar y barra inferior)
    setActiveNav(path);

    try {
      switch (path) {
        case '/':
          renderHome(mainContainer);
          break;

        case '/clientes':
          await renderCustomersPage(mainContainer);
          break;

        case '/productos':
          await renderProductsPage(mainContainer);
          break;

        case '/facturas':
          await renderInvoicesList(mainContainer);
          break;

        case '/facturas/nueva':
          await renderInvoicesPage(mainContainer);
          break;

        case '/dashboard':
          renderDashboard(mainContainer);
          break;

        case '/notas-credito':
          await renderCreditNotesPage(mainContainer);
          break;

        default: {
          // Detalle de factura: #/facturas/<id>
          const detailMatch = path.match(/^\/facturas\/([^/]+)$/);
          if (detailMatch && detailMatch[1] !== 'nueva') {
            await renderInvoiceDetail(mainContainer, decodeURIComponent(detailMatch[1]));
          } else {
            mainContainer.innerHTML = `
              <div class="panel"><div class="state">
                <h3>404 - Página no encontrada</h3>
                <p>La ruta solicitada no existe.</p>
                <a class="btn btn-primary" href="#/">Volver al inicio</a>
              </div></div>`;
          }
        }
      }
    } catch (err) {
      // Un fallo de render no debe romper toda la aplicación
      console.error('[Router] Error al renderizar la ruta:', path, err);
      mainContainer.innerHTML = `
        <div class="panel"><div class="state state-error" role="alert">
          <h3>Ocurrió un error al cargar la sección</h3>
          <p>${String(err?.message || 'Error desconocido.')}</p>
          <a class="btn btn-primary" href="#/">Volver al inicio</a>
        </div></div>`;
    }
  }

  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('load', handleRoute);
}