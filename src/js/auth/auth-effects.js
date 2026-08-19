/* ---------------------------------------------------------------------------
   Efek 3D untuk halaman login/register:
   1. Parallax tilt pada seluruh scene kiri mengikuti gerak mouse.
   2. Tilt ringan pada kartu form kanan mengikuti posisi mouse di dalamnya.
   Keduanya murni CSS 3D transform (tanpa library eksternal / WebGL).
   --------------------------------------------------------------------------- */
(function () {
  function setupSceneParallax() {
    const scene = document.getElementById('authScene');
    const visual = document.querySelector('.auth-visual');
    if (!scene || !visual) return;
    visual.addEventListener('mousemove', (e) => {
      const rect = visual.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      scene.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
    });
    visual.addEventListener('mouseleave', () => {
      scene.style.transform = 'rotateY(0deg) rotateX(0deg)';
    });
  }

  function setupCardTilt() {
    const card = document.getElementById('authCard');
    if (!card) return;
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * 8;
      const rotateX = (0.5 - y) * 8;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
  }

  function setupPasswordToggle() {
    document.querySelectorAll('[data-toggle-password]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.togglePassword);
        if (!input) return;
        const showing = input.type === 'text';
        input.type = showing ? 'password' : 'text';
        btn.innerHTML = showing
          ? '<i data-lucide="eye"></i>'
          : '<i data-lucide="eye-off"></i>';
        if (window.lucide) lucide.createIcons({ attrs: { width: 17, height: 17, 'stroke-width': 2 } });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupSceneParallax();
    setupCardTilt();
    setupPasswordToggle();
    if (window.lucide) lucide.createIcons({ attrs: { width: 18, height: 18, 'stroke-width': 2 } });
  });
})();
