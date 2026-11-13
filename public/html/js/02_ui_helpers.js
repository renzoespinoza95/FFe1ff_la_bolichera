/* =====================================================================
   02_ui_helpers.js
   Funciones auxiliares de interfaz, acceso a datos y estados vacíos.
   ===================================================================== */

/* ---------- Utilidades básicas ---------- */
const $ = s => document.querySelector(s);
const sortBy = (arr, k) => [...(arr || [])].sort((a, b) => (a[k] || 0) - (b[k] || 0));
const vis = arr => sortBy((arr || []).filter(x => x.is_visible !== 0), 'orden');
const money = n => 'S/ ' + Number(n).toFixed(2);
const tint = i => 'tint-' + (i % 3);
const pad = n => String(n).padStart(2, '0');

/* ---------- Acceso a los datos ---------- */
const getCat = k => DATA.web.find(c => c.clave_txt === k);
const getSub = (c, k) => (c ? c.subcategorias.find(s => s.clave_txt === k) : null);
const itemsOf = (c, k) => vis(getSub(c, k)?.items);
const img0 = it => vis(it.imagenes)[0]?.url_img || '';
const metaItem = k => itemsOf(getCat('txt_meta_cat'), 'txt_meta').find(i => i.clave_txt === k);
const waLink = (extra = '') => `https://wa.me/51${PHONE}?text=${encodeURIComponent(WA_MSG + (extra ? ' – ' + extra : ''))}`;
const posCats = () => sortBy(DATA.pos.filter(c => c.is_activo !== 0), 'priority');
const allProducts = () => posCats().flatMap(c => c.productos.filter(p => p.is_visible !== 0).map(p => ({ ...p, _cat: c.category_id })));
const prodImg = p => sortBy((p.imagenes || []).filter(i => i.is_visible !== 0), 'orden')[0]?.img || '';

/* ---------- Bloques de interfaz reutilizables ---------- */
const head = (kicker, title, text) => `
  <div class="section-head">
    ${kicker ? `<span class="deco">${kicker}</span>` : ''}
    <h2 class="title">${title}</h2>
    ${text ? `<p class="lead-text">${text}</p>` : ''}
  </div>`;

/* Estado vacío: se usa cuando no hay productos, ofertas, etc. */
const emptyState = (msg, icon = 'bi-inbox') => `
  <div class="col-12 text-center py-5 opacity-75">
    <i class="bi ${icon} fs-1 d-block mb-2"></i>
    <p class="mb-0">${msg}</p>
  </div>`;

function socialLinks() {
  const tk = metaItem('txt_tiktok')?.contenido, fb = metaItem('txt_facebook')?.contenido;
  return [
    fb ? `<a href="${fb}" target="_blank" rel="noopener" aria-label="Facebook"><i class="bi bi-facebook"></i></a>` : '',
    tk ? `<a href="${tk}" target="_blank" rel="noopener" aria-label="TikTok"><i class="bi bi-tiktok"></i></a>` : '',
    `<a href="${waLink()}" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="bi bi-whatsapp"></i></a>`
  ].join('');
}

/* Mensaje de error visible en la parte superior de la página */
function showFatalError(html) {
  document.body.insertAdjacentHTML('afterbegin', `<div class="alert alert-danger m-3">${html}</div>`);
}

/* Ejecuta un render sin que un fallo en una sección rompa el resto de la página */
function safeRender(fn) {
  try { fn(); } catch (err) { console.error('Error en ' + (fn.name || 'render') + ':', err); }
}

/* ---------- Datos enviados por el servidor ---------- */
function readPageData() {
  const el = document.getElementById('page-data');
  if (!el) throw new Error('No existe #page-data');
  return JSON.parse(el.textContent);
}

/* ---------- Tema ---------- */
const themeUrl = file => BASE + '/themes/' + file;

const currentThemeFile = () =>
  ($('#theme-css').getAttribute('href') || '').split('?')[0].split('/').pop();

function applyTheme(file) {
  $('#theme-css').href = themeUrl(file);
  try { localStorage.setItem(THEME_KEY, file); } catch (e) {}
}

function loadSavedTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved && THEMES.some(t => t.file === saved)) $('#theme-css').href = themeUrl(saved);
  } catch (e) {}
}