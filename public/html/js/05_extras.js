/* =====================================================================
   05_extras.js
   - Carrusel de categorías (una fila, mouse + touch, flechas, auto 4 en 4)
   - Carrito de compras (panel lateral, guarda en localStorage, envía por WhatsApp)
   Se ejecuta después de 04_main.js, cuando ya se dibujó la página.
   ===================================================================== */

const CAT_INTERVAL = 4000;            // ms entre movimientos automáticos
const CART_KEY     = 'bolichera-cart';
let CART = {};                        // { product_id: cantidad }
let toastTimer = null;

/* =====================================================================
   CARRUSEL DE CATEGORÍAS
   ===================================================================== */
function initCatCarousel() {
  const track = $('#catTrack');
  if (!track) return;
  const root = track.closest('.cat-carousel');
  const prev = root.querySelector('.cat-prev');
  const next = root.querySelector('.cat-next');

  let timer = null, hover = false, dragging = false, sx = 0, sl = 0, moved = 0;

  const itemW     = () => track.querySelector('.cat-item')?.getBoundingClientRect().width || track.clientWidth;
  const perView   = () => Math.max(1, Math.round(track.clientWidth / itemW()));
  const maxScroll = () => track.scrollWidth - track.clientWidth;
  const canScroll = () => maxScroll() > 4;

  function go(dir) {
    if (!canScroll()) return;
    const w = itemW(), n = perView(), cur = track.scrollLeft, max = maxScroll();
    let target;
    if (dir > 0) target = cur >= max - 4 ? 0   : Math.min(max, (Math.round(cur / w) + n) * w);
    else         target = cur <= 4       ? max : Math.max(0,   (Math.round(cur / w) - n) * w);
    track.scrollTo({ left: target, behavior: 'smooth' });
  }

  function stop()  { if (timer) { clearInterval(timer); timer = null; } }
  function start() {
    stop();
    if (!canScroll()) return;
    timer = setInterval(() => { if (!hover && !dragging && !document.hidden) go(1); }, CAT_INTERVAL);
  }
  function refresh() { root.classList.toggle('no-scroll', !canScroll()); start(); }

  // Flechas
  prev.addEventListener('click', () => { go(-1); start(); });
  next.addEventListener('click', () => { go(1);  start(); });

  // Arrastre con mouse (en táctil el scroll es nativo)
  track.addEventListener('mousedown', e => {
    if (e.button !== 0 || !canScroll()) return;
    dragging = true; moved = 0; sx = e.pageX; sl = track.scrollLeft;
    track.classList.add('dragging');
  });
  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    const dx = e.pageX - sx;
    moved = Math.max(moved, Math.abs(dx));
    track.scrollLeft = sl - dx;
  });
  window.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('dragging');
    const w = itemW();
    track.scrollTo({ left: Math.round(track.scrollLeft / w) * w, behavior: 'smooth' });
    start();
  });
  // Si hubo arrastre, no se dispara el click de la burbuja
  track.addEventListener('click', e => { if (moved > 5) { e.stopPropagation(); e.preventDefault(); } moved = 0; }, true);
  track.addEventListener('dragstart', e => e.preventDefault());

  // Pausa en hover / toque y reanuda al soltar
  root.addEventListener('mouseenter', () => { hover = true; });
  root.addEventListener('mouseleave', () => { hover = false; });
  track.addEventListener('touchstart', stop, { passive: true });
  track.addEventListener('touchend', start, { passive: true });
  window.addEventListener('resize', refresh);

  refresh();
}

/* =====================================================================
   CARRITO
   ===================================================================== */
function loadCart() {
  try { CART = JSON.parse(localStorage.getItem(CART_KEY) || '{}') || {}; } catch (e) { CART = {}; }
}
function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(CART)); } catch (e) {}
}

// Líneas del carrito con datos actuales del producto (precio, imagen, nombre)
function cartLines() {
  const map = new Map(allProducts().map(p => [String(p.product_id), p]));
  return Object.entries(CART)
    .filter(([id, q]) => map.has(id) && q > 0)
    .map(([id, q]) => ({ p: map.get(id), qty: q }));
}
const cartCount = () => cartLines().reduce((a, l) => a + l.qty, 0);
const cartTotal = () => cartLines().reduce((a, l) => a + l.qty * Number(l.p.price), 0);

function showToast(msg) {
  let t = $('#cartToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'cartToast';
    t.className = 'cart-toast';
    document.body.appendChild(t);
  }
  t.innerHTML = `<i class="bi bi-check-circle-fill"></i> ${msg}`;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}

