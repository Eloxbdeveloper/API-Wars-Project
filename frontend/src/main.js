import './styles/main.css';
import { renderShell, setConnection } from './components/nav.js';
import { startRouter } from './router.js';
import { checkBackendHealth } from './services/api.js';

const content = renderShell(document.querySelector('#app'));
startRouter(content);

// Estado de conexión con el backend: se actualiza al iniciar y periódicamente,
// para que la interfaz refleje si el servidor está caído o se recuperó.
function updateConnection() {
  return checkBackendHealth()
    .then(() => setConnection(true))
    .catch(() => setConnection(false));
}

updateConnection();
setInterval(updateConnection, 15000);

