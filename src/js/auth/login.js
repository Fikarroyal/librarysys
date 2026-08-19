document.addEventListener('DOMContentLoaded', () => {
  try {
    const existing = JSON.parse(localStorage.getItem('librarysys_session'));
    if (existing && existing.email) {
      window.location.replace('index.html');
      return;
    }
  } catch (e) {}

  const form = document.getElementById('loginForm');
  const errorBox = document.getElementById('authError');
  const submitBtn = document.getElementById('loginSubmitBtn');

  function showError(message) {
    errorBox.innerHTML = '<i data-lucide="alert-triangle"></i><span>' + message + '</span>';
    errorBox.style.display = 'flex';
    errorBox.className = 'auth-alert';
    if (window.lucide) lucide.createIcons({ attrs: { width: 16, height: 16, 'stroke-width': 2 } });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      showError('Email dan kata sandi wajib diisi.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-lucide="loader-circle" class="spin"></i>Memproses...';
    if (window.lucide) lucide.createIcons({ attrs: { width: 17, height: 17, 'stroke-width': 2 } });

    try {
      if (!window.electronAPI) throw new Error('API desktop tidak tersedia.');
      const res = await window.electronAPI.login({ email, password });
      if (res.success) {
        localStorage.setItem('librarysys_session', JSON.stringify(res.user));
        window.location.href = 'index.html';
        return;
      } else {
        showError(res.message || 'Email atau kata sandi salah.');
      }
    } catch (err) {
      showError('Terjadi kesalahan sistem: ' + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i data-lucide="log-in"></i>Masuk';
      if (window.lucide) lucide.createIcons({ attrs: { width: 17, height: 17, 'stroke-width': 2 } });
    }
  });
});
