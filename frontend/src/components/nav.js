const icon = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;

const ITEMS = [
  { path: '/', label: 'Inicio', icon: icon('<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>') },
  { path: '/dashboard', label: 'Estadísticas', icon: icon('<path d="M5 20V10M12 20V4M19 20v-7"/>') },
  { path: '/facturas', label: 'Facturas', icon: icon('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>') },
  { path: '/notas-credito', label: 'Notas crédito', short: 'Notas', icon: icon('<path d="M9 14l-5-5 5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/>') },
];

const link = (item, label) =>
  `<a class="nav-link" data-nav="${item.path}" href="#${item.path}">${item.icon}<span>${label}</span></a>`;

export function renderShell(root) {
  root.innerHTML = `
    <a class="skip-link" href="#content">Saltar al contenido</a>
    <div class="shell">
      <aside class="sidebar">
        <a class="brand" href="#/">FactuLocal</a>
        <a class="btn btn-primary" href="#/facturas/nueva">Nueva factura</a>
        <nav aria-label="Principal">${ITEMS.map((i) => link(i, i.label)).join('')}</nav>
        <p class="conn" data-conn role="status">Conectando…</p>
      </aside>
      <div class="main-col">
        <header class="topbar">
          <a class="brand" href="#/">FactuLocal</a>
          <p class="conn" data-conn role="status">Conectando…</p>
        </header>
        <main id="content" tabindex="-1"></main>
      </div>
      <nav class="tabbar" aria-label="Principal">${ITEMS.map((i) => link(i, i.short ?? i.label)).join('')}</nav>
    </div>`;
  return root.querySelector('#content');
}

export function setActiveNav(path) {
  document.querySelectorAll('[data-nav]').forEach((a) => {
    const target = a.dataset.nav;
    const active = target === '/' ? path === '/' : path.startsWith(target);
    if (active) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

export function setConnection(isOnline) {
  document.querySelectorAll('[data-conn]').forEach((el) => {
    el.dataset.state = isOnline ? 'ok' : 'down';
    el.textContent = isOnline ? 'Conectado' : 'Sin conexión con el servidor';
  });
}
