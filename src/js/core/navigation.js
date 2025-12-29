/**
 * Navigation Module
 * Handles switching between Desktop, Store, and Archive views.
 */

export function initNavigation() {
  // Bind Nav Buttons
  bind('nav-btn-home', showDesktop);
  bind('btn-home-logo', showDesktop);

  bind('nav-btn-store', showStore);
  bind('btn-open-full-store', showStore); // Button inside desktop preview
  bind('btn-open-full-store-desktop', showStore); // Distinct desktop button
  bind('btn-open-full-store-mobile', showStore); // Mobile feed button

  bind('nav-btn-archive', showArchive);

  // Bind Back Buttons
  bind('btn-back-desktop-store', showHome);
  bind('btn-back-desktop-archive', showHome);

  // Bind Mobile Menu
  bind('mobile-menu-toggle', () => toggleMobileMenu(true));
  bind('mobile-menu-close', () => toggleMobileMenu(false));

  // Bind Mobile Nav Items (also close menu on click)
  bind('mobile-nav-btn-home', () => { showHome(); toggleMobileMenu(false); });
  bind('mobile-nav-btn-store', () => { showStore(); toggleMobileMenu(false); });
  bind('mobile-nav-btn-archive', () => { showArchive(); toggleMobileMenu(false); });

  // Archive Playlist Interaction
  const playlistItems = document.querySelectorAll('.playlist-item');
  playlistItems.forEach(item => {
    item.addEventListener('click', () => {
      const videoId = item.dataset.video;
      if (videoId) loadYoutubeVideo(videoId);

      // Toggle active class
      playlistItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

export function toggleMobileMenu(show) {
  const menu = document.getElementById('mobile-menu-overlay');
  if (!menu) return;
  if (show) menu.classList.remove('hidden');
  else menu.classList.add('hidden');
}

function bind(id, handler) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', handler);
}

// Unified "Home" function that decides based on viewport
function showHome() {
  const isMobile = window.innerWidth < 768;
  if (isMobile) {
    setView({ mobile: true });
  } else {
    setView({ desktop: true, dock: true });
  }
}

// Kept for backward compat or explicit calls, but mostly delegates to showHome
function showDesktop() {
  showHome();
}

function showStore() {
  setView({ store: true });
}

function showArchive() {
  setView({ archive: true });
}

function setView({ desktop = false, mobile = false, store = false, archive = false, dock = false }) {
  toggle('desktop-area', desktop);
  toggle('mobile-dashboard', mobile); // New Mobile Feed
  toggle('minimized-dock', dock); // Dock only visible on Desktop
  toggle('full-store-page', store);
  toggle('full-archive-page', archive);
}

function toggle(id, show) {
  const el = document.getElementById(id);
  if (!el) return;

  if (show) {
    // Restore appropriate display type
    if (id === 'minimized-dock') el.style.display = 'flex';
    else if (id === 'mobile-dashboard') el.style.display = 'block'; // or flex/grid if defined in CSS, but block usually fine
    else el.style.display = 'block';

    // Remove 'hidden' class if present (Tailwind support)
    el.classList.remove('hidden');
  } else {
    el.style.display = 'none';
    if (!el.classList.contains('hidden')) el.classList.add('hidden'); // Sync with Tailwind
  }
}

function loadYoutubeVideo(videoId) {
  const player = document.getElementById('archive-player');
  if (player) {
    player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&theme=dark&color=white&modestbranding=1`;
  }
}
