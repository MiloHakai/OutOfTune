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

const carouselForwardSound = document.getElementById('carouselForwardSound');
if (carouselForwardSound) carouselForwardSound.volume = 0.55;
const carouselBackSound = document.getElementById('carouselBackSound');
if (carouselBackSound) carouselBackSound.volume = 0.55;

function startBackgroundAudio() {
  if (!audio) return;
  // Resume AudioContext if suspended (required by browsers after user gesture)
  if (window._audioCtx && window._audioCtx.state === 'suspended') {
    window._audioCtx.resume();
  }

  audio.play().catch(error => {
    console.log('Audio autoplay prevented:', error);
  });
}

function dismissIntro() {
  const intro = document.getElementById('intro-screen');
  if (intro && !intro.classList.contains('hidden')) {
    intro.classList.add('hidden');
    intro.setAttribute('aria-hidden', 'true');
    // Reveal the background video with a smooth fade
    const video = document.getElementById('bg-video');
    if (video) video.classList.add('revealed');
  }
}

// First user interaction anywhere on the page
function onFirstInteraction() {
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

  dismissIntro();

  if (audio && audio.paused) {
    startBackgroundAudio();
  }
}

['pointerdown', 'touchstart', 'mousedown', 'keydown', 'click'].forEach(eventType => {
  document.addEventListener(eventType, onFirstInteraction, { once: true, capture: true });
});

// Attempt autoplay on load; browsers will usually block this until a gesture
window.addEventListener('load', () => {
  startBackgroundAudio();
  // Set slow playback rate for the background video
  const video = document.getElementById('bg-video');
  if (video) {
    video.playbackRate = 0.7;
  }
});

// --- TWITCH LIVE CHECKER ---
async function checkTwitchLive() {
  const channel = 'SaiaMantaray';
  const descriptionEl = document.getElementById('description');
  if (!descriptionEl) return;

  try {
    const response = await fetch(`https://decapi.me/twitch/uptime/${channel}`);
    if (response.ok) {
      const text = (await response.text()).trim().toLowerCase();
      const isOffline = text.includes('offline') || text.includes('not found') || text.includes('error');
      
      if (!isOffline && text.length > 0) {
        descriptionEl.innerHTML = `<a href="https://twitch.tv/${channel}" target="_blank" class="live-status-link"><span class="live-dot"></span> I'm currently live!</a>`;
      }
    }
  } catch (err) {
    console.log('Twitch live check failed:', err);
  }
}

// --- ICONS CAROUSEL FUNCTIONALITY ---
let currentIconIndex = 0;
let carouselRealCount = 0;
let carouselTransitioning = false;

function slideCarousel(direction) {
  if (carouselTransitioning) return;

  const track = document.getElementById('iconsTrack');
  if (!track) return;
  const itemWidth = 190;

  currentIconIndex += direction;
  track.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
  track.style.transform = `translateX(-${currentIconIndex * itemWidth}px)`;

  carouselTransitioning = true;
  setTimeout(() => {
    carouselTransitioning = false;
    // Silently snap: if in the clone zone, jump to the real equivalent
    if (currentIconIndex >= carouselRealCount) {
      currentIconIndex -= carouselRealCount;
      track.style.transition = 'none';
      track.style.transform = `translateX(-${currentIconIndex * itemWidth}px)`;
    } else if (currentIconIndex < 0) {
      currentIconIndex += carouselRealCount;
      track.style.transition = 'none';
      track.style.transform = `translateX(-${currentIconIndex * itemWidth}px)`;
    }
  }, 410);

  // Play directional SFX
  const sfxId = direction > 0 ? 'carouselForwardSound' : 'carouselBackSound';
  const sfx = document.getElementById(sfxId);
  if (sfx) {
    sfx.currentTime = 0;
    sfx.play().catch(() => {});
  }
}

// Touch swipe & initialization
document.addEventListener('DOMContentLoaded', () => {
  checkTwitchLive();

  // Clone items for seamless infinite loop
  const track = document.getElementById('iconsTrack');
  if (track) {
    const origItems = [...track.querySelectorAll('.carousel-item')];
    carouselRealCount = origItems.length;
    origItems.forEach(item => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  }

  const wrapper = document.getElementById('carouselWrapper');
  if (!wrapper) return;

  let startX = 0;
  let isSwiping = false;

  wrapper.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isSwiping = true;
  }, { passive: true });

  wrapper.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    isSwiping = false;
    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;

    if (Math.abs(diffX) > 30) {
      if (diffX > 0) {
        slideCarousel(1);
      } else {
        slideCarousel(-1);
      }
    }
  }, { passive: true });
});