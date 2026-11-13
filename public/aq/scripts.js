/* ================== Configuración de temas ================== */
const THEMES = [
  { file: 'theme-01-solar-pop.css',        name: '01 · Solar Pop – Original' },
  { file: 'theme-02-luxury-gold.css',      name: '02 · Luxury Gold – Elegante' },
  { file: 'theme-03-ocean-fresh.css',      name: '03 · Ocean Fresh – Marino' },
  { file: 'theme-04-purple-dream.css',     name: '04 · Purple Dream – Creativo' },
  { file: 'theme-05-natural-green.css',    name: '05 · Natural Green – Orgánico' },
  { file: 'theme-06-urban-black.css',      name: '06 · Urban Black – Moderno' },
  { file: 'theme-07-pink-bloom.css',       name: '07 · Pink Bloom – Femenino' },
  { file: 'theme-08-tropical-sun.css',     name: '08 · Tropical Sun – Veraniego' },
  { file: 'theme-09-royal-blue.css',       name: '09 · Royal Blue – Corporativo' },
  { file: 'theme-10-earth-terracotta.css', name: '10 · Earth Terracotta – Artesanal' },
  { file: 'theme-11-neon-energy.css',      name: '11 · Neon Energy – Juvenil' },
  { file: 'theme-12-chocolate-cream.css',  name: '12 · Chocolate Cream – Premium' }
];
const THEME_KEY = 'bolichera-theme';

/* ================== Utilidades ================== */
const $ = s => document.querySelector(s);
const sortBy = (arr, k) => [...(arr || [])].sort((a, b) => (a[k] || 0) - (b[k] || 0));
const vis = arr => sortBy((arr || []).filter(x => x.is_visible !== 0), 'orden');
const money = n => 'S/ ' + Number(n).toFixed(2);
const tint = i => 'tint-' + (i % 3);
const pad = n => String(n).padStart(2, '0');

let DATA = null, PHONE = '', WA_MSG = '', DEAL_END = null;

const getCat = k => DATA.web.find(c => c.clave_txt === k);
const getSub = (c, k) => (c ? c.subcategorias.find(s => s.clave_txt === k) : null);
const itemsOf = (c, k) => vis(getSub(c, k)?.items);
const img0 = it => vis(it.imagenes)[0]?.url_img || '';
const metaItem = k => itemsOf(getCat('txt_meta_cat'), 'txt_meta').find(i => i.clave_txt === k);
const waLink = (extra = '') => `https://wa.me/51${PHONE}?text=${encodeURIComponent(WA_MSG + (extra ? ' – ' + extra : ''))}`;
const posCats = () => sortBy(DATA.pos.filter(c => c.is_activo !== 0), 'priority');
const allProducts = () => posCats().flatMap(c => c.productos.filter(p => p.is_visible !== 0).map(p => ({ ...p, _cat: c.category_id })));
const prodImg = p => sortBy((p.imagenes || []).filter(i => i.is_visible !== 0), 'orden')[0]?.img || '';
const head = (kicker, title, text) => `
  <div class="section-head">
    ${kicker ? `<span class="deco">${kicker}</span>` : ''}
    <h2 class="title">${title}</h2>
    ${text ? `<p class="lead-text">${text}</p>` : ''}
  </div>`;

/* ================== Tema ================== */
function applyTheme(file) {
  $('#theme-css').href = 'themes/' + file;
  try { localStorage.setItem(THEME_KEY, file); } catch (e) {}
}
(function loadSavedTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved && THEMES.some(t => t.file === saved)) $('#theme-css').href = 'themes/' + saved;
  } catch (e) {}
})();
const currentThemeFile = () => $('#theme-css').getAttribute('href').replace('themes/', '');

/* ================== Render ================== */
function renderMeta() {
  document.title = metaItem('txt_titulo')?.contenido || DATA.negocio.nombre;
  $('#metaDesc').content = metaItem('txt_meta_description')?.contenido || '';
  $('#metaKeys').content = metaItem('txt_meta_keywords')?.contenido || '';
  $('#waFloat').href = waLink();
}