function addToCart(id) {
  const p = allProducts().find(x => String(x.product_id) === String(id));
  if (!p) return;
  CART[id] = Math.min(99, (CART[id] || 0) + 1);
  saveCart();
  renderCart();
  const btn = $('.cart-btn');
  if (btn) { btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump'); }
  showToast(`${p.name} agregado al carrito`);
}

function renderCart() {
  const lines = cartLines();
  const box = $('#cartItems');
  if (box) {
    box.innerHTML = lines.length ? lines.map(({ p, qty }) => `
      <div class="cart-row">
        <img class="cart-img" src="${prodImg(p)}" alt="${p.name}">
        <div class="cart-info"><b>${p.name}</b><small>${money(p.price)}</small></div>
        <div class="cart-qty">
          <button type="button" data-cart="dec" data-id="${p.product_id}" aria-label="Quitar uno"><i class="bi bi-dash"></i></button>
          <span>${qty}</span>
          <button type="button" data-cart="inc" data-id="${p.product_id}" aria-label="Agregar uno"><i class="bi bi-plus"></i></button>
        </div>
        <button type="button" class="cart-del" data-cart="del" data-id="${p.product_id}" aria-label="Eliminar"><i class="bi bi-x-lg"></i></button>
      </div>`).join('')
      : `<div class="cart-empty"><i class="bi bi-cart-x"></i><p>Tu carrito está vacío</p></div>`;
  }
  const total = $('#cartTotal');
  if (total) total.textContent = money(cartTotal());
  const send = $('#cartSend');
  if (send) send.disabled = !lines.length;

  const n = cartCount();
  document.querySelectorAll('.cart-badge').forEach(b => { b.textContent = n; b.hidden = n === 0; });
}

// Panel lateral (offcanvas de Bootstrap), se crea una sola vez
function buildCartPanel() {
  if ($('#cartPanel')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <div class="offcanvas offcanvas-end cart-panel" tabindex="-1" id="cartPanel" aria-labelledby="cartTitle">
      <div class="offcanvas-header">
        <h2 class="cart-title" id="cartTitle">Tu carrito</h2>
        <button type="button" class="cart-close" data-bs-dismiss="offcanvas" aria-label="Cerrar"><i class="bi bi-x-lg"></i></button>
      </div>
      <div class="offcanvas-body">
        <div class="cart-head"><span>Producto</span><span>Cantidad</span></div>
        <div id="cartItems"></div>
        <div class="cart-total"><span>Total</span><strong id="cartTotal">S/ 0.00</strong></div>

        <label for="cartAddr">Dirección de envío</label>
        <input id="cartAddr" class="cart-input" type="text" placeholder="Calle, número, distrito" autocomplete="street-address">

        <label for="cartTel">Teléfono</label>
        <input id="cartTel" class="cart-input" type="tel" inputmode="numeric" placeholder="999 999 999" autocomplete="tel">

        <label for="cartPromo">Código promocional (opcional)</label>
        <input id="cartPromo" class="cart-input" type="text" autocomplete="off">

        <button type="button" id="cartSend" class="cart-send"><i class="bi bi-whatsapp"></i> Enviar pedido</button>
      </div>
    </div>`);
}

function sendOrder() {
  const addr  = $('#cartAddr'), tel = $('#cartTel'), promo = $('#cartPromo');
  const lines = cartLines();
  if (!lines.length) return;

  const digits = tel.value.replace(/\D/g, '');
  const okAddr = addr.value.trim().length >= 5;
  const okTel  = digits.length >= 9;
  addr.classList.toggle('is-invalid', !okAddr);
  tel.classList.toggle('is-invalid', !okTel);
  if (!okAddr) { addr.focus(); return; }
  if (!okTel)  { tel.focus();  return; }

  const msg =
    `Hola, quiero hacer este pedido desde la web de ${DATA.negocio.nombre}:\n\n` +
    `*PEDIDO*\n` +
    lines.map(l => `• ${l.qty} x ${l.p.name} – ${money(l.qty * l.p.price)}`).join('\n') +
    `\n\n*Total:* ${money(cartTotal())}` +
    `\n*Dirección:* ${addr.value.trim()}` +
    `\n*Teléfono:* ${tel.value.trim()}` +
    (promo.value.trim() ? `\n*Código promocional:* ${promo.value.trim()}` : '');

  window.open(`https://wa.me/51${PHONE}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
}

/* ---------- Eventos del carrito (delegados) ---------- */
document.addEventListener('click', e => {
  // Botones "Pedir ahora" / "Pedir"
  const add = e.target.closest('[data-add]');
  if (add) { e.preventDefault(); addToCart(add.dataset.add); return; }

  // + / − / eliminar dentro del panel
  const c = e.target.closest('[data-cart]');
  if (c) {
    const id = c.dataset.id, act = c.dataset.cart;
    if (act === 'inc') CART[id] = Math.min(99, (CART[id] || 0) + 1);
    if (act === 'dec') { if ((CART[id] || 0) <= 1) delete CART[id]; else CART[id]--; }
    if (act === 'del') delete CART[id];
    saveCart();
    renderCart();
    return;
  }

  if (e.target.closest('#cartSend')) sendOrder();
});

document.addEventListener('input', e => {
  if (e.target.matches('.cart-input')) e.target.classList.remove('is-invalid');
});

/* ---------- Inicio (se ejecuta después de 04_main.js) ---------- */
document.addEventListener('DOMContentLoaded', () => {
  if (!DATA || DATA.status !== 'ok') return;
  safeRender(loadCart);
  safeRender(buildCartPanel);
  safeRender(renderCart);
  safeRender(initCatCarousel);
});