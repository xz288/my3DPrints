console.log("3D Prints Store Loaded");

// Handle Intro Animation cleanup if needed (CSS handles most of it)
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('intro-overlay');
  if (overlay) {
    overlay.addEventListener('animationend', () => {
      overlay.style.display = 'none';
    });
  }
});
