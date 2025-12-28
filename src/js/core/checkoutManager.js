import { supabase } from './supabaseClient.js';
import { MP_PUBLIC_KEY } from './mpConfig.js';
import { cartState } from './store.js';

let mp = null;
let bricksBuilder = null;
let currentItems = []; // Store items for saving order

export function initCheckout() {
  console.log('Inicializando Checkout Manager...');

  try {
    if (window.MercadoPago) {
      mp = new MercadoPago(MP_PUBLIC_KEY, {
        locale: 'pt-BR'
      });
      console.log('MercadoPago SDK inicializado com sucesso.');
    } else {
      console.error('MercadoPago SDK não encontrado! Verifique o script no head.');
      return;
    }
  } catch (e) {
    console.error('Erro ao inicializar MP:', e);
  }

  const checkoutBtn = document.getElementById('btn-fallback-checkout');
  const closeCheckoutBtn = document.getElementById('btn-back-desktop-checkout');
  const fullCheckoutPage = document.getElementById('full-checkout-page');
  // Area principal do desktop que deve sumir
  const desktopArea = document.getElementById('desktop-area');

  if (closeCheckoutBtn) {
    closeCheckoutBtn.onclick = () => {
      // Close full page
      if (fullCheckoutPage) {
        fullCheckoutPage.classList.remove('active');
        // Wait for transition if needed, then hide
        setTimeout(() => {
          fullCheckoutPage.style.display = 'none';

          // RESTORE DESKTOP
          if (desktopArea) desktopArea.style.display = 'block'; // Garante que a área principal esteja visível

          // Re-exibir Dock
          const dock = document.getElementById('minimized-dock');
          if (dock) dock.style.display = 'flex';

          // Re-abrir janelas que estavam abertas
          const hiddenWindows = document.querySelectorAll('.drag-window[data-was-open="true"]');
          hiddenWindows.forEach(win => {
            win.style.display = 'flex';
            delete win.dataset.wasOpen;
          });
        }, 300);
      }
    };
  }

  if (checkoutBtn) {
    console.log('Botão de checkout encontrado. Adicionando listener.');
    const newBtn = checkoutBtn.cloneNode(true);
    checkoutBtn.parentNode.replaceChild(newBtn, checkoutBtn);

    newBtn.addEventListener('click', async () => {
      console.log('Botão de checkout clicado.');
      const items = cartState.getState();
      if (items.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
      }

      // HIDE DESKTOP WINDOWS (Limpa a visão minimizando)
      const openWindows = document.querySelectorAll('.drag-window:not(.hidden)');
      openWindows.forEach(win => {
        if (win.style.display !== 'none') {
          // Marca a janela para ser restaurada depois, salvando o estado original de display
          win.dataset.wasOpen = 'true';
          win.style.display = 'none';
        }
      });
      // Esconder DOCK temporariamente
      const dock = document.getElementById('minimized-dock');
      if (dock) dock.style.display = 'none';

      // FECHA O SIDEBAR DO CARRINHO TBM
      const sidebar = document.getElementById('cart-sidebar');
      if (sidebar) sidebar.classList.remove('open');

      // Mostrar a página de checkout
      if (fullCheckoutPage) {
        fullCheckoutPage.style.display = 'block';
        setTimeout(() => fullCheckoutPage.classList.add('active'), 10);

        updateSummary(items);
        renderPaymentBrick(items);
        currentItems = items; // Save for database insertion
      } else {
        console.error('Página de checkout (full-checkout-page) não encontrada!');
      }
    });
  } else {
    console.error('Botão btn-fallback-checkout não encontrado!');
  }
}

function updateSummary(items) {
  const summaryEl = document.getElementById('checkout-summary');
  if (!summaryEl) return;

  const total = cartState.getTotal();
  summaryEl.innerHTML = items.map(item => `
        <div class="flex justify-between py-1 border-b border-purple-900/40">
            <span>${item.title}</span>
            <span>R$ ${item.price.toFixed(2)}</span>
        </div>
    `).join('') + `
        <div class="flex justify-between mt-4 pt-2 border-t border-purple-500 text-purple-400 font-bold text-lg">
            <span>TOTAL:</span>
            <span>R$ ${total.toFixed(2)}</span>
        </div>
    `;
}

