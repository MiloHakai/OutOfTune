let meowResetTimer = null;

function onNameClick(event) {
  playClick();

  const bio = document.getElementById('bio');
  const boop = document.getElementById('boop');
  const nameEl = document.getElementById('name');

  if (bio && boop) {
    bio.hidden = true;
    boop.hidden = false;
    boop.textContent = 'meow!';
  }

  if (nameEl) {
    nameEl.classList.remove('meow-bounce');
    void nameEl.offsetWidth; // trigger reflow for animation restart
    nameEl.classList.add('meow-bounce');
  }

  spawnFloatingMeow(event);

  if (meowResetTimer) {
    clearTimeout(meowResetTimer);
  }

  meowResetTimer = setTimeout(() => {
    if (bio && boop) {
      bio.hidden = false;
      boop.hidden = true;
    }
  }, 2500);
}

function spawnFloatingMeow(event) {
  const particle = document.createElement('div');
  particle.className = 'floating-meow';

  const variations = ['meow', 'meow~', 'meow!'];
  particle.textContent = variations[Math.floor(Math.random() * variations.length)];

  let x = event && typeof event.clientX === 'number' ? event.clientX : window.innerWidth / 2;
  let y = event && typeof event.clientY === 'number' ? event.clientY : window.innerHeight / 2;

  // Slight subtle offset
  x += (Math.random() - 0.5) * 20;
  y += (Math.random() - 0.5) * 10;

  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;

  document.body.appendChild(particle);

  particle.addEventListener('animationend', () => {
    particle.remove();
  });
}

function playClick() {
  const sfx = document.getElementById('click');
  if (!sfx) return;
  sfx.currentTime = 0;
  sfx.play().catch(() => {});
}

const bgm = document.getElementById('bgm');
if (bgm) bgm.volume = 0.18;

const click = document.getElementById('click');
if (click) click.volume = 0.3;

const splash = document.getElementById('splash');

splash?.addEventListener('click', () => {
  splash.classList.add('gone');
  bgm?.play().catch(() => {});
});
