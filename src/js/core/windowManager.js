/**
 * Window Manager Module
 * Handles dragging, minimizing, restoring, and docking of windows.
 */

let zIndexCounter = 100;

export function initWindowManager() {
  // 1. Setup Dragging
  const windows = document.querySelectorAll('.drag-window');
  windows.forEach(win => {
    setupDrag(win);
    // Bring to front on click
    win.addEventListener('mousedown', () => bringToFront(win));
  });

  // 2. Setup Minimize Buttons
  document.querySelectorAll('.win-minimize-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent drag start
      const targetId = btn.dataset.target;
      const title = btn.dataset.title;
      minimizeWindow(targetId, title);
    });
  });
}

function bringToFront(el) {
  zIndexCounter++;
  el.style.zIndex = zIndexCounter;
}

function setupDrag(win) {
  // Removed mobile check to allow dragging on all devices

  const header = win.querySelector('.window-header');
  if (!header) return;

  // Disable dragging on mobile to respect the vertical layout
  if (window.innerWidth < 768) return;

  header.addEventListener('mousedown', (e) => {
    e.preventDefault();

    // Switch to absolute positioning when dragging starts to allow free movement
    // ensuring it calculates correctly from current position
    if (getComputedStyle(win).position !== 'absolute') {
      const rect = win.getBoundingClientRect();
      win.style.position = 'absolute';
      win.style.left = rect.left + 'px';
      win.style.top = rect.top + 'px';
      win.style.width = rect.width + 'px'; // Maintain width
      win.style.margin = '0'; // Remove margins that might affect position
    }

    const startX = e.clientX;
    const startY = e.clientY;
    const rect = win.getBoundingClientRect();
    const offsetX = startX - rect.left;
    const offsetY = startY - rect.top;

    function mouseMove(e) {
      e.preventDefault();
      win.style.left = (e.pageX - offsetX) + 'px';
      win.style.top = (e.pageY - offsetY) + 'px';
    }

    function mouseUp() {
      document.removeEventListener('mousemove', mouseMove);
      document.removeEventListener('mouseup', mouseUp);
    }

    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);
  });
}

function minimizeWindow(id, title) {
  const win = document.getElementById(id);
  if (!win) return;

  win.style.display = 'none';
  addToDock(id, title);
}

function restoreWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;

  win.style.display = 'flex';
  bringToFront(win);
  removeFromDock(id);
}

function addToDock(id, title) {
  const dock = document.getElementById('minimized-dock');
  if (!dock) return;
  if (document.getElementById(`dock-btn-${id}`)) return; // already docked

  const btn = document.createElement('button');
  btn.id = `dock-btn-${id}`;
  btn.className = 'min-btn';
  btn.innerHTML = `<i class="ph-bold ph-caret-up"></i> ${title}`;
  btn.onclick = () => restoreWindow(id);

  dock.appendChild(btn);
}

function removeFromDock(id) {
  const btn = document.getElementById(`dock-btn-${id}`);
  if (btn) btn.remove();
}