function socialLinks() {
  const tk = metaItem('txt_tiktok')?.contenido, fb = metaItem('txt_facebook')?.contenido;
  return [
    fb ? `<a href="${fb}" target="_blank" rel="noopener" aria-label="Facebook"><i class="bi bi-facebook"></i></a>` : '',
    tk ? `<a href="${tk}" target="_blank" rel="noopener" aria-label="TikTok"><i class="bi bi-tiktok"></i></a>` : '',
    `<a href="${waLink()}" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="bi bi-whatsapp"></i></a>`
  ].join('');
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
        <a class="brand" href="#inicio"><img src="${n.img_logo}" alt="${n.nombre}"><span class="brand-name">${n.nombre}</span></a>
        <div class="header-side end"><a href="${waLink()}" target="_blank" rel="noopener"><i class="bi bi-whatsapp"></i> Reservar</a></div>
      </div>
      <nav class="main-nav"><a href="#inicio">Inicio</a><a href="#ofertas">Ofertas</a><a href="#carta">Carta</a>${links}</nav>
    </div>`;
}

function renderHero() {
  const slides = vis(DATA.sliders);
  const big = u => u.replace(/\/\d+\/\d+$/, '/1920/900');
  $('#inicio').innerHTML = `
    <div id="heroCarousel" class="carousel slide hero" data-bs-ride="carousel" data-bs-interval="5500">
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

function renderCategories() {
  $('#categorias').innerHTML = `<div class="container"><div class="row g-4 justify-content-center">
    ${posCats().map((c, i) => `
      <div class="col-6 col-lg-3">
        <button class="cat-bubble c-${i % 4}" data-filter="${c.category_id}" data-goto="1" aria-label="${c.name}">
          <img src="${c.img}" alt="${c.name}" loading="lazy">
          <div class="cat-over"><b>${c.icon} ${c.name}</b><span>Ver ahora</span></div>
        </button>
      </div>`).join('')}
  </div></div>`;
}

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
        <a class="btn-brand" href="${waLink(p.name)}" target="_blank" rel="noopener"><s>${money(v.precio_anterior)}</s>${money(p.price)} · Pedir</a>
      </div>
    </div></div>`;
}

function renderDeals() {
  const deals = allProducts().filter(p => p.variantes_json?.precio_anterior > 0);
  const groups = [];
  for (let i = 0; i < deals.length; i += 2) groups.push(deals.slice(i, i + 2));
  DEAL_END = DATA.sliders.map(s => s.fecha_fin).filter(Boolean).sort()[0];
  $('#ofertas').innerHTML = `<div class="container">
    ${head('Precios que se van volando', 'Ofertas del día', 'Aprovecha estos platos y bebidas con descuento antes de que termine la promoción.')}
    <div class="deals">
      <button class="round-btn soft deal-prev" data-bs-target="#dealsCarousel" data-bs-slide="prev" aria-label="Anterior"><i class="bi bi-chevron-left"></i></button>
      <div id="dealsCarousel" class="carousel slide" data-bs-ride="carousel" data-bs-interval="7000">
        <div class="carousel-inner">
          ${groups.map((g, gi) => `<div class="carousel-item ${gi ? '' : 'active'}"><div class="row g-4">${g.map((p, i) => dealHtml(p, gi * 2 + i)).join('')}</div></div>`).join('')}
        </div>
      </div>
      <button class="round-btn deal-next" data-bs-target="#dealsCarousel" data-bs-slide="next" aria-label="Siguiente"><i class="bi bi-chevron-right"></i></button>
    </div>
  </div>`;
  tickCountdown();
  setInterval(tickCountdown, 1000);
}

function tickCountdown() {
  if (!DEAL_END) return;
  let diff = Math.max(0, new Date(DEAL_END.replace(' ', 'T')) - Date.now()) / 1000;
  const v = { d: Math.floor(diff / 86400), h: Math.floor(diff % 86400 / 3600), m: Math.floor(diff % 3600 / 60), s: Math.floor(diff % 60) };
  document.querySelectorAll('[data-cd]').forEach(el => { el.textContent = pad(v[el.dataset.cd]); });
}

function renderSpotlight() {
  const best = allProducts().filter(p => p.variantes_json?.destacado)
    .sort((a, b) => (b.variantes_json.reviews || 0) - (a.variantes_json.reviews || 0))[0];
  if (!best) return;
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
        <a class="btn-white" href="${waLink(best.name)}" target="_blank" rel="noopener">Pedir por ${money(best.price)}</a>
      </div>
      <div class="col-lg-6 text-center"><img class="spot-img" src="${prodImg(best)}" alt="${best.name}"></div>
    </div></div>
    <div class="wv wv-bottom"></div>`;
}

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
          <a class="btn-brand" href="${waLink(p.name)}" target="_blank" rel="noopener">Pedir ahora</a>
        </div>
      </article>
    </div>`;
}

function renderCarta() {
  $('#carta').innerHTML = `
    <div class="container">
      ${head('Hecho al momento', 'Nuestra carta', getCat('txt_inicio').texto02)}
      <div class="d-flex flex-wrap justify-content-center gap-2 mb-5">
        <button class="chip" data-filter="all">Todo</button>
        ${posCats().map(c => `<button class="chip" data-filter="${c.category_id}">${c.icon} ${c.name}</button>`).join('')}
      </div>
      <div id="prodGrid" class="row g-4 justify-content-center"></div>
    </div>`;
  renderProducts('all');
}

function renderProducts(filter) {
  const all = allProducts();
  const list = filter === 'all' ? all : all.filter(p => p._cat === Number(filter));
  $('#prodGrid').innerHTML = list.map(productCard).join('');
  document.querySelectorAll('.chip').forEach(ch => ch.classList.toggle('active', ch.dataset.filter === String(filter)));
}

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
          <div class="valor-ico ${tint(i)}"><i class="bi ${icons[i % 4]}"></i></div>
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
  $('#contacto').innerHTML = head(c.texto01, c.texto02) + `
    <div class="row g-5">
      <div class="col-lg-5">
        ${datos.map(d => `<div class="contact-item"><i class="bi ${ico[d.clave_txt] || 'bi-info-circle-fill'}"></i>
          <div><small>${d.subtitulo_detalle}</small><strong>${d.titulo}</strong></div></div>`).join('')}
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
  const dueno = metaItem('txt_dueno_restaurante');
  const current = currentThemeFile();
  $('#footer').innerHTML = `<div class="container">
    <div class="row g-4 align-items-center">
      <div class="col-md-6">
        <div class="brand mb-2"><img src="${n.img_logo}" alt="${n.nombre}"><span class="brand-name">${n.nombre}</span></div>
        <p class="mb-2 opacity-75">${metaItem('txt_meta_description')?.contenido || ''}</p>
        <div class="footer-social">${socialLinks()}</div>
        ${dueno ? `<small class="opacity-75">${dueno.titulo}: ${dueno.contenido}</small>` : ''}
      </div>
      <div class="col-md-6 text-md-end">
        <div class="theme-box text-start">
          <label for="themeSelect"><i class="bi bi-palette-fill"></i> Tema de la página</label>
          <select id="themeSelect" class="form-select form-select-sm">
            ${THEMES.map(t => `<option value="${t.file}" ${t.file === current ? 'selected' : ''}>${t.name}</option>`).join('')}
          </select>
        </div>
      </div>
    </div>
    <div class="copy">© ${new Date().getFullYear()} ${n.nombre}. Todos los derechos reservados.</div>
  </div>`;
  $('#themeSelect').addEventListener('change', e => applyTheme(e.target.value));
}

/* ================== Eventos globales ================== */
document.addEventListener('click', e => {
  const f = e.target.closest('[data-filter]');
  if (!f) return;
  renderProducts(f.dataset.filter);
  if (f.dataset.goto) $('#carta').scrollIntoView({ behavior: 'smooth' });
});

/* ================== Inicio ================== */
(async function init() {
  try {
    const res = await fetch('base_bolichera.json');
    if (!res.ok) throw new Error(res.status);
    DATA = await res.json();
    PHONE = DATA.negocio.celular_informes;
    WA_MSG = metaItem('txt_mensaje_whasapp')?.contenido || 'Hola, deseo hacer una consulta.';
    renderMeta(); renderHeader(); renderHero(); renderCategories(); renderDeals();
    renderSpotlight(); renderCarta(); renderPropuesta(); renderEmpresa();
    renderServicios(); renderClientes(); renderContacto(); renderFooter();
  } catch (err) {
    document.body.insertAdjacentHTML('afterbegin',
      `<div class="alert alert-danger m-3">No se pudo cargar <b>base_bolichera.json</b>. Abre el proyecto con un servidor local (Live Server o <code>python -m http.server</code>).</div>`);
    console.error(err);
  }
})();