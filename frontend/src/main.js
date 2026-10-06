import './styles/main.css';
import { renderShell, setConnection } from './components/nav.js';
import { startRouter } from './router.js';
import { checkBackendHealth } from './services/api.js';

const content = renderShell(document.querySelector('#app'));
startRouter(content);
checkBackendHealth().then(setConnection);
