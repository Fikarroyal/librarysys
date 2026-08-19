const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./src/db/database');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#F7F8FC',
    show: false,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  Menu.setApplicationMenu(null);
  mainWindow.loadFile(path.join(__dirname, 'src', 'pages', 'login.html'));

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(async () => {
  await db.initDatabase(app.getPath('userData'));
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

/* ---------------------------- IPC: AUTENTIKASI ---------------------------- */
ipcMain.handle('auth:register', async (_event, payload) => {
  try {
    const name = String(payload?.name || '').trim();
    const email = String(payload?.email || '').trim().toLowerCase();
    const password = String(payload?.password || '');

    if (!name || !email || !password) {
      return { success: false, message: 'Semua kolom wajib diisi.' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, message: 'Format email tidak valid.' };
    }
    if (password.length < 6) {
      return { success: false, message: 'Kata sandi minimal 6 karakter.' };
    }
    if (db.findUserByEmail(email)) {
      return { success: false, message: 'Email sudah terdaftar. Silakan masuk.' };
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const user = db.createUser({ name, email, passwordHash });
    return { success: true, user: { id: user.id, name: user.name, email: user.email } };
  } catch (err) {
    return { success: false, message: 'Terjadi kesalahan pada server: ' + err.message };
  }
});

ipcMain.handle('auth:login', async (_event, payload) => {
  try {
    const email = String(payload?.email || '').trim().toLowerCase();
    const password = String(payload?.password || '');

    const user = db.findUserByEmail(email);
    if (!user) return { success: false, message: 'Email atau kata sandi salah.' };

    const match = bcrypt.compareSync(password, user.password_hash);
    if (!match) return { success: false, message: 'Email atau kata sandi salah.' };

    return { success: true, user: { id: user.id, name: user.name, email: user.email } };
  } catch (err) {
    return { success: false, message: 'Terjadi kesalahan pada server: ' + err.message };
  }
});

ipcMain.handle('app:version', () => app.getVersion());

/* ---------------------------- IPC: PROFIL SAYA ---------------------------- */
ipcMain.handle('auth:updateProfile', async (_event, payload) => {
  try {
    const id = Number(payload?.id);
    const name = String(payload?.name || '').trim();
    const email = String(payload?.email || '').trim().toLowerCase();

    if (!id) return { success: false, message: 'Sesi tidak valid, silakan masuk kembali.' };
    if (!name || !email) return { success: false, message: 'Nama dan email wajib diisi.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, message: 'Format email tidak valid.' };
    }

    const existing = db.findUserByEmail(email);
    if (existing && Number(existing.id) !== id) {
      return { success: false, message: 'Email sudah digunakan oleh akun lain.' };
    }

    const user = db.updateUserProfile(id, { name, email });
    return { success: true, user: { id: user.id, name: user.name, email: user.email } };
  } catch (err) {
    return { success: false, message: 'Terjadi kesalahan pada server: ' + err.message };
  }
});

ipcMain.handle('auth:changePassword', async (_event, payload) => {
  try {
    const id = Number(payload?.id);
    const currentPassword = String(payload?.currentPassword || '');
    const newPassword = String(payload?.newPassword || '');

    if (!id) return { success: false, message: 'Sesi tidak valid, silakan masuk kembali.' };
    if (newPassword.length < 6) return { success: false, message: 'Kata sandi baru minimal 6 karakter.' };

    const user = db.findUserById(id);
    if (!user) return { success: false, message: 'Akun tidak ditemukan.' };

    const match = bcrypt.compareSync(currentPassword, user.password_hash);
    if (!match) return { success: false, message: 'Kata sandi saat ini salah.' };

    const newHash = bcrypt.hashSync(newPassword, 10);
    db.updateUserPassword(id, newHash);
    return { success: true };
  } catch (err) {
    return { success: false, message: 'Terjadi kesalahan pada server: ' + err.message };
  }
});
