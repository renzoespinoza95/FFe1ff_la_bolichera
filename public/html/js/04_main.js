/* =====================================================================
   04_main.js
   Escuchadores de eventos, carruseles (infinito + táctil) e inicio.
   ===================================================================== */

/* ---------- Carruseles: loop infinito y gestos táctiles ---------- */
function initCarousels() {
  if (!window.bootstrap) return;
  [
    ['#heroCarousel',  HERO_INTERVAL],
    ['#dealsCarousel', DEALS_INTERVAL]
  ].forEach(([sel, interval]) => {
    const el = $(sel);
    if (!el) return;
    bootstrap.Carousel.getOrCreateInstance(el, {
      interval: interval,
      ride: 'carousel',
      wrap: true,    // al llegar al último vuelve al primero (infinito)
      touch: true,   // deslizar con el dedo en móvil
      pause: 'hover'
    });
  });
}

/* ---------- Eventos globales (delegados) ---------- */

// Filtros de la carta y burbujas de categorías
document.addEventListener('click', e => {
  const f = e.target.closest('[data-filter]');
  if (!f) return;
  renderProducts(f.dataset.filter);
  if (f.dataset.goto) $('#carta').scrollIntoView({ behavior: 'smooth' });
});

// Selector de tema del footer
document.addEventListener('change', e => {
  if (e.target.matches('#themeSelect')) applyTheme(e.target.value);
});

// Pausa el contador cuando la pestaña no está visible
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopCountdown(); else startCountdown();
});

/* ---------- Inicio ---------- */
document.addEventListener('DOMContentLoaded', () => {
  try {
    BASE = document.body.dataset.base || '';
    VERSION = document.body.dataset.version || '';
    loadSavedTheme();

    DATA = readPageData();
    if (!DATA || DATA.status !== 'ok') {
      throw new Error((DATA && DATA.msg) || 'Los datos del negocio no están disponibles');
    }

    PHONE = DATA.negocio.celular_informes || '';
    WA_MSG = metaItem('txt_mensaje_whasapp')?.contenido || 'Hola, deseo hacer una consulta.';

    [
      renderMeta, renderHeader, renderHero, renderCategories, renderDeals,
      renderSpotlight, renderCarta, renderPropuesta, renderEmpresa,
      renderServicios, renderClientes, renderContacto, renderFooter
    ].forEach(safeRender);

    initCarousels();
    startCountdown();
  } catch (err) {
    showFatalError('No se pudieron cargar los datos del negocio: <b>' + err.message + '</b>');
    console.error(err);
  }
});