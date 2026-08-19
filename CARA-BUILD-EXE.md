# Panduan Membuat File `.exe` Sendiri

Panduan ini menjelaskan langkah demi langkah cara membuat file `.exe` (Windows) dan `.app`/`.dmg` (Mac) dari project LibrarySys Desktop, langsung dari komputer Anda sendiri.

Ada 3 cara. Pilih salah satu sesuai kebutuhan:

- **Cara 1** — Paling gampang & paling andal: build lewat GitHub Actions (gratis, tidak perlu install apa-apa selain akun GitHub).
- **Cara 2** — Build langsung di Mac untuk hasil `.app`/`.dmg` (Mac).
- **Cara 3** — Build `.exe` langsung dari Mac (perlu install Wine tambahan).

---

## Persiapan (wajib untuk semua cara)

1. Install **Node.js** (versi 18 ke atas) dari [nodejs.org](https://nodejs.org) — pilih versi **LTS**. Setelah install, cek di Terminal:
   ```bash
   node -v
   npm -v
   ```
   Kalau muncul nomor versi, berarti sudah berhasil.

2. Buka Terminal, masuk ke folder project, lalu install seluruh dependency (cukup sekali saja):
   ```bash
   cd librarysys-final
   npm install
   ```
   Proses ini akan mengunduh Electron dan semua library yang dibutuhkan — ukurannya lumayan besar (±300–500MB), jadi butuh koneksi internet yang stabil. Tunggu sampai selesai (biasanya 1–5 menit).

3. Untuk memastikan semuanya berjalan normal sebelum di-build, coba jalankan dulu dalam mode pengembangan:
   ```bash
   npm start
   ```
   Aplikasi desktop akan terbuka. Kalau ini berhasil, lanjut ke cara build di bawah.

---

## Cara 1 — Build Otomatis via GitHub Actions (Direkomendasikan)

Ini cara paling andal karena `.exe` dan `.dmg` di-build langsung oleh mesin Windows/Mac asli milik GitHub — bukan hasil "simulasi" dari OS lain. Gratis untuk repository publik maupun privat (dengan kuota gratis bulanan yang cukup besar).

1. Buat akun GitHub kalau belum punya: [github.com](https://github.com)
2. Buat repository baru (bisa **Private** kalau tidak ingin publik), lalu upload seluruh isi folder `librarysys-final` ke repository tersebut. Cara termudah lewat Terminal:
   ```bash
   cd librarysys-final
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPO.git
   git push -u origin main
   ```
   Ganti `USERNAME` dan `NAMA-REPO` sesuai punya Anda. (Kalau belum pernah pakai Git, install dulu lewat `brew install git` di Terminal Mac.)
3. Buka repository tersebut di browser → klik tab **Actions** di bagian atas.
4. Akan muncul workflow bernama **"Build LibrarySys Desktop"** (file-nya sudah saya siapkan di `.github/workflows/build.yml`). Klik workflow itu, lalu klik tombol **"Run workflow"** di kanan atas → **Run workflow** lagi untuk konfirmasi.
5. Tunggu beberapa menit (biasanya 5–10 menit) sampai muncul tanda centang hijau ✅ di kedua job (`build-windows` dan `build-mac`).
6. Klik job yang sudah selesai → scroll ke bagian bawah halaman → ada bagian **Artifacts**. Di situ akan ada:
   - `LibrarySys-windows` — berisi file `.exe` (installer dan portable)
   - `LibrarySys-mac` — berisi file `.dmg` dan `.zip`
7. Klik untuk mengunduh, lalu ekstrak. File `.exe`/`.dmg` siap dipakai atau dibagikan.

---

## Cara 2 — Build Langsung di Mac (untuk `.app` / `.dmg`)

Karena Anda menjalankan ini di Mac, build untuk Mac akan berjalan mulus tanpa alat tambahan apa pun.

```bash
cd librarysys-final
npm run build:mac
```

Hasilnya akan muncul di folder `dist/`:
- `LibrarySys-1.0.0-mac.zip` — untuk Mac Intel
- `LibrarySys-1.0.0-arm64-mac.zip` — untuk Mac Apple Silicon (M1/M2/M3/M4)
- `.dmg` installer untuk masing-masing arsitektur

Kalau ingin build khusus salah satu arsitektur saja:
```bash
npm run build:mac -- --x64      # khusus Intel
npm run build:mac -- --arm64    # khusus Apple Silicon
```

---

## Cara 3 — Build `.exe` Langsung dari Mac (opsional, perlu Wine)

Electron-builder butuh **Wine** untuk menyisipkan ikon dan info versi ke dalam file `.exe` saat build dari Mac/Linux. Tanpa Wine, proses build Windows akan gagal di Mac.

1. Install Wine lewat Homebrew (kalau belum punya Homebrew, install dulu dari [brew.sh](https://brew.sh)):
   ```bash
   brew install --cask wine-stable
   ```
   Proses ini bisa memakan waktu cukup lama dan memakan ruang disk lumayan besar (500MB–1GB).

2. Setelah Wine terinstall, jalankan:
   ```bash
   cd librarysys-final
   npm run build:win
   ```

3. Hasilnya ada di folder `dist/`:
   - `LibrarySys Setup 1.0.0.exe` — installer (NSIS)
   - `LibrarySys 1.0.0.exe` — versi portable, tinggal dijalankan tanpa instalasi

**Kalau proses build gagal atau macet**, biasanya karena Wine belum terkonfigurasi dengan benar di Mac versi terbaru — di sinilah **Cara 1 (GitHub Actions)** jadi jauh lebih andal karena tidak bergantung pada Wine sama sekali.

---

## Troubleshooting Singkat

| Masalah | Solusi |
|---|---|
| `npm install` error / gagal di tengah jalan | Hapus folder `node_modules` dan file `package-lock.json`, lalu jalankan `npm install` lagi |
| `npm start` tidak membuka window apa pun | Pastikan Node.js versi 18+ (`node -v`), lalu ulangi `npm install` |
| Build `.exe` gagal dengan pesan terkait "wine" | Gunakan **Cara 1 (GitHub Actions)** — tidak butuh Wine sama sekali |
| Ingin ganti ikon aplikasi | Ganti file `assets/icon.png`, `assets/icon.ico`, dan `assets/icon.icns` dengan ikon baru (ukuran disarankan minimal 512×512px untuk `.png`) |
| Ingin ganti nama aplikasi / versi | Edit `"productName"` dan `"version"` di file `package.json` |

---

Kalau ada langkah yang error atau butuh dibantu lebih lanjut, kirim saja pesan errornya — saya bantu selesaikan.
