import { renderHome } from './pages/home.js';
import { renderInvoicesPage } from './pages/invoices.js';
import { renderCustomersPage } from './pages/customers.js';
import { renderProductsPage } from './pages/products.js';

export function startRouter(mainContainer) {
  async function handleRoute() {
    // Limpiar pantalla actual antes de renderizar la nueva
    mainContainer.innerHTML = '';

    const path = window.location.hash.slice(1) || '/';

    // Actualizar clase activa en el menú de navegación si existe
    document.querySelectorAll('nav a, .sidebar a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${path}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

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
      case '/facturas/nueva':
      case '/dashboard':
        await renderInvoicesPage(mainContainer);
        break;

      default:
        mainContainer.innerHTML = '<div class="card-section"><h2>404 - Página no encontrada</h2><p>La ruta solicitada no existe.</p></div>';
    }
  }

  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('load', handleRoute);
}