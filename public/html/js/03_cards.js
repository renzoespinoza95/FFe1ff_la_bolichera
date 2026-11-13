/* =====================================================================
   03_cards.js
   Construcción visual de tarjetas y secciones, atributos de los
   elementos interactivos (filtros activos, contador, carruseles).
   ===================================================================== */

/* ---------- Ayudantes: imágenes y logo ---------- */
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

/* ---------- Meta, cabecera y hero ---------- */
function renderMeta() {
  document.title = metaItem('txt_titulo')?.contenido || DATA.negocio.nombre;
  $('#metaDesc').content = metaItem('txt_meta_description')?.contenido || '';
  $('#metaKeys').content = metaItem('txt_meta_keywords')?.contenido || '';
  $('#waFloat').href = waLink();
  setFavicon();
}

function renderHeader() {
  const n = DATA.negocio;
  const tel = itemsOf(getCat('txt_contacto'), 'txt_datos_contacto').find(i => i.clave_txt === 'txt_telefono')?.titulo || '';
  const links = DATA.web
    .filter(c => c.is_visible !== 0 && c.clave_txt !== 'txt_meta_cat' && c.titulo !== 'inicio')
    .sort((a, b) => a.orden - b.orden)
    .map(c => `<a href="#${c.titulo}">${c.titulo}</a>`).join('');
  $('#header').innerHTML = `
    <div class="container">
      <div class="header-row">
        <div class="header-side"><i class="bi bi-telephone"></i> ${tel}</div>
        <a class="brand" href="#inicio">${logoHtml()}<span class="brand-name">${n.nombre}</span></a>
        <div class="header-side end">
          <a href="${waLink()}" target="_blank" rel="noopener"><i class="bi bi-whatsapp"></i> Reservar</a>
          <button type="button" class="cart-btn" data-bs-toggle="offcanvas" data-bs-target="#cartPanel" aria-controls="cartPanel" aria-label="Ver carrito">
            <i class="bi bi-cart3"></i><span class="cart-badge" hidden>0</span>
          </button>
        </div>
      </div>
      <nav class="main-nav"><a href="#inicio">Inicio</a><a href="#ofertas">Ofertas</a><a href="#carta">Carta</a>${links}</nav>
    </div>`;
}

/* El carrusel se activa en 04_main.js (initCarousels): infinito + táctil */
function renderHero() {
  const slides = vis(DATA.sliders);
  if (!slides.length) { $('#inicio').innerHTML = ''; return; }
  const big = u => u.replace(/\/\d+\/\d+$/, '/1920/900');
  $('#inicio').innerHTML = `
    <div id="heroCarousel" class="carousel slide hero">
      <div class="carousel-indicators">
        ${slides.map((_, i) => `<button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="${i}" class="${i ? '' : 'active'}" aria-label="Slide ${i + 1}"></button>`).join('')}
      </div>
      <div class="carousel-inner">
        ${slides.map((s, i) => `
          <div class="carousel-item ${i ? '' : 'active'}">
            <img src="${big(s.img)}" class="hero-img" alt="${s.titulo_superior}">
            <div class="hero-caption container">
              <div class="inner">
                <h1 class="hero-title">${s.titulo_superior}</h1>
                <p>${s.descripcion}</p>
                <a href="#carta" class="btn-brand">Ver la carta</a>
                <a href="#empresa" class="btn-ghost">Conócenos</a>
              </div>
            </div>
          </div>`).join('')}
      </div>
      <button class="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
        <span class="carousel-control-prev-icon"></span><span class="visually-hidden">Anterior</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
        <span class="carousel-control-next-icon"></span><span class="visually-hidden">Siguiente</span>
      </button>
    </div>`;
}

/* ---------- Categorías (carrusel de una fila; se activa en 05_extras.js) ---------- */
function renderCategories() {
  const cats = posCats();
  if (!cats.length) { $('#categorias').innerHTML = ''; return; }
  $('#categorias').innerHTML = `<div class="container">
    <div class="cat-carousel">
      <button type="button" class="round-btn soft cat-arrow cat-prev" aria-label="Anterior"><i class="bi bi-chevron-left"></i></button>
      <div class="cat-track" id="catTrack">
        ${cats.map((c, i) => `
          <div class="cat-item">
            <button class="cat-bubble c-${i % 4}" data-filter="${c.category_id}" data-goto="1" aria-label="${c.name}">
              <img src="${c.img}" alt="${c.name}" loading="lazy" draggable="false">
              <div class="cat-over"><b>${c.icon} ${c.name}</b><span>Ver ahora</span></div>
            </button>
          </div>`).join('')}
      </div>
      <button type="button" class="round-btn cat-arrow cat-next" aria-label="Siguiente"><i class="bi bi-chevron-right"></i></button>
    </div>
  </div>`;
}