async function renderPaymentBrick(items) {
  if (!mp) return;

  const total = cartState.getTotal();
  const container = document.getElementById('payment-brick-container');

  if (!container) return;

  // Limpar container se já existir algo
  container.innerHTML = '';

  const settings = {
    initialization: {
      amount: total,
      preferenceId: null,
    },
    customization: {
      visual: {
        style: {
          theme: 'dark', // Tema escuro combina com o site
        },
      },
      paymentMethods: {
        creditCard: 'all',
        debitCard: 'all',
        ticket: 'all',
        bankTransfer: 'all', // PIX
        maxInstallments: 12
      },
    },
    callbacks: {
      onReady: () => {
        console.log('Payment Brick ready');
      },
      onSubmit: ({ selectedPaymentMethod, formData }) => {
        return new Promise(async (resolve, reject) => {
          // 1. Obter User ID se logado
          const { data: { session } } = await supabase.auth.getSession();
          const userId = session ? session.user.id : null;

          // 2. Adicionar items e user ao body
          const bodyData = {
            formData,
            items: cartState.getState(), // Envia itens agora
            userId: userId
          };

          fetch('/api/process-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyData), // Body enriquecido
          })
            .then((response) => response.json())
            .then((result) => {
              handlePaymentResult(result);
              resolve();
            })
            .catch((error) => {
              console.error(error);
              reject();
            });
        });
      },
      onError: (error) => {
        console.error('Payment Brick Error:', error);
      },
    },
  };

  try {
    bricksBuilder = mp.bricks();
    await bricksBuilder.create('payment', 'payment-brick-container', settings);
  } catch (e) {
    console.error('Erro ao criar Bricks:', e);
  }
}

// Função client-side removida por segurança. Agora o servidor insere no banco.
function handlePaymentResult(result) {
  const msgEl = document.getElementById('payment-status-message');
  if (!msgEl) return;

  msgEl.classList.remove('hidden');
  msgEl.className = 'mt-4 text-center font-mono text-sm p-4 border-2';

  if (result.status === 'approved') {
    msgEl.innerHTML = `
            <div class="flex flex-col items-center">
                <i class="ph-fill ph-check-circle text-4xl text-purple-400 mb-2"></i>
                <span class="text-purple-400 font-bold">PAGAMENTO APROVADO!</span>
                <span class="text-xs text-purple-200 mt-1">Seu pedido já está no sistema.</span>
            </div>
        `;
    msgEl.classList.add('border-purple-500', 'bg-purple-900/30');

    // Banco atualizado via servidor. Apenas limpar UI.

    cartState.clear();
    setTimeout(() => {
      const btn = document.getElementById('btn-back-desktop-checkout');
      if (btn) btn.click();
    }, 5000);
  } else if (result.status === 'in_process') {
    msgEl.innerHTML = `
            <div class="flex flex-col items-center">
                <i class="ph-fill ph-hourglass text-4xl text-yellow-400 mb-2"></i>
                <span class="text-yellow-400 font-bold">PROCESSANDO...</span>
                <span class="text-xs text-yellow-200 mt-1">Aguarde a confirmação.</span>
            </div>
        `;
    msgEl.classList.add('border-yellow-500', 'bg-yellow-900/30');
  } else {
    msgEl.innerHTML = `
            <div class="flex flex-col items-center">
                <i class="ph-fill ph-x-circle text-4xl text-red-500 mb-2"></i>
                <span class="text-red-500 font-bold">FALHA NO PAGAMENTO</span>
                <span class="text-xs text-red-300 mt-1">${result.status_detail || result.error || 'Verifique seus dados.'}</span>
                <button class="mt-2 text-[10px] underline hover:text-white" onclick="this.parentElement.parentElement.classList.add('hidden')">TENTAR NOVAMENTE</button>
            </div>
        `;
    msgEl.classList.add('border-red-500', 'bg-red-900/30');
  }
}
