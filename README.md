# LibrarySys Desktop

Sistem Informasi Perpustakaan — versi aplikasi desktop (Electron), dengan Login & Register, database SQLite lokal, dan seluruh 30+ fitur CRUD dari versi web sebelumnya.

**Cara membuat file `.exe`/`.app` sendiri: lihat [`CARA-BUILD-EXE.md`](./CARA-BUILD-EXE.md).**

## Fitur Utama

- **Aplikasi desktop asli** (Electron) — bisa di-build jadi `.exe` (Windows) dan `.app`/`.dmg` (Mac), dijalankan tanpa browser.
- **Login & Register** dengan panel visual animasi (ilustrasi buku terbuka dengan halaman yang bergoyang lembut, parallax mengikuti mouse, kartu-kartu ikon melayang).
- **Database sungguhan**: SQLite (via `sql.js`, WebAssembly — tanpa kompilasi native, aman di-build di OS apa pun) untuk akun pengguna, dengan password di-hash pakai `bcryptjs`.
- **Profil Saya** — tab khusus di halaman Pengaturan untuk mengelola nama, email, dan kata sandi akun yang sedang login, langsung terhubung ke database SQLite.
- **HTML, CSS, dan JS terpisah** — tidak ada kode inline. Struktur:
  ```
  src/
  ├── pages/        10 halaman aplikasi + login.html + register.html
  ├── css/           shared.css, auth.css, font lokal, vendor Bootstrap
  ├── js/
  │   ├── lib/        Bootstrap, Lucide, Chart.js (di-vendor lokal, offline-ready)
  │   ├── core/        util, database layer, seed data, generic CRUD engine, auth guard
  │   ├── auth/        logika login & register + efek animasi
  │   └── pages/        modul tiap halaman + folder init/ (kode inisialisasi tiap halaman)
  └── db/            database.js — lapisan SQLite (proses utama Electron)
  ```
- Semua library (Bootstrap, Lucide Icons, Chart.js, font Inter/Sora/JetBrains Mono/Bebas Neue) di-*vendor* secara lokal — aplikasi berfungsi penuh **tanpa koneksi internet**.

## Revisi Terbaru

- **Font angka statistik** diganti ke **Bebas Neue** (bold, khas, tanpa titik di dalam angka nol) untuk tampilan dashboard yang lebih modern.
  > Catatan: font "MRK Maston Pro" yang diminta sebelumnya ternyata font berbayar/komersial (dijual di MyFonts & Envato), sehingga tidak bisa dipasang secara legal. Bebas Neue dipilih sebagai alternatif gratis dengan karakter bold serupa.
- **Desain ilustrasi buku** di halaman Login/Register diganti total — dari kotak 3D CSS ke ilustrasi buku terbuka bergaya flat-design dengan halaman yang beranimasi bergoyang lembut (bukan replikasi aset pihak lain, melainkan ilustrasi orisinal dengan gaya serupa).
- Teks tanda hubung ganda (`--`) pada placeholder dropdown "Pilih Anggota" dan "Pilih Buku" di halaman Peminjaman sudah dihapus/dirapikan.
- Halaman Pengaturan → tab **Profil Saya** (baru) — kelola nama & email akun yang login, serta ubah kata sandi.
- Menu dropdown profil di topbar disederhanakan — "Profil Saya" dihapus karena sudah ada sebagai tab di halaman Pengaturan.
- Menu sidebar "Data Master" diganti nama jadi **"Data Lainnya"**, dengan ikon baru (bukan ikon database lagi).
- Jarak di bawah teks "SISTEM PERPUSTAKAAN" pada logo sidebar diperlebar.
- Jarak di bawah legenda warna pada chart Status Buku (Dashboard) diperlebar.
- Tab Backup & Riwayat Data dirapikan (tombol "Buat Snapshot Sekarang" dihapus).
- Semua kotak pencarian yang sebelumnya kepotong kini melebar mengikuti ruang yang tersedia.
- Footer sidebar: "LocalStorage" → "Local Storage".

## Menjalankan di Mode Pengembangan (Mac/Windows/Linux)

```bash
npm install
npm start
```

Aplikasi akan terbuka sebagai window desktop, dimulai dari halaman Login. Semua fitur di atas sudah saya uji end-to-end di Electron sungguhan sebelum diserahkan.

## Build ke `.exe` / `.app` / `.dmg`

Lihat panduan lengkap langkah demi langkah di **[`CARA-BUILD-EXE.md`](./CARA-BUILD-EXE.md)** — mencakup 3 cara: build otomatis via GitHub Actions (paling direkomendasikan), build langsung di Mac, dan build `.exe` dari Mac dengan Wine.

Ringkas:
```bash
npm run build:win    # installer .exe + versi portable .exe
npm run build:mac    # .dmg + .zip (Intel & Apple Silicon)
```

## Login / Register / Profil

- Buka aplikasi → halaman **Register** untuk buat akun baru (nama, email, password min. 6 karakter).
- Setelah daftar, otomatis masuk ke Dashboard.
- Data akun tersimpan permanen di database SQLite lokal (`librarysys.sqlite` di folder data aplikasi).
- Untuk mengubah nama, email, atau kata sandi akun yang sedang login: **Pengaturan → tab Profil Saya**.
- Logout tersedia lewat menu profil di pojok kanan atas topbar.

## Struktur Lengkap

```
librarysys-desktop/
├── main.js              proses utama Electron (window, IPC auth handlers)
├── preload.js            jembatan aman renderer ↔ main (contextBridge)
├── package.json          konfigurasi app + electron-builder
├── assets/               icon.png / icon.ico / icon.icns
├── CARA-BUILD-EXE.md     panduan build .exe/.app langkah demi langkah
├── .github/workflows/    CI build otomatis (lihat CARA-BUILD-EXE.md)
└── src/
    ├── db/database.js    lapisan SQLite (sql.js) — tabel users
    ├── pages/             semua file .html
    ├── css/               semua file .css + font lokal
    └── js/                semua file .js (core, auth, pages)
```

## Teknologi

- **Electron 31** — shell aplikasi desktop
- **SQLite (sql.js)** — database akun pengguna, WebAssembly, tanpa native module
- **bcryptjs** — hashing password
- **Bootstrap 5, Lucide Icons, Chart.js** — di-vendor lokal
- **Font Inter, Sora, JetBrains Mono, Bebas Neue** — di-vendor lokal (self-hosted, offline)
- Data operasional aplikasi (buku, anggota, peminjaman, dll — 30+ fitur CRUD) tetap memakai `localStorage` per jendela aplikasi.

## Author

Nama: [Nama Anda]
