// Changing
const CONFIG = {
  streamUrl: 'http://217.154.126.21:8000/live.flac',
  statusUrl: 'http://217.154.126.21:8080/nowplaying',
  mount: '/live.flac',
  recentTitlesLimit: 12,
  metadataPollMs: 10000
};

// --- ELEMENTI DOM ---
const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const volumeSlider = document.getElementById('volumeSlider');
const songTitle = document.getElementById('songTitle');
const songSubTitle = document.getElementById('songSubTitle');
const connectionText = document.getElementById('connectionText');
const liveDot = document.getElementById('liveDot');
const listenerCountText = document.getElementById('listenerCountText');
const queueContainer = document.getElementById('queueContainer');
const copyArea = document.getElementById('copyArea');
const gameMenu = document.getElementById('gameMenu');
const miniControls = document.getElementById('miniControls');

let audioContext, sourceNode, analyser, dataArray, bufferLength;
let isPlaying = false;
let recentTitles = [];
let lastTitle = '';
let metaInterval;

audio.src = CONFIG.streamUrl;
audio.volume = volumeSlider.value / 100;

// --- AUDIO & ANALYSER ---
function initAudioContext() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  sourceNode = audioContext.createMediaElementSource(audio);
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 512; 
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  sourceNode.connect(analyser);
  analyser.connect(audioContext.destination);
}

// --- CONTROLLI ---
playBtn.addEventListener('click', async () => {
  try {
    if (!audioContext) {
      initAudioContext();
      initVisualizer();
    }
    if (audioContext.state === 'suspended') await audioContext.resume();
    await audio.play();
    fetchStatus();
    if(!metaInterval) metaInterval = setInterval(fetchStatus, CONFIG.metadataPollMs);
  } catch (err) {
    console.error('Playback error:', err);
    setConnectionState(false, 'Blocked');
  }
});

pauseBtn.addEventListener('click', () => {
  audio.pause();
});

volumeSlider.addEventListener('input', () => {
  audio.volume = volumeSlider.value / 100;
});

// --- STATI AUDIO ---
function setConnectionState(online, text) {
  if(online) {
    liveDot.classList.add('online');
    connectionText.textContent = text || 'Connected';
    connectionText.style.color = 'var(--text-white)';
  } else {
    liveDot.classList.remove('online');
    connectionText.textContent = text || 'Disconnected';
    connectionText.style.color = 'var(--text-main)';
  }
}

audio.addEventListener('play', () => {
  isPlaying = true;
  setConnectionState(true, 'Connected');
  // Hide main menu, show mini controls
  gameMenu.classList.add('hidden');
  miniControls.classList.add('visible');
});

audio.addEventListener('pause', () => {
  isPlaying = false;
  setConnectionState(false, 'Disconnected');
  // Show main menu, hide mini controls
  gameMenu.classList.remove('hidden');
  miniControls.classList.remove('visible');
});

// --- METADATI ---
function parseTitle(raw) {
  if (!raw || typeof raw !== 'string') return { artist: '', song: 'Unknown Track' };
  const title = raw.trim();
  const bracketArtist = title.match(/^\s*\[([^\]]+)\]\s*(.+)$/u);
  if (bracketArtist) return { artist: bracketArtist[1].trim(), song: bracketArtist[2].trim() };
  const dashed = title.split(' - ');
  if (dashed.length >= 2) return { artist: dashed[0].trim(), song: dashed.slice(1).join(' - ').trim() };
  return { artist: '', song: title };
}

function updateNowPlaying(rawTitle) {
  const cleanTitle = (rawTitle || 'Unknown Track').trim();
  const parsed = parseTitle(cleanTitle);
  
  songTitle.textContent = parsed.song;
  songSubTitle.textContent = parsed.artist || 'Yume 2kki OST';

  if (cleanTitle && cleanTitle !== lastTitle) {
    lastTitle = cleanTitle;
    recentTitles.unshift(cleanTitle);
    recentTitles = Array.from(new Set(recentTitles)).slice(0, CONFIG.recentTitlesLimit);
    renderQueue();
  }
}

function renderQueue() {
  if (!recentTitles.length) return;
  queueContainer.innerHTML = recentTitles.map((title, index) => {
    const parsed = parseTitle(title);
    return `
      <div class="queue-item ${index === 0 ? 'current' : ''}">
        <div>${escapeHtml(parsed.song)}</div>
        <div class="q-artist">${escapeHtml(parsed.artist || 'Yume 2kki OST')}</div>
      </div>
    `;
  }).join('');
}

async function fetchStatus() {
  try {
    const response = await fetch(CONFIG.statusUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    
    let source = data.icestats?.source;
    if (Array.isArray(source)) {
      source = source.find(item => item.listenurl?.endsWith(CONFIG.mount) || item.mount === CONFIG.mount) || source[0];
    }

    if (!source) throw new Error('Mount not found');

    const listeners = source.listeners ?? source.listener_peak ?? 0;
    const title = source.title || source.server_name || 'Yume 2kki - Radio';

    listenerCountText.textContent = `${listeners} Players Online`;
    updateNowPlaying(title);

  } catch (err) {
    console.error('Status fetch failed:', err);
  }
}

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// --- FUNZIONI UTILI ---
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
  
  event.target.classList.add('active');
  document.getElementById('tab-' + tabId).classList.add('active');
}

async function copyStreamUrl() {
  try {
    await navigator.clipboard.writeText(CONFIG.streamUrl);
    const old = copyArea.textContent;
    copyArea.textContent = 'Copied to clipboard!';
    copyArea.style.color = '#fff';
    setTimeout(() => {
      copyArea.textContent = old;
      copyArea.style.color = '';
    }, 1500);
  } catch (e) {}
}

// --- CANVAS VISUALIZER ---
const canvas = document.getElementById('oscilloscope');
const ctx = canvas.getContext('2d');
let cw, ch;

function resizeCanvas() {
  cw = canvas.clientWidth;
  ch = canvas.clientHeight;
  canvas.width = cw;
  canvas.height = ch;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function initVisualizer() {
  function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, cw, ch);

    if (!isPlaying || !analyser) return;

    analyser.getByteTimeDomainData(dataArray);

    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(102, 204, 255, 0.4)'; // Cyan semitrasparente
    
    ctx.beginPath();
    const sliceWidth = cw * 1.0 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0; 
      
      // Onda meno aggressiva
      const waveHeight = (v - 1.0) * (ch / 8); 
      const y = (ch / 2) + waveHeight;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }
    ctx.lineTo(cw, ch / 2);
    ctx.stroke();
  }
  draw();
}