/* ---------- Ofertas (tarjetas + contador) ---------- */
function dealHtml(p, i) {
  const v = p.variantes_json || {};
  const pct = Math.round((1 - p.price / v.precio_anterior) * 100);
  const spec = Object.values(v.especificaciones || {})[0] || '';
  return `
    <div class="col-lg-6"><div class="deal">
      <div class="cd ${i % 2 ? 'cd-b' : 'cd-a'}">
        <div><b data-cd="d">00</b><small>DÍAS</small></div>
        <div><b data-cd="h">00</b><small>HRS</small></div>
        <div><b data-cd="m">00</b><small>MIN</small></div>
        <div><b data-cd="s">00</b><small>SEG</small></div>
      </div>
      <img class="deal-img" src="${prodImg(p)}" alt="${p.name}" loading="lazy">
      <div class="deal-info">
        <span class="deal-tag">-${pct}%</span>
        <h3>${p.name}</h3>
        <small class="brand-t">${p.marca_des}</small>
        ${spec ? `<span class="deal-chip">${spec}</span>` : ''}
        <button type="button" class="btn-brand" data-add="${p.product_id}"><s>${money(v.precio_anterior)}</s>${money(p.price)} · Pedir</button>
      </div>
    </div></div>`;
}

function renderDeals() {
  const deals = allProducts().filter(p => p.variantes_json?.precio_anterior > 0);
  DEAL_END = (DATA.sliders || []).map(s => s.fecha_fin).filter(Boolean).sort()[0] || null;
  const intro = head('Precios que se van volando', 'Ofertas del día', 'Aprovecha estos platos y bebidas con descuento antes de que termine la promoción.');

  if (!deals.length) {
    $('#ofertas').innerHTML = `<div class="container">${intro}<div class="row">${emptyState('Por ahora no hay ofertas activas. ¡Vuelve pronto!', 'bi-tag')}</div></div>`;
    return;
  }

  const groups = [];
  for (let i = 0; i < deals.length; i += 2) groups.push(deals.slice(i, i + 2));
  $('#ofertas').innerHTML = `<div class="container">
    ${intro}
    <div class="deals">
      <button class="round-btn soft deal-prev" data-bs-target="#dealsCarousel" data-bs-slide="prev" aria-label="Anterior"><i class="bi bi-chevron-left"></i></button>
      <div id="dealsCarousel" class="carousel slide">
        <div class="carousel-inner">
          ${groups.map((g, gi) => `<div class="carousel-item ${gi ? '' : 'active'}"><div class="row g-4">${g.map((p, i) => dealHtml(p, gi * 2 + i)).join('')}</div></div>`).join('')}
        </div>
      </div>
      <button class="round-btn deal-next" data-bs-target="#dealsCarousel" data-bs-slide="next" aria-label="Siguiente"><i class="bi bi-chevron-right"></i></button>
    </div>
  </div>`;
}

/* Actualiza los números del contador (días, horas, minutos, segundos) */
function tickCountdown() {
  if (!DEAL_END) return;
  const diff = Math.max(0, new Date(DEAL_END.replace(' ', 'T')) - Date.now()) / 1000;
  const v = { d: Math.floor(diff / 86400), h: Math.floor(diff % 86400 / 3600), m: Math.floor(diff % 3600 / 60), s: Math.floor(diff % 60) };
  document.querySelectorAll('[data-cd]').forEach(el => { el.textContent = pad(v[el.dataset.cd]); });
}

function startCountdown() {
  stopCountdown();
  if (!DEAL_END || !document.querySelector('[data-cd]')) return;
  tickCountdown();
  countdownTimer = setInterval(tickCountdown, COUNTDOWN_TICK_MS);
}

function stopCountdown() {
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
}

