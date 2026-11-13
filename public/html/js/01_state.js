/* =====================================================================
   01_state.js
   Variables de estado y control temporal.
   ===================================================================== */

/* ---------- Configuración de temas ---------- */
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

/* ---------- Control temporal ---------- */
const HERO_INTERVAL      = 5500; // ms entre slides del hero
const DEALS_INTERVAL     = 7000; // ms entre slides de ofertas
const COUNTDOWN_TICK_MS  = 1000; // refresco del contador regresivo

/* ---------- Estado de la aplicación ---------- */
let DATA     = null;  // árbol completo enviado por control.php (negocio, web, pos, sliders)
let PHONE    = '';    // celular de informes (sin +51)
let WA_MSG   = '';    // mensaje base de WhatsApp
let BASE     = '';    // URL base de public/html (viene de data-base en <body>)
let VERSION  = '';    // versión para cache-busting (viene de data-version)

let DEAL_END       = null; // fecha fin de la promoción (string 'YYYY-MM-DD HH:MM:SS')
let countdownTimer = null; // id del setInterval del contador