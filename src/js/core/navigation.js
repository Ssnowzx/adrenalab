/**
 * Navigation Module
 * Handles switching between Desktop, Store, and Archive views.
 */

export function initNavigation() {
  // Bind Nav Buttons
  bind('nav-btn-home', showDesktop);
  bind('btn-home-logo', showDesktop);

  bind('nav-btn-store', showStore);
  bind('btn-open-full-store', showStore); // Button inside preview window

  bind('nav-btn-archive', showArchive);

  // Bind Back Buttons
  bind('btn-back-desktop-store', showDesktop);
  bind('btn-back-desktop-archive', showDesktop);

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

function bind(id, handler) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', handler);
}

function showDesktop() {
  setView({ desktop: true, dock: true });
}

function showStore() {
  setView({ store: true });
}

function showArchive() {
  setView({ archive: true });
}

function setView({ desktop = false, store = false, archive = false, dock = false }) {
  toggle('desktop-area', desktop);
  toggle('minimized-dock', dock); // Dock only visible on Desktop
  toggle('full-store-page', store);
  toggle('full-archive-page', archive);
}

function toggle(id, show) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = show ? (id === 'minimized-dock' ? 'flex' : 'block') : 'none';
}

function loadYoutubeVideo(videoId) {
  const player = document.getElementById('archive-player');
  if (player) {
    player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&theme=dark&color=white&modestbranding=1`;
  }
}