/* ---------- Destacado ---------- */
function renderSpotlight() {
  const best = allProducts().filter(p => p.variantes_json?.destacado)
    .sort((a, b) => (b.variantes_json.reviews || 0) - (a.variantes_json.reviews || 0))[0];
  if (!best) { $('#destacado').innerHTML = ''; return; }
  const v = best.variantes_json;
  $('#destacado').innerHTML = `
    <div class="wv wv-top"></div>
    <div class="container"><div class="row align-items-center g-5">
      <div class="col-lg-6">
        <span class="spot-kicker">El favorito de la casa</span>
        <h2 class="spot-title">${best.name}</h2>
        <p class="spot-text">${best.description}. Una creación de ${best.marca_des} que nuestros comensales piden una y otra vez.</p>
        <div class="row g-4 mb-4">
          <div class="col-4 stat"><b>${v.rating}</b><strong>Calificación</strong><small>Promedio de clientes</small></div>
          <div class="col-4 stat"><b>${v.reviews}</b><strong>Reseñas</strong><small>Opiniones reales</small></div>
          <div class="col-4 stat"><b>${v.stock}</b><strong>Disponibles</strong><small>Preparados hoy</small></div>
        </div>
        <button type="button" class="btn-white" data-add="${best.product_id}">Pedir por ${money(best.price)}</button>
      </div>
      <div class="col-lg-6 text-center"><img class="spot-img" src="${prodImg(best)}" alt="${best.name}"></div>
    </div></div>
    <div class="wv wv-bottom"></div>`;
}

/* ---------- Carta (tarjetas de producto + filtros) ---------- */
function productCard(p) {
  const v = p.variantes_json || {};
  const specs = Object.entries(v.especificaciones || {}).slice(0, 2)
    .map(([k, x]) => `<span class="spec">${k}: ${x}</span>`).join('');
  const old = v.precio_anterior > 0 ? `<s>${money(v.precio_anterior)}</s>` : '';
  return `
    <div class="col-sm-6 col-lg-3">
      <article class="float-card">
        ${v.etiqueta ? `<span class="fc-tag">${v.etiqueta}</span>` : ''}
        <span class="fc-price">${old}${money(p.price)}</span>
        <div class="fc-img"><img src="${prodImg(p)}" alt="${p.name}" loading="lazy"></div>
        <div class="fc-body">
          <h3>${p.name}</h3>
          <p>${p.description}</p>
          <div>${specs}</div>
          <div class="rating">★ ${v.rating ?? '-'} <span class="fw-normal">(${v.reviews ?? 0} reseñas)</span></div>
          <button type="button" class="btn-brand" data-add="${p.product_id}">Pedir ahora</button>
        </div>
      </article>
    </div>`;
}

function renderCarta() {
  const cats = posCats();
  // Sin botón "Todo": la carta abre con la primera categoría
  const first = cats[0] ? String(cats[0].category_id) : 'all';
  $('#carta').innerHTML = `
    <div class="container">
      ${head('Hecho al momento', 'Nuestra carta', getCat('txt_inicio')?.texto02)}
      <div class="d-flex flex-wrap justify-content-center gap-2 mb-5">
        ${cats.map(c => `<button class="chip" data-filter="${c.category_id}">${c.icon} ${c.name}</button>`).join('')}
      </div>
      <div id="prodGrid" class="row g-4 justify-content-center"></div>
    </div>`;
  renderProducts(first);
}

function renderProducts(filter) {
  const all = allProducts();
  const list = filter === 'all' ? all : all.filter(p => p._cat === Number(filter));
  $('#prodGrid').innerHTML = list.length
    ? list.map(productCard).join('')
    : emptyState('No hay productos disponibles en esta categoría.', 'bi-cup-hot');
  document.querySelectorAll('.chip').forEach(ch => ch.classList.toggle('active', ch.dataset.filter === String(filter)));
}

/* ---------- Secciones de contenido ---------- */
function renderPropuesta() {
  const sub = getSub(getCat('txt_inicio'), 'txt_propuesta');
  $('#propuesta').innerHTML = head(sub.titulo, 'Lo que nos hace únicos', sub.descripcion) + `
    <div class="row g-4">
      ${itemsOf(getCat('txt_inicio'), 'txt_propuesta').map(it => `
        <div class="col-md-4"><div class="card-soft">
          <img class="cover" src="${img0(it)}" alt="${it.titulo}" loading="lazy">
          <div class="card-pad"><span class="deco">${it.subtitulo_detalle}</span><h3>${it.titulo}</h3><p>${it.contenido}</p></div>
        </div></div>`).join('')}
    </div>`;
}

