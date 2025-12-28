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
  const btnPlay = document.getElementById('btn-media-play');

  // Load YouTube API immediately
  loadYouTubeAPI();

  if (btnPlay) {
    btnPlay.addEventListener('click', togglePlay);
  }
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
  const screen = document.getElementById('media-screen');
  const visualizer = document.getElementById('media-visualizer');
  const trackName = document.getElementById('media-track-name');
  const btnPlay = document.getElementById('btn-media-play');

  // Case 1: First Play (Initialize Player)
  if (!player) {
    if (!isAPILoaded) {
      console.warn("YouTube API not loaded yet");
      return;
    }

    // Update UI state
    if (visualizer) visualizer.style.display = 'none';
    if (trackName) trackName.innerText = "YOUTUBE_STREAM.exe";

    // Create container div for player if needed
    screen.innerHTML = '<div id="yt-player-placeholder"></div>';

    player = new YT.Player('yt-player-placeholder', {
      height: '100%',
      width: '100%',
      videoId: DEFAULT_VIDEO_ID,
      playerVars: {
        'autoplay': 1,
        'controls': 0,
        'modestbranding': 1,
        'rel': 0,
        'showinfo': 0
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': (event) => onPlayerStateChange(event, btnPlay)
      }
    });
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

function onPlayerStateChange(event, btnElement) {
  if (event.data == YT.PlayerState.PLAYING) {
    isPlaying = true;
    updatePlayButton(true);
  } else if (event.data == YT.PlayerState.PAUSED || event.data == YT.PlayerState.ENDED) {
    isPlaying = false;
    updatePlayButton(false);
  }
}

function updatePlayButton(playing) {
  const btn = document.getElementById('btn-media-play');
  if (!btn) return;

  // Toggle Icon via Class (Phosphor Icons)
  if (playing) {
    btn.classList.remove('ph-play-circle');
    btn.classList.add('ph-pause-circle');
    btn.classList.add('text-purple-300'); // Highlight active state
  } else {
    btn.classList.remove('ph-pause-circle');
    btn.classList.add('ph-play-circle');
    btn.classList.remove('text-purple-300');
  }
}
