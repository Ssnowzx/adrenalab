
import { supabase } from '../core/supabaseClient.js';

export function initAuth() {
  const loginWin = document.getElementById('win-login');
  const loginBtn = document.getElementById('nav-btn-login');
  const closeBtn = document.getElementById('close-login-btn');
  const form = document.getElementById('login-form');
  const msgEl = document.getElementById('login-message');
  const linkSignup = document.getElementById('link-signup');

  // 1. Toggle Login Window
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      // Reset state when opening
      if (loginWin.classList.contains('hidden')) {
        loginWin.classList.remove('hidden');
        loginWin.style.display = 'flex'; // Ensure flex layout
        // Bring to front
        // (Optional: integrate with windowManager bringToFront if accessible)
      } else {
        loginWin.classList.add('hidden');
        loginWin.style.display = 'none';
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      loginWin.classList.add('hidden');
      loginWin.style.display = 'none';
    });
  }

  // 2. Handle Login/Signup Form
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
              // Se a confirmação de email estiver desligada, já loga direto
              showMessage('Cadastro realizado! Logando...', 'text-green-400');
              setTimeout(() => {
                loginWin.classList.add('hidden');
                loginWin.style.display = 'none';
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
              loginWin.classList.add('hidden');
              loginWin.style.display = 'none';
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
  if (loginBtn && user) {
    loginBtn.innerText = `[${user.email.split('@')[0]}]`;
    loginBtn.classList.add('text-green-400');
    // Optional: Change click behavior to show profile or logout
  }
}

function showMessage(msg, colorClass) {
  const el = document.getElementById('login-message');
  if (el) {
    el.innerText = msg;
    el.className = `text-xs text-center min-h-[1rem] ${colorClass}`;
  }
}

function translateError(msg) {
  if (msg.includes('Invalid login credentials')) return 'Credenciais inválidas.';
  if (msg.includes('User already registered')) return 'Usuário já cadastrado.';
  return msg;
}