function renderEmpresa() {
  const c = getCat('txt_empresa');
  const hist = itemsOf(c, 'txt_historia');
  const main = hist.find(i => i.clave_txt === 'txt_historia_titulo');
  const hitos = hist.find(i => i.clave_txt === 'txt_historia_hitos');
  const imgs = vis(main.imagenes);
  const video = vis(main.videos)[0];
  const hitosHtml = (hitos?.contenido || '').split('·').map(s => s.trim()).filter(Boolean).map(h => {
    const m = h.match(/^(\d{4})\s+(.*)$/);
    return `<div class="col-6 col-lg-3"><div class="hito"><b>${m ? m[1] : ''}</b><small>${m ? m[2] : h}</small></div></div>`;
  }).join('');
  const mv = itemsOf(c, 'txt_mision_vision');
  const valores = itemsOf(c, 'txt_valores');
  const icons = ['bi-droplet-half', 'bi-book-half', 'bi-heart-fill', 'bi-shield-check'];

  $('#empresa').innerHTML = `<div class="container">
    ${head(c.texto02, c.texto01)}
    <div class="row g-5 align-items-center mb-5">
      <div class="col-lg-6"><div class="hist-imgs">
        <img class="a" src="${imgs[0]?.url_img || ''}" alt="Historia">
        <img class="b" src="${imgs[1]?.url_img || ''}" alt="Historia 2">
      </div></div>
      <div class="col-lg-6">
        <span class="deco">${main.subtitulo_detalle}</span>
        <h2 class="title h3">${main.titulo}</h2>
        <p>${main.contenido}</p>
      </div>
    </div>
    <div class="row g-3 mb-5">${hitosHtml}</div>
    ${video ? `<div class="ratio ratio-16x9 rounded-4 overflow-hidden mb-5 shadow">
        <iframe src="${video.codigo_web}" title="${video.titulo}" allow="fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>` : ''}
    <div class="row g-4 mb-5">
      ${mv.map(it => `<div class="col-md-6"><div class="card-soft">
          <img class="cover" src="${img0(it)}" alt="${it.titulo}" loading="lazy">
          <div class="card-pad"><span class="deco">${it.subtitulo_detalle}</span><h3>${it.titulo}</h3><p>${it.contenido}</p></div>
        </div></div>`).join('')}
    </div>
    <div class="row g-4">
      ${valores.map((it, i) => `<div class="col-6 col-lg-3"><div class="card-soft"><div class="card-pad">
          <div class="valor-ico tint-0"><i class="bi ${icons[i % 4]}"></i></div>
          <h3>${it.titulo}</h3><p>${it.contenido}</p>
        </div></div></div>`).join('')}
    </div>
  </div>`;
}

function renderServicios() {
  const c = getCat('txt_servicios');
  const lista = itemsOf(c, 'txt_servicios_lista');
  const pasos = itemsOf(c, 'txt_proceso');
  $('#servicios').innerHTML = head(getSub(c, 'txt_servicios_lista').descripcion, c.texto01, c.texto02) + `
    <div class="row g-4 mb-5">
      ${lista.map(it => `<div class="col-sm-6 col-lg-3"><div class="card-soft">
          <img class="cover" src="${img0(it)}" alt="${it.titulo}" loading="lazy">
          <div class="card-pad"><span class="deco">${it.subtitulo_detalle}</span><h3>${it.titulo}</h3><p>${it.contenido}</p></div>
        </div></div>`).join('')}
    </div>
    ${head(getSub(c, 'txt_proceso').titulo, 'Así preparamos tu plato', getSub(c, 'txt_proceso').descripcion)}
    <div class="row g-4">
      ${pasos.map((p, i) => `<div class="col-6 col-lg-3"><div class="step">
          <div class="step-num">${i + 1}</div>
          <h3>${p.titulo.replace(/^\d+\.\s*/, '')}</h3>
          <p class="mb-1">${p.contenido}</p><span class="deco fs-5">${p.subtitulo_detalle}</span>
        </div></div>`).join('')}
    </div>`;
}

function renderClientes() {
  const c = getCat('txt_clientes');
  const tes = itemsOf(c, 'txt_testimonios');
  const ali = itemsOf(c, 'txt_aliados');
  $('#clientes').innerHTML = `<div class="container">
    ${head(c.texto01, c.texto02)}
    <div class="row g-4 mb-5">
      ${tes.map(t => `<div class="col-md-4"><div class="card-soft"><div class="card-pad">
          <i class="bi bi-quote quote-ico"></i>
          <p class="mb-3">${t.contenido}</p>
          <div class="d-flex align-items-center gap-3">
            <img class="avatar" src="${img0(t)}" alt="${t.titulo}" loading="lazy">
            <div><h3 class="h6 mb-0">${t.titulo}</h3><small>${t.subtitulo_detalle}</small></div>
          </div>
        </div></div></div>`).join('')}
    </div>
    ${head(getSub(c, 'txt_aliados').titulo, 'Nuestros aliados', getSub(c, 'txt_aliados').descripcion)}
    <div class="row g-3">
      ${ali.map(a => `<div class="col-6 col-lg-3"><div class="aliado">
          <img src="${img0(a)}" alt="${a.titulo}" loading="lazy"><small>${a.titulo}</small>
          <small class="fw-normal opacity-75">${a.subtitulo_detalle}</small>
        </div></div>`).join('')}
    </div>
  </div>`;
}

function renderContacto() {
  const c = getCat('txt_contacto');
  const datos = itemsOf(c, 'txt_datos_contacto');
  const faq = itemsOf(c, 'txt_faq');
  const ico = { txt_direccion: 'bi-geo-alt-fill', txt_telefono: 'bi-telephone-fill', txt_horario: 'bi-clock-fill', txt_email: 'bi-envelope-fill' };

  // Cada dato de contacto; debajo de la dirección va la imagen del mapa
  const datoHtml = d => {
    const map = d.clave_txt === 'txt_direccion' ? mapCardHtml(d.titulo) : '';
    return `<div class="contact-item ${map ? 'mb-2' : ''}"><i class="bi ${ico[d.clave_txt] || 'bi-info-circle-fill'}"></i>
          <div><small>${d.subtitulo_detalle}</small><strong>${d.titulo}</strong></div></div>${map}`;
  };

  $('#contacto').innerHTML = head(c.texto01, c.texto02) + `
    <div class="row g-5">
      <div class="col-lg-5">
        ${datos.map(datoHtml).join('')}
        <a class="btn-brand mt-2" href="${waLink()}" target="_blank" rel="noopener"><i class="bi bi-whatsapp"></i> Reservar por WhatsApp</a>
      </div>
      <div class="col-lg-7">
        <span class="deco">${getSub(c, 'txt_faq').titulo}</span>
        <p>${getSub(c, 'txt_faq').descripcion}</p>
        <div class="accordion" id="faqAcc">
          ${faq.map((f, i) => `<div class="accordion-item">
            <h3 class="accordion-header"><button class="accordion-button ${i ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#faq${i}">${f.titulo}</button></h3>
            <div id="faq${i}" class="accordion-collapse collapse ${i ? '' : 'show'}" data-bs-parent="#faqAcc">
              <div class="accordion-body">${f.contenido}</div></div>
          </div>`).join('')}
        </div>
      </div>
    </div>`;
}

function renderFooter() {
  const n = DATA.negocio;
  const current = currentThemeFile();
  const visitas = DATA.mis_visitas !== undefined ? ` · Visitas: ${DATA.mis_visitas}` : '';
  
  // Validamos si txt_selector_tema tiene contenido igual a "1"
  const showThemeSelector = metaItem('txt_selector_tema')?.contenido === '1';

  const themeBoxHtml = showThemeSelector ? `
      <div class="col-md-6 text-md-end">
        <div class="theme-box text-start">
          <label for="themeSelect"><i class="bi bi-palette-fill"></i> Tema de la página</label>
          <select id="themeSelect" class="form-select form-select-sm">
            ${THEMES.map(t => `<option value="${t.file}" ${t.file === current ? 'selected' : ''}>${t.name}</option>`).join('')}
          </select>
        </div>
      </div>` : '';

  $('#footer').innerHTML = `<div class="container">
    <div class="row g-4 align-items-center">
      <div class="${showThemeSelector ? 'col-md-6' : 'col-md-12'}">
        <div class="brand mb-2">${logoHtml()}<span class="brand-name">${n.nombre}</span></div>
        <p class="mb-2 opacity-75">${metaItem('txt_meta_description')?.contenido || ''}</p>
        <div class="footer-social">${socialLinks()}</div>
      </div>
      ${themeBoxHtml}
    </div>
    <div class="copy">© ${new Date().getFullYear()} ${n.nombre}. Todos los derechos reservados.${visitas}</div>
  </div>`;
}