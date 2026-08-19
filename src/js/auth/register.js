document.addEventListener('DOMContentLoaded', () => {
  try {
    const existing = JSON.parse(localStorage.getItem('librarysys_session'));
    if (existing && existing.email) {
      window.location.replace('index.html');
      return;
    }
  } catch (e) {}

  const form = document.getElementById('registerForm');
  const errorBox = document.getElementById('authError');
  const submitBtn = document.getElementById('registerSubmitBtn');

  function showError(message) {
    errorBox.innerHTML = '<i data-lucide="alert-triangle"></i><span>' + message + '</span>';
    errorBox.style.display = 'flex';
    errorBox.className = 'auth-alert';
    if (window.lucide) lucide.createIcons({ attrs: { width: 16, height: 16, 'stroke-width': 2 } });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    if (!name || !email || !password || !confirmPassword) {
      showError('Semua kolom wajib diisi.');
      return;
    }
    if (password.length < 6) {
      showError('Kata sandi minimal 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      showError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-lucide="loader-circle" class="spin"></i>Memproses...';
    if (window.lucide) lucide.createIcons({ attrs: { width: 17, height: 17, 'stroke-width': 2 } });

    try {
      if (!window.electronAPI) throw new Error('API desktop tidak tersedia.');
      const res = await window.electronAPI.register({ name, email, password });
      if (res.success) {
        localStorage.setItem('librarysys_session', JSON.stringify(res.user));
        window.location.href = 'index.html';
        return;
      } else {
        showError(res.message || 'Registrasi gagal.');
      }
    } catch (err) {
      showError('Terjadi kesalahan sistem: ' + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i data-lucide="user-plus"></i>Daftar';
      if (window.lucide) lucide.createIcons({ attrs: { width: 17, height: 17, 'stroke-width': 2 } });
    }
  });
});
