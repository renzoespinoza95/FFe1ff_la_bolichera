/* =====================================================================
   03_sections_top.js
   Renderizado de Meta, Cabecera, Hero, Categorías y Ofertas del día.
   ===================================================================== */

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
  const hasOld = v.precio_anterior > 0;
  const pct = hasOld ? Math.round((1 - p.price / v.precio_anterior) * 100) : 0;
  const spec = Object.values(v.especificaciones || {})[0] || '';
  const tagHtml = pct > 0 ? `<span class="deal-tag">-${pct}%</span>` : (v.etiqueta ? `<span class="deal-tag">${v.etiqueta}</span>` : '');
  const priceHtml = hasOld ? `<s>${money(v.precio_anterior)}</s>${money(p.price)}` : money(p.price);

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
        ${tagHtml}
        <h3>${p.name}</h3>
        <small class="brand-t">${p.marca_des}</small>
        ${spec ? `<span class="deal-chip">${spec}</span>` : ''}
        <button type="button" class="btn-brand" data-add="${p.product_id}">${priceHtml} · Pedir</button>
      </div>
    </div></div>`;
}

function renderDeals() {
  const offerCat = (DATA.pos || []).find(c => c.clave_txt === 'prod_oferta');
  const deals = offerCat ? (offerCat.productos || []).filter(p => p.is_visible !== 0) : [];
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