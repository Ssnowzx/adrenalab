
import { supabase } from '../core/supabaseClient.js';
import { toggleMobileMenu } from '../core/navigation.js';

export function initAuth() {
  const fullLoginPage = document.getElementById('full-login-page');
  const fullProfilePage = document.getElementById('full-profile-page');
  const loginBtn = document.getElementById('nav-btn-login');
  const mobileLoginBtn = document.getElementById('mobile-nav-btn-login');

  // Login Back Button
  const backBtnLogin = document.getElementById('btn-back-desktop-login');
  // Profile Back Button
  const backBtnProfile = document.getElementById('btn-back-desktop-profile');

  const form = document.getElementById('login-form');
  const linkSignup = document.getElementById('link-signup');
  const logoutBtn = document.getElementById('btn-logout');

  // --- 1. Navigation Logic ---

  const handleLoginClick = async () => {
    // Close mobile menu if open
    toggleMobileMenu(false);

    // Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      openProfilePage(session.user);
    } else {
      openLoginPage();
    }
  };

  if (loginBtn) loginBtn.addEventListener('click', handleLoginClick);
  if (mobileLoginBtn) mobileLoginBtn.addEventListener('click', handleLoginClick);


  if (backBtnLogin) {
    backBtnLogin.addEventListener('click', () => {
      closePage(fullLoginPage);
    });
  }

  if (backBtnProfile) {
    backBtnProfile.addEventListener('click', () => {
      closePage(fullProfilePage);
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await supabase.auth.signOut();
      closePage(fullProfilePage);

      // Reset Login Button
      [loginBtn, mobileLoginBtn].forEach(btn => {
        if (btn) {
          btn.innerText = '[LOGIN]';
          btn.classList.remove('text-green-400');
        }
      });
      alert('Desconectado com sucesso.');
    });
  }

  function openLoginPage() {
    if (fullLoginPage) {
      hideDesktop();
      fullLoginPage.style.display = 'block';
    }
  }

  function openProfilePage(user) {
    if (fullProfilePage) {
      hideDesktop();
      fullProfilePage.style.display = 'block';

      // Update Profile Info
      const emailHeader = document.getElementById('profile-email-header');
      const profileName = document.getElementById('profile-name');
      const profileJoined = document.getElementById('profile-joined');

      if (emailHeader) emailHeader.innerText = ''; // ID removido a pedido

      // Carregar Profile do Supabase
      loadUserProfile(user.id);

      // Carregar Histórico de Pedidos
      loadOrderHistory(user.id);
    }
  }

  async function loadUserProfile(userId) {
    const profileName = document.getElementById('profile-name');
    const profileJoined = document.getElementById('profile-joined');
    const profileLevel = document.querySelector('#full-profile-page .text-purple-300.font-mono'); // Selector pro Nivel

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        if (profileName) profileName.innerText = data.display_name ? data.display_name.toUpperCase() : 'USER';
        if (profileLevel) profileLevel.innerText = data.level || 'INICIANTE'; // Pega do banco ou default
        if (profileJoined) {
          const date = new Date(data.created_at).toLocaleDateString('pt-BR');
          profileJoined.innerText = `Membro desde ${date} `;
        }
      }
    } catch (e) {
      console.error('Erro ao carregar perfil:', e);
    }
  }

  async function loadOrderHistory(userId) {
    const historyList = document.getElementById('order-history-list');
    if (!historyList) return;

    historyList.innerHTML = '<div class="text-center py-4 text-purple-400 font-mono text-xs animate-pulse">CARREGANDO PEDIDOS...</div>';

    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!orders || orders.length === 0) {
        historyList.innerHTML = `
  < div class="text-center py-8 text-gray-600 font-mono text-sm" >
                      <i class="ph-duotone ph-shopping-bag-open text-4xl mb-2 opacity-50"></i>
                      <p>Nenhum pedido encontrado. Hora de dropar na loja!</p>
                  </div > `;
        return;
      }

      historyList.innerHTML = orders.map(order => `
  < div class="border border-purple-900/50 bg-purple-900/10 p-3 flex justify-between items-center group hover:border-purple-500 transition-colors" >
                  <div>
                      <div class="text-[10px] text-gray-500 font-mono mb-1">DATA: ${new Date(order.created_at).toLocaleDateString('pt-BR')}</div>
                      <div class="text-xs text-white font-mono flex items-center gap-2">
                           <span class="w-2 h-2 rounded-full ${getStatusColor(order.status)}"></span>
                           ${getStatusLabel(order.status)}
                      </div>
                  </div>
                  <div class="text-right">
                      <div class="text-sm text-purple-400 font-bold">R$ ${order.total_amount.toFixed(2)}</div>
                      <div class="text-[10px] text-gray-600 uppercase">${order.payment_method || 'PIX'}</div>
                  </div>
              </div >
  `).join('');

    } catch (e) {
      console.error('Erro ao carregar pedidos:', e);
      historyList.innerHTML = '<div class="text-center text-red-500 text-xs">Erro ao carregar histórico.</div>';
    }
  }

  function getStatusColor(status) {
    if (status === 'approved') return 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]';
    if (status === 'pending') return 'bg-yellow-500 animate-pulse';
    return 'bg-red-500';
  }

  function getStatusLabel(status) {
    if (status === 'approved') return 'PAGAMENTO APROVADO';
    if (status === 'pending') return 'AGUARDANDO PAGAMENTO';
    return 'CANCELADO';
  }

  function closePage(pageEl) {
    if (pageEl) {
      pageEl.style.display = 'none';
      restoreDesktop();
    }
  }

  function hideDesktop() {
    // Hide existing desktop windows to clean up view
    const openWindows = document.querySelectorAll('.drag-window:not(.hidden)');
    openWindows.forEach(win => {
      if (win.style.display !== 'none') {
        win.dataset.wasOpen = 'true';
        win.style.display = 'none';
      }
    });
    // Hide dock
    const dock = document.getElementById('minimized-dock');
    if (dock) dock.style.display = 'none';

    // Close Sidebar if open
    const sidebar = document.getElementById('cart-sidebar');
    if (sidebar) sidebar.classList.remove('open');
  }

  function restoreDesktop() {
    const desktopArea = document.getElementById('desktop-area');
    if (desktopArea) desktopArea.style.display = ''; // Clear inline to let CSS (md:block) take over

    const mobileDashboard = document.getElementById('mobile-dashboard');
    if (mobileDashboard) mobileDashboard.style.display = ''; // Clear inline to let CSS (md:hidden) take over

    const dock = document.getElementById('minimized-dock');
    if (dock) dock.style.display = ''; // Clear inline to let CSS handle it


    // Restore windows
    const hiddenWindows = document.querySelectorAll('.drag-window[data-was-open="true"]');
    hiddenWindows.forEach(win => {
      win.style.display = 'flex';
      delete win.dataset.wasOpen;
    });
  }

  // --- 2. Login Logic ---
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email-input').value;
      const password = document.getElementById('password-input').value;
      const isSignUp = form.dataset.mode === 'signup';

      showMessage('Processando...', 'text-yellow-400');

      try {
        let error, data;

        if (isSignUp) {
          const res = await supabase.auth.signUp({
            email,
            password,
          });
          error = res.error;
          data = res.data;

          if (!error) {
            if (data.session) {
              showMessage('Cadastro realizado! Entrando...', 'text-green-400');
              setTimeout(() => {
                closePage(fullLoginPage);
                updateUserUI(data.user);
              }, 1500);
            } else {
              showMessage('Verifique seu email para confirmar!', 'text-green-400');
            }
          }
        } else {
          const res = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          error = res.error;
          data = res.data;

          if (!error) {
            showMessage('Login realizado com sucesso!', 'text-green-400');
            setTimeout(() => {
              closePage(fullLoginPage);
              updateUserUI(data.user);
            }, 1500);
          }
        }

        if (error) throw error;

      } catch (err) {
        console.error(err);
        showMessage(translateError(err.message), 'text-red-500');
      }
    });
  }

  // 3. Toggle Signup Mode
  if (linkSignup) {
    linkSignup.addEventListener('click', (e) => {
      e.preventDefault();
      const isSignUp = form.dataset.mode === 'signup';

      if (isSignUp) {
        // Switch to Login
        form.dataset.mode = 'login';
        form.querySelector('button').innerText = '>> CONECTAR <<';
        linkSignup.innerText = 'NOVO REGISTRO';
        form.previousElementSibling.querySelector('h3').innerText = 'AUTENTICAÇÃO';
      } else {
        // Switch to Signup
        form.dataset.mode = 'signup';
        form.querySelector('button').innerText = '>> CADASTRAR <<';
        linkSignup.innerText = 'VOLTAR PARA O LOGIN';
        form.previousElementSibling.querySelector('h3').innerText = 'NOVO USUÁRIO';
      }
      showMessage('', '');
    });
  }

  // Check Session on Load
  checkSession();
}

async function checkSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    updateUserUI(session.user);
  }
}

function updateUserUI(user) {
  const loginBtn = document.getElementById('nav-btn-login');
  const mobileLoginBtn = document.getElementById('mobile-nav-btn-login');

  [loginBtn, mobileLoginBtn].forEach(btn => {
    if (btn && user) {
      btn.innerText = `[${user.email.split('@')[0]}]`;
      btn.classList.add('text-green-400');
    }
  });
}

function showMessage(msg, colorClass) {
  const el = document.getElementById('login-message');
  if (el) {
    el.innerText = msg;
    el.className = `text - xs text - center min - h - [1rem] ${colorClass} `;
  }
}

function translateError(msg) {
  if (msg.includes('Invalid login credentials')) return 'Credenciais inválidas.';
  if (msg.includes('User already registered')) return 'Usuário já cadastrado.';
  return msg;
}
