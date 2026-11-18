/* =====================================================================
   03_sections_bottom.js
   Renderizado de Destacado, Carta, Propuesta, Empresa, Servicios,
   Clientes, Contacto y Footer.
   ===================================================================== */

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
  
  // Función auxiliar para buscar un item con clave_txt en todo el árbol DATA.web
  const findItemByClave = (dataWeb, clave) => {
    const f = n => {
      if (Array.isArray(n)) {
        for (const x of n) { const r = f(x); if (r) return r; }
      } else if (n && typeof n === 'object') {
        if (n.clave_txt === clave) return n;
        for (const k in n) {
          const r = f(n[k]);
          if (r) return r;
        }
      }
      return null;
    };
    return f(dataWeb);
  };

  // Buscamos el item con clave_txt = 'txt_regentis'
  const regentisItem = DATA.web ? findItemByClave(DATA.web, 'txt_regentis') : null;
  // Contenido de txt_regentis (usamos titulo o contenido según convenga; aquí evaluamos contenido o titulo)
  const regentisText = regentisItem ? (regentisItem.contenido || regentisItem.titulo || '') : '';
  const regentisPart = regentisText ? `${regentisText} · ` : '';

  const visitas = DATA.mis_visitas !== undefined ? `Visitas: ${DATA.mis_visitas}` : '';
  
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
    <div class="copy">© ${new Date().getFullYear()} ${n.nombre} · ${regentisPart}${visitas}</div>
  </div>`;
}