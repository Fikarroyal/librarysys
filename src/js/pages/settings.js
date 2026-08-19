/* ---------------------------- MODUL: PENGATURAN ---------------------------- */
function initSettingsPage(){
  const s = getSettings();
  document.getElementById('setLibraryName').value = s.libraryName;
  document.getElementById('setAddress').value = s.address;
  document.getElementById('setEmail').value = s.email;
  document.getElementById('setPhone').value = s.phone;
  document.getElementById('setMaxLoanDays').value = s.maxLoanDays;
  document.getElementById('setFinePerDay').value = s.finePerDay;
  document.getElementById('setMaxBooks').value = s.maxBooksPerMember;
  document.getElementById('settingsForm').addEventListener('submit', function(e){
    e.preventDefault();
    const newSettings = {
      libraryName: document.getElementById('setLibraryName').value.trim(),
      address: document.getElementById('setAddress').value.trim(),
      email: document.getElementById('setEmail').value.trim(),
      phone: document.getElementById('setPhone').value.trim(),
      maxLoanDays: parseInt(document.getElementById('setMaxLoanDays').value),
      finePerDay: parseInt(document.getElementById('setFinePerDay').value),
      maxBooksPerMember: parseInt(document.getElementById('setMaxBooks').value)
    };
    setSettings(newSettings);
    showToast('Pengaturan berhasil disimpan.', 'success');
    logActivity('Pengaturan', 'Memperbarui pengaturan sistem perpustakaan.');
  });

  initProfileTab();
}

/* ---------------------------- SUB-MODUL: PROFIL SAYA ---------------------------- */
function initProfileTab(){
  const session = window.__SESSION__;
  if(!session) return;

  document.getElementById('profileNameInput').value = session.name || '';
  document.getElementById('profileEmailInput').value = session.email || '';

  const profileForm = document.getElementById('profileForm');
  const profileError = document.getElementById('profileError');
  profileForm.addEventListener('submit', async function(e){
    e.preventDefault();
    profileError.style.display = 'none';
    const name = document.getElementById('profileNameInput').value.trim();
    const email = document.getElementById('profileEmailInput').value.trim();
    if(!name || !email){
      profileError.innerHTML = `${icon('alert-triangle')}<span>Nama dan email wajib diisi.</span>`;
      profileError.style.display = 'flex';
      refreshIcons();
      return;
    }
    try{
      const res = await window.electronAPI.updateProfile({ id: session.id, name, email });
      if(res.success){
        AUTH.setSession(res.user);
        window.__SESSION__ = res.user;
        applySessionToChrome();
        showToast('Profil berhasil diperbarui.', 'success');
        logActivity('Profil Saya', 'Memperbarui informasi profil akun.');
      } else {
        profileError.innerHTML = `${icon('alert-triangle')}<span>${escapeHtml(res.message||'Gagal memperbarui profil.')}</span>`;
        profileError.style.display = 'flex';
        refreshIcons();
      }
    }catch(err){
      profileError.innerHTML = `${icon('alert-triangle')}<span>Terjadi kesalahan: ${escapeHtml(err.message)}</span>`;
      profileError.style.display = 'flex';
      refreshIcons();
    }
  });

  const passwordForm = document.getElementById('passwordForm');
  const passwordError = document.getElementById('passwordError');
  passwordForm.addEventListener('submit', async function(e){
    e.preventDefault();
    passwordError.style.display = 'none';
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if(newPassword.length < 6){
      passwordError.innerHTML = `${icon('alert-triangle')}<span>Kata sandi baru minimal 6 karakter.</span>`;
      passwordError.style.display = 'flex'; refreshIcons(); return;
    }
    if(newPassword !== confirmNewPassword){
      passwordError.innerHTML = `${icon('alert-triangle')}<span>Konfirmasi kata sandi baru tidak cocok.</span>`;
      passwordError.style.display = 'flex'; refreshIcons(); return;
    }
    try{
      const res = await window.electronAPI.changePassword({ id: session.id, currentPassword, newPassword });
      if(res.success){
        showToast('Kata sandi berhasil diubah.', 'success');
        logActivity('Profil Saya', 'Mengubah kata sandi akun.');
        passwordForm.reset();
      } else {
        passwordError.innerHTML = `${icon('alert-triangle')}<span>${escapeHtml(res.message||'Gagal mengubah kata sandi.')}</span>`;
        passwordError.style.display = 'flex';
        refreshIcons();
      }
    }catch(err){
      passwordError.innerHTML = `${icon('alert-triangle')}<span>Terjadi kesalahan: ${escapeHtml(err.message)}</span>`;
      passwordError.style.display = 'flex';
      refreshIcons();
    }
  });
}

