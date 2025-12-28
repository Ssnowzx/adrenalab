import { createProductCard } from './components/molecules/ProductCard.js';
import { cartState } from './core/store.js';
import { products } from '../data/products.js';
import { initWindowManager } from './core/windowManager.js';
import { initNavigation } from './core/navigation.js';
import { initMediaPlayer } from './components/molecules/MediaPlayer.js';
import { initAuth } from './components/authManager.js';
import { initCheckout } from './core/checkoutManager.js';

console.log(">> ADRENASKT SYSTEM INITIALIZED v2.2 <<");

// --- 1. BOOT LOGIC ---
function initBootSequence() {
  const lines = [
    "INICIALIZANDO KERNEL...",
    "CARREGANDO ASSETS...",
    "MONTANDO VOLUMES...",
    "VERIFICANDO MEMÓRIA... OK",
    "ESTABELECENDO CONEXÃO...",
    "SISTEMA PRONTO."
  ];
  let index = 0;
  const bootText = document.getElementById('boot-text');
  const bootScreen = document.getElementById('boot-screen');

  if (!bootText || !bootScreen) return;

  function typeLine() {
    if (index < lines.length) {
      const p = document.createElement('div');
      p.textContent = `> ${lines[index]}`;
      bootText.appendChild(p);
      index++;
      setTimeout(typeLine, 300);
    } else {
      setTimeout(() => {
        bootScreen.style.opacity = '0';
        setTimeout(() => bootScreen.style.display = 'none', 500);
      }, 800);
    }
  }
  typeLine();
}

// --- 2. RENDER PRODUCTS ---
function renderProducts(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.innerHTML = '';

  products.forEach(product => {
    const card = createProductCard(product, (p) => {
      cartState.addItem(p);
      toggleCart(true); // Open cart sidebar
    });
    container.appendChild(card);
  });
}

// --- 3. CART LOGIC UI BINDING ---
function initCartUI() {
  const countEl = document.getElementById('cart-count');
  const countFullEl = document.getElementById('cart-count-full');
  const itemsContainer = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');

  // Bind Sidebar Close
  const closeBtn = document.getElementById('close-cart-btn');
  if (closeBtn) closeBtn.onclick = () => toggleCart(false);

  // Bind Sidebar Open (Navbar)
  const navCartBtn = document.getElementById('nav-btn-cart');
  if (navCartBtn) navCartBtn.onclick = () => toggleCart();

  // Bind Full Store Cart Btn
  const navCartFullBtn = document.getElementById('nav-btn-cart-full');
  if (navCartFullBtn) navCartFullBtn.onclick = () => toggleCart();

  cartState.subscribe((items) => {
    // Update Counts
    if (countEl) countEl.innerText = items.length;
    if (countFullEl) countFullEl.innerText = items.length;

    // Update Total
    const total = cartState.getTotal();
    if (totalEl) totalEl.innerText = `R$ ${total.toFixed(2)}`;

    // Render Items
    if (itemsContainer) {
      itemsContainer.innerHTML = '';
      if (items.length === 0) {
        itemsContainer.innerHTML = '<div class="text-center text-gray-500 font-mono text-sm mt-10">>> NENHUM ITEM DETECTADO <<</div>';
      } else {
        items.forEach((item, index) => {
          const el = document.createElement('div');
          el.className = 'flex gap-3 items-center bg-purple-900/20 p-2 border border-purple-900/50';
          el.innerHTML = `
                        <div class="w-12 h-12 bg-gray-900 flex-shrink-0">
                            <img src="${item.img}" class="w-full h-full object-cover opacity-80">
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="retro-font text-[10px] text-purple-300 truncate">${item.title}</h4>
                            <p class="font-mono text-xs text-white">R$ ${item.price.toFixed(2)}</p>
                        </div>
                        <button data-index="${index}" class="text-red-500 hover:text-white p-1 btn-remove">
                            <i class="ph-bold ph-trash"></i>
                        </button>
                    `;
          itemsContainer.appendChild(el);
        });

        itemsContainer.querySelectorAll('.btn-remove').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const idx = parseInt(e.currentTarget.dataset.index);
            cartState.removeItem(idx);
          });
        });
      }
    }

    updateCheckoutButton(total);
  });
}

function updateCheckoutButton(total) {
  const btn = document.getElementById('btn-fallback-checkout');
  if (!btn) return;
  if (total > 0) btn.classList.remove('hidden');
  else btn.classList.add('hidden');
}

// Global Toggle (exported for internal use, though we prefer events)
function toggleCart(forceOpen = null) {
  const sidebar = document.getElementById('cart-sidebar');
  if (!sidebar) return;

  if (forceOpen === true) {
    sidebar.classList.add('open');
  } else if (forceOpen === false) {
    sidebar.classList.remove('open');
  } else {
    sidebar.classList.toggle('open');
  }
}
// Expose for debugging if needed, but UI is bound in initCartUI
window.toggleCart = toggleCart;


// --- CLOCK ---
function initClock() {
  function update() {
    const el = document.getElementById('clock');
    if (el) el.innerText = new Date().toLocaleTimeString('pt-BR');
  }
  setInterval(update, 1000);
  update();
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
  initBootSequence();
  initWindowManager();
  initNavigation();
  initCartUI();
  initMediaPlayer();
  initAuth();
  initCheckout();
  initClock();

  // Render multiple places
  renderProducts('#win-shop .grid');      // Preview Window
  renderProducts('#mobile-shop-grid');    // Mobile Feed Grid
  renderProducts('#full-store-grid');     // Full Store Page
});
