function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute("data-theme");
  html.setAttribute("data-theme", current === "dark" ? "light" : "dark");
}

// Click counter functionality
let clickCount = 0;
const clickCounter = document.getElementById('clickCounter');
const clickCountSpan = document.getElementById('clickCount');

// Function to play click sound and update counter
function playClickSound() {
  const clickSound = document.getElementById('clickSound');
  clickSound.currentTime = 0; // Reset to beginning in case it's already playing
  clickSound.play().catch(error => {
    console.log('Click sound could not be played:', error);
  });

  // Update click counter
  clickCount++;
  clickCountSpan.textContent = clickCount;

  // Show the counter after first click
  if (clickCount === 1) {
    clickCounter.style.display = 'block';
    setTimeout(() => {
      clickCounter.classList.add('show');
    }, 10);
  }
}

// Audio functionality for background music
const audio = document.getElementById('backgroundAudio');

// Function to start background audio
function startBackgroundAudio() {
  audio.play().catch(error => {
    console.log('Audio autoplay prevented:', error);
    // If autoplay fails, try again on next user interaction
    document.addEventListener('click', function () {
      if (audio.paused) {
        audio.play().catch(err => console.log('Audio play failed:', err));
      }
    }, {
      once: true
    });
  });
}

// Set audio volumes
audio.volume = 0.3; // Background music at 30%
const clickSound = document.getElementById('clickSound');
clickSound.volume = 0.5; // Click sound at 50%

// Start background music when page loads
window.addEventListener('load', () => {
  startBackgroundAudio();
});

// Fallback: start audio on first user interaction
document.addEventListener('click', function () {
  if (audio.paused) {
    startBackgroundAudio();
  }
}, {
  once: true
});
