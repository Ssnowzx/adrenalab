/**
 * MediaPlayer Molecule
 * Handles the logic for the desktop media player widget using YouTube IFrame API.
 */

// Config: Default video ID (Skate Tricks Compilation)
const DEFAULT_VIDEO_ID = '3VUvJVbtubs';

let player = null;
let isPlaying = false;
let isAPILoaded = false;

export function initMediaPlayer() {
  const btns = [
    document.getElementById('btn-media-play-desktop'),
    document.getElementById('btn-media-play-mobile')
  ];

  // Load YouTube API immediately
  loadYouTubeAPI();

  btns.forEach(btn => {
    if (btn) btn.addEventListener('click', togglePlay);
  });
}

function loadYouTubeAPI() {
  if (window.YT) {
    isAPILoaded = true;
    return;
  }

  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  window.onYouTubeIframeAPIReady = () => {
    isAPILoaded = true;
  };
}

function togglePlay() {
  const isMobile = window.innerWidth < 768;

  // Select elements based on view context
  let screenId = isMobile ? 'media-screen-mobile' : 'media-screen-desktop';
  let visualizerId = isMobile ? null : 'media-visualizer-desktop';
  let trackNameId = isMobile ? null : 'media-track-name-desktop'; // Mobile has hardcoded text for now or non-id

  const screen = document.getElementById(screenId);
  const visualizer = visualizerId ? document.getElementById(visualizerId) : null;
  const trackName = trackNameId ? document.getElementById(trackNameId) : null;

  // Case 1: First Play (Initialize Player)
  if (!player) {
    if (!isAPILoaded) {
      console.warn("YouTube API not loaded yet");
      return;
    }

    // Update Desktop UI state (if visible)
    if (visualizer) visualizer.style.display = 'none';
    if (trackName) trackName.innerText = "YOUTUBE_STREAM.exe";

    // Inject Player
    if (screen) {
      screen.innerHTML = '<div id="yt-player-placeholder"></div>';
      player = new YT.Player('yt-player-placeholder', {
        height: '100%',
        width: '100%',
        videoId: DEFAULT_VIDEO_ID,
        playerVars: {
          'autoplay': 1,
          'controls': 1, // Enable controls for mobile usability
          'modestbranding': 1,
          'rel': 0,
          'showinfo': 0
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': (event) => onPlayerStateChange(event)
        }
      });
    }
    return;
  }

  // Case 2: Toggle Existing Player
  if (isPlaying) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
}

function onPlayerReady(event) {
  isPlaying = true;
  updatePlayButton(true);
}

function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING) {
    isPlaying = true;
    updatePlayButton(true);
  } else if (event.data == YT.PlayerState.PAUSED || event.data == YT.PlayerState.ENDED) {
    isPlaying = false;
    updatePlayButton(false);
  }
}

function updatePlayButton(playing) {
  const deskBtn = document.getElementById('btn-media-play-desktop');
  const mobBtn = document.getElementById('btn-media-play-mobile');

  // Desktop Icon (<i> tag directly)
  if (deskBtn) {
    if (playing) {
      deskBtn.classList.replace('ph-play-circle', 'ph-pause-circle');
      deskBtn.classList.add('text-purple-300');
    } else {
      deskBtn.classList.replace('ph-pause-circle', 'ph-play-circle');
      deskBtn.classList.remove('text-purple-300');
    }
  }

  // Mobile Icon (<i> inside <button>)
  if (mobBtn) {
    const icon = mobBtn.querySelector('i');
    if (icon) {
      if (playing) {
        icon.classList.replace('ph-play', 'ph-pause');
      } else {
        icon.classList.replace('ph-pause', 'ph-play');
      }
    }
  }
}
