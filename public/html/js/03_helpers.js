/* =====================================================================
   03_helpers.js
   Funciones auxiliares para imágenes, logos y mapas.
   ===================================================================== */

// Normaliza la URL de una imagen: barras de Windows, rutas relativas, etc.
function imgUrl(u) {
  u = String(u || '').trim().replace(/\\/g, '/');
  if (!u) return '';
  if (/^(https?:)?\/\//i.test(u) || /^data:/i.test(u) || u.startsWith('/')) return u;
  try { return new URL(u, location.origin + '/').href; } catch (e) { return u; }
}

// Imagen del item txt_dueno_restaurante (es el logo y el favicon de la página)
function ownerLogo() {
  const it = metaItem('txt_dueno_restaurante');
  const im = vis(it?.imagenes)[0] || {};
  return imgUrl(im.url_img || im.img || '');
}

// Valor original de img_logo (respaldo; control.php lo envía como DATA.img_logo)
const logoRaw = () => String(DATA.img_logo || DATA.negocio?.img_logo || '').trim().replace(/\\/g, '/');

// Posibles URLs del logo, en orden de prueba: 1) imagen de txt_dueno_restaurante, 2) img_logo
let LOGO_C = [];
function logoCandidates() {
  const list = [];
  const own = ownerLogo();
  if (own) list.push(own);

  const raw = logoRaw();
  if (raw) {
    if (/^(https?:)?\/\//i.test(raw) || /^data:/i.test(raw)) list.push(raw);
    else {
      const clean = raw.replace(/^\.?\/+/, '');
      const root  = String(BASE || '').replace(/\/public\/html\/?$/, '');
      list.push(imgUrl(raw), BASE + '/' + clean, root + '/' + clean);
    }
  }
  return [...new Set(list.filter(Boolean))];
}

// Si una URL falla prueba la siguiente; si fallan todas muestra la inicial del negocio
function logoFail(img) {
  const i = (Number(img.dataset.i) || 0) + 1;
  if (LOGO_C[i]) { img.dataset.i = i; img.src = LOGO_C[i]; return; }
  console.warn('No se pudo cargar el logo. URLs probadas:', LOGO_C);
  const s = document.createElement('span');
  s.textContent = (DATA.negocio?.nombre || '?').charAt(0).toUpperCase();
  s.title = 'Logo no disponible';
  s.style.cssText = 'width:42px;height:42px;border-radius:50%;background:var(--primary);color:#fff;display:grid;place-items:center;font-weight:700;flex:none';
  img.replaceWith(s);
}

function logoHtml() {
  LOGO_C = logoCandidates();
  if (!LOGO_C.length) { console.warn('No hay imagen de logo (txt_dueno_restaurante ni img_logo)'); return ''; }
  return `<img src="${LOGO_C[0]}" data-i="0" alt="${DATA.negocio?.nombre || ''}" onerror="logoFail(this)">`;
}

// Favicon: usa la primera URL de logo que cargue correctamente
function setFavicon() {
  const list = logoCandidates();
  const apply = url => {
    let link = document.querySelector('link[rel~="icon"]');
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
    link.removeAttribute('type');
    link.href = url;
  };
  const tryNext = i => {
    if (i >= list.length) return;
    const t = new Image();
    t.onload = () => apply(list[i]);
    t.onerror = () => tryNext(i + 1);
    t.src = list[i];
  };
  tryNext(0);
}

/* ---------- Ayudantes: mapa (imagen de txt_mapa) ---------- */
// Busca el elemento txt_mapa en cualquier parte del árbol web
function mapNode() {
  const f = n => {
    if (Array.isArray(n)) { for (const x of n) { const r = f(x); if (r) return r; } return null; }
    if (n && typeof n === 'object') {
      if (n.clave_txt === 'txt_mapa') return n;
      for (const k in n) { const r = f(n[k]); if (r) return r; }
    }
    return null;
  };
  return f(DATA.web);
}

// Rectángulo con la imagen de txt_mapa; al hacer click abre el enlace de Google Maps
function mapCardHtml(addr) {
  const it = mapNode();
  if (!it) return '';
  const link = [it.contenido, it.titulo, it.descripcion].map(v => String(v || '').trim()).find(v => /^https?:\/\//i.test(v)) || '';
  const im = vis(it.imagenes)[0] || {};
  const img = imgUrl(im.url_img || im.img || '');
  if (!link && !img) return '';
  const href = link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr || '')}`;
  const inner = img
    ? `<img src="${img}" alt="Ubicación en el mapa" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" onerror="console.warn('No se pudo cargar la imagen del mapa:', this.src); this.remove()">`
    : `<i class="bi bi-map map-ph"></i>`;
  return `
    <div class="map-card">
      ${inner}
      <a class="map-link" href="${href}" target="_blank" rel="noopener" aria-label="Abrir ubicación en Google Maps">
        <span class="map-cta"><i class="bi bi-geo-alt-fill"></i> Ver en Google Maps</span>
      </a>
    </div>`;
}