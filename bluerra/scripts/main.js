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

function startBackgroundAudio() {
  audio.play().catch(error => {
    console.log('Audio autoplay prevented:', error);
    document.addEventListener('click', function () {
      if (audio.paused) {
        audio.play().catch(err => console.log('Audio play failed:', err));
      }
    }, { once: true });
  });
}

audio.volume = 0.15;
const clickSound = document.getElementById('clickSound');
clickSound.volume = 0.3;

window.addEventListener('load', () => {
  startBackgroundAudio();
  setTimeout(() => {
    const intro = document.getElementById('intro-screen');
    if (intro) {
      intro.setAttribute('aria-hidden', 'true');
    }
  }, 2300);
});

document.addEventListener('click', function () {
  if (audio.paused) {
    startBackgroundAudio();
  }
}, { once: true });
