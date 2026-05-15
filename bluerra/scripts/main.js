let nameClickCount = 0;
const maxClicks = 5;

function handleNameClick() {
  nameClickCount++;
  playClickSound();

  const descriptionEl = document.getElementById('description');
  const easterEggEl = document.getElementById('easter-egg-text');

  if (nameClickCount === 1) {
    descriptionEl.style.display = 'none';
    easterEggEl.style.display = 'block';
    easterEggEl.textContent = 'boop!';
    easterEggEl.classList.remove('warning');
  } else if (nameClickCount >= maxClicks) {
    easterEggEl.textContent = 'Okay buddy, that\'s enough!';
    easterEggEl.classList.add('warning');
  }

  setTimeout(() => {
    if (nameClickCount < maxClicks) {
      nameClickCount = 0;
      descriptionEl.style.display = 'block';
      easterEggEl.style.display = 'none';
      easterEggEl.classList.remove('warning');
    }
  }, 3000);
}

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute("data-theme");
  html.setAttribute("data-theme", current === "dark" ? "light" : "dark");
}

function playClickSound() {
  const clickSound = document.getElementById('clickSound');
  clickSound.currentTime = 0;
  clickSound.play().catch(error => {
    console.log('Click sound could not be played:', error);
  });
}

const audio = document.getElementById('backgroundAudio');
if (audio) {
  audio.volume = 0.15;
  audio.addEventListener('error', (e) => {
    console.error("Audio error details:", audio.error);
  });
}

const clickSound = document.getElementById('clickSound');
clickSound.volume = 0.3;

function startBackgroundAudio() {
  // Resume AudioContext if suspended (required by browsers after user gesture)
  if (window._audioCtx && window._audioCtx.state === 'suspended') {
    window._audioCtx.resume();
  }

  audio.play().then(() => {
    // Once playing, tell the globe to initialise its analyser
    if (typeof window._globeInitAnalyser === 'function') {
      window._globeInitAnalyser();
    }
  }).catch(error => {
    console.log('Audio autoplay prevented:', error);
  });
}

// Attempt autoplay on load; browsers will usually block this until a gesture
window.addEventListener('load', () => {
  startBackgroundAudio();

  setTimeout(() => {
    const intro = document.getElementById('intro-screen');
    if (intro) {
      intro.setAttribute('aria-hidden', 'true');
    }
  }, 2300);
});

// Retry on first user interaction anywhere on the page
document.addEventListener('click', function onFirstClick() {
  // Early creation/resume of context to satisfy browser policies
  if (typeof window.AudioContext !== 'undefined' || typeof window.webkitAudioContext !== 'undefined') {
    if (!window._audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      window._audioCtx = new AC();
    }
    if (window._audioCtx.state === 'suspended') {
      window._audioCtx.resume();
    }
  }

  if (audio && audio.paused) {
    startBackgroundAudio();
  }
  // Always try to init the globe analyser on first click too
  if (typeof window._globeInitAnalyser === 'function') {
    window._globeInitAnalyser();
  }
}, { once: true });