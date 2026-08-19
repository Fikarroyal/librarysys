/* ---------------------------- SEED DATA 30 FITUR TAMBAHAN ---------------------------- */
function seedOnce(key, factory){ if(DB.get(key) === null) DB.set(key, factory()); }

function seedExtra(){
  seedOnce('library_categories', ()=>[
    {id:'KAT-001', name:'Fiksi', description:'Karya sastra imajinatif seperti novel dan cerpen.'},
    {id:'KAT-002', name:'Non-Fiksi', description:'Buku berbasis fakta, esai, dan pengembangan diri.'},
    {id:'KAT-003', name:'Teknologi', description:'Pemrograman, rekayasa perangkat lunak, dan IT.'},
    {id:'KAT-004', name:'Sains', description:'Fisika, biologi, astronomi, dan ilmu pengetahuan alam.'},
    {id:'KAT-005', name:'Sejarah', description:'Peristiwa dan catatan sejarah dunia maupun lokal.'},
    {id:'KAT-006', name:'Biografi', description:'Kisah hidup tokoh terkenal.'},
    {id:'KAT-007', name:'Ekonomi', description:'Ilmu ekonomi, bisnis, dan keuangan.'},
    {id:'KAT-008', name:'Agama', description:'Buku keagamaan dan spiritualitas.'},
    {id:'KAT-009', name:'Anak', description:'Bacaan untuk anak-anak dan remaja.'},
    {id:'KAT-010', name:'Pendidikan', description:'Buku ajar dan referensi akademik.'}
  ]);
  seedOnce('library_publishers', ()=>[
    {id:'PNB-001', name:'Bentang Pustaka', address:'Yogyakarta', phone:'0274-123456'},
    {id:'PNB-002', name:'Gramedia Pustaka Utama', address:'Jakarta', phone:'021-5330001'},
    {id:'PNB-003', name:'Pustaka Alvabet', address:'Tangerang Selatan', phone:'021-7455556'},
    {id:'PNB-004', name:'Kompas', address:'Jakarta', phone:'021-5347710'},
    {id:'PNB-005', name:'Elex Media Komputindo', address:'Jakarta', phone:'021-53696920'},
    {id:'PNB-006', name:'Salemba Empat', address:'Jakarta', phone:'021-7887688'}
  ]);
  seedOnce('library_shelves', ()=>[
    {id:'RAK-001', code:'A1', area:'Zona Fiksi', capacity:80},
    {id:'RAK-002', code:'B2', area:'Zona Non-Fiksi', capacity:60},
    {id:'RAK-003', code:'C3', area:'Zona Teknologi', capacity:70},
    {id:'RAK-004', code:'D1', area:'Zona Sains', capacity:40},
    {id:'RAK-005', code:'E1', area:'Zona Sejarah', capacity:35},
    {id:'RAK-006', code:'F1', area:'Zona Ekonomi', capacity:45},
    {id:'RAK-007', code:'G1', area:'Zona Biografi', capacity:30},
    {id:'RAK-008', code:'H1', area:'Zona Anak', capacity:50}
  ]);
  seedOnce('library_languages', ()=>[
    {id:'BHS-001', name:'Indonesia'}, {id:'BHS-002', name:'Inggris'},
    {id:'BHS-003', name:'Arab'}, {id:'BHS-004', name:'Mandarin'}
  ]);
  seedOnce('library_formats', ()=>[
    {id:'FMT-001', name:'Fisik (Cetak)', description:'Buku dalam bentuk fisik tercetak.'},
    {id:'FMT-002', name:'E-book', description:'Format digital PDF/EPUB.'},
    {id:'FMT-003', name:'Audiobook', description:'Buku dalam format audio.'}
  ]);
  seedOnce('library_tags', ()=>[
    {id:'TAG-001', name:'Best Seller', color:'#DC2626'}, {id:'TAG-002', name:'Rekomendasi', color:'#4F46E5'},
    {id:'TAG-003', name:'Klasik', color:'#D97706'}, {id:'TAG-004', name:'Terbaru', color:'#16A34A'},
    {id:'TAG-005', name:'Wajib Baca', color:'#7C3AED'}
  ]);
  seedOnce('library_vendors', ()=>[
    {id:'VDR-001', name:'CV Sumber Ilmu', contact:'0812-5550-0001', address:'Surakarta'},
    {id:'VDR-002', name:'PT Toko Buku Nusantara', contact:'0812-5550-0002', address:'Semarang'},
    {id:'VDR-003', name:'Gramedia Distributor', contact:'0812-5550-0003', address:'Jakarta'},
    {id:'VDR-004', name:'UD Ilmu Jaya', contact:'0812-5550-0004', address:'Surakarta'}
  ]);
  seedOnce('library_procurements', ()=>[
    {id:'PGD-001', vendorId:'VDR-001', title:'Laut Bercerita', qty:5, price:95000, date:daysAgo(60), status:'Diterima'},
    {id:'PGD-002', vendorId:'VDR-003', title:'Pulang', qty:3, price:98000, date:daysAgo(30), status:'Diterima'},
    {id:'PGD-003', vendorId:'VDR-002', title:'Algoritma Pemrograman Dasar', qty:4, price:120000, date:daysAgo(10), status:'Menunggu'},
    {id:'PGD-004', vendorId:'VDR-004', title:'Ensiklopedia Sains Anak', qty:6, price:150000, date:daysAgo(3), status:'Menunggu'}
  ]);
  seedOnce('library_reviews', ()=>[
    {id:'ULS-001', bookId:'BK-001', memberId:'AG-001', rating:5, comment:'Ceritanya sangat menyentuh dan memotivasi.', date:daysAgo(18)},
    {id:'ULS-002', bookId:'BK-004', memberId:'AG-004', rating:5, comment:'Wawasan sejarah manusia yang luas, wajib dibaca.', date:daysAgo(2)},
    {id:'ULS-003', bookId:'BK-007', memberId:'AG-001', rating:4, comment:'Praktis dan mudah diterapkan sehari-hari.', date:daysAgo(6)},
    {id:'ULS-004', bookId:'BK-008', memberId:'AG-002', rating:4, comment:'Kisah santri yang inspiratif.', date:daysAgo(40)},
    {id:'ULS-005', bookId:'BK-005', memberId:'AG-005', rating:5, comment:'Referensi wajib untuk programmer.', date:daysAgo(15)}
  ]);
  seedOnce('library_bookRequests', ()=>[
    {id:'PRM-001', memberId:'AG-002', title:'Cantik Itu Luka', author:'Eka Kurniawan', reason:'Direkomendasikan dosen sastra.', status:'Menunggu', date:daysAgo(5)},
    {id:'PRM-002', memberId:'AG-005', title:'The Pragmatic Programmer', author:'David Thomas', reason:'Referensi tugas akhir.', status:'Disetujui', date:daysAgo(12)},
    {id:'PRM-003', memberId:'AG-008', title:'Bumi', author:'Tere Liye', reason:'Melanjutkan seri novel.', status:'Menunggu', date:daysAgo(1)},
    {id:'PRM-004', memberId:'AG-003', title:'Sejarah Peradaban Islam', author:'Ahmad Al-Usairy', reason:'Bahan diskusi kajian.', status:'Ditolak', date:daysAgo(20)}
  ]);
  seedOnce('library_donations', ()=>[
    {id:'DNS-001', donorName:'Bapak Slamet Riyadi', donorContact:'0812-7770-0001', title:'Kumpulan Puisi Chairil Anwar', author:'Chairil Anwar', qty:2, condition:'Baik', date:daysAgo(45), status:'Diterima'},
    {id:'DNS-002', donorName:'Alumni Angkatan 2018', donorContact:'0812-7770-0002', title:'Kamus Besar Bahasa Indonesia', author:'Tim KBBI', qty:1, condition:'Baik', date:daysAgo(25), status:'Diterima'},
    {id:'DNS-003', donorName:'Ibu Ratna Wulan', donorContact:'0812-7770-0003', title:'Seri Ensiklopedia Anak', author:'Tim Penulis', qty:5, condition:'Cukup Baik', date:daysAgo(4), status:'Ditinjau'}
  ]);
  seedOnce('library_blacklist', ()=>[
    {id:'BLK-001', memberId:'AG-007', reason:'Terlambat mengembalikan buku lebih dari 3 kali.', startDate:daysAgo(60), endDate:daysFromNow(30), status:'Aktif'}
  ]);
  seedOnce('library_cards', ()=>[
    {id:'KRT-001', memberId:'AG-001', cardNumber:'LC-2025-0001', issueDate:daysAgo(410), expiryDate:daysFromNow(320), status:'Aktif'},
    {id:'KRT-002', memberId:'AG-002', cardNumber:'LC-2025-0002', issueDate:daysAgo(395), expiryDate:daysFromNow(335), status:'Aktif'},
    {id:'KRT-003', memberId:'AG-003', cardNumber:'LC-2025-0003', issueDate:daysAgo(380), expiryDate:daysFromNow(350), status:'Aktif'},
    {id:'KRT-004', memberId:'AG-007', cardNumber:'LC-2024-0007', issueDate:daysAgo(280), expiryDate:daysAgo(10), status:'Kedaluwarsa'},
    {id:'KRT-005', memberId:'AG-008', cardNumber:'LC-2025-0008', issueDate:daysAgo(250), expiryDate:daysFromNow(480), status:'Aktif'}
  ]);
  seedOnce('library_membershipTypes', ()=>[
    {id:'JKA-001', name:'Umum', maxLoanDays:14, maxBooks:3, description:'Anggota masyarakat umum.'},
    {id:'JKA-002', name:'Mahasiswa', maxLoanDays:21, maxBooks:5, description:'Mahasiswa aktif perguruan tinggi mitra.'},
    {id:'JKA-003', name:'Pelajar', maxLoanDays:10, maxBooks:2, description:'Pelajar SD/SMP/SMA.'},
    {id:'JKA-004', name:'Dosen/Staf Pengajar', maxLoanDays:30, maxBooks:8, description:'Tenaga pendidik dan staf akademik.'}
  ]);
  seedOnce('library_departments', ()=>[
    {id:'JRS-001', name:'Teknik Informatika', description:'Program studi teknik informatika.'},
    {id:'JRS-002', name:'Manajemen', description:'Program studi manajemen bisnis.'},
    {id:'JRS-003', name:'Sastra Indonesia', description:'Program studi bahasa dan sastra.'},
    {id:'JRS-004', name:'Pendidikan Matematika', description:'Program studi pendidikan matematika.'}
  ]);
  seedOnce('library_reservations', ()=>[
    {id:'RSV-001', bookId:'BK-001', memberId:'AG-003', reserveDate:daysAgo(2), status:'Menunggu'},
    {id:'RSV-002', bookId:'BK-013', memberId:'AG-006', reserveDate:daysAgo(5), status:'Menunggu'},
    {id:'RSV-003', bookId:'BK-003', memberId:'AG-009', reserveDate:daysAgo(1), status:'Siap Diambil'}
  ]);
  seedOnce('library_extensions', ()=>[
    {id:'PPJ-001', loanId:'PJ-002', requestDate:daysAgo(1), newDueDate:daysFromNow(16), status:'Menunggu', reason:'Masih membutuhkan referensi untuk tugas.'},
    {id:'PPJ-002', loanId:'PJ-004', requestDate:daysAgo(2), newDueDate:daysFromNow(18), status:'Disetujui', reason:'Belum selesai membaca.'}
  ]);
  seedOnce('library_finePayments', ()=>[
    {id:'BYR-001', loanId:'PJ-008', amount:2000, paymentDate:daysAgo(15), method:'Tunai'},
    {id:'BYR-002', loanId:'PJ-010', amount:12000, paymentDate:daysAgo(20), method:'QRIS'}
  ]);
  seedOnce('library_damageReports', ()=>[
    {id:'KRS-001', bookId:'BK-012', type:'Rusak', reporterMemberId:'AG-005', date:daysAgo(35), description:'Sampul sobek dan beberapa halaman lepas.', status:'Ditinjau'},
    {id:'KRS-002', bookId:'BK-013', type:'Hilang', reporterMemberId:'AG-006', date:daysAgo(50), description:'Buku tidak dikembalikan dan dinyatakan hilang oleh peminjam.', status:'Ditinjau'}
  ]);
  seedOnce('library_stockOpname', ()=>[
    {id:'OPN-001', bookId:'BK-011', systemStock:5, actualStock:5, date:daysAgo(14), note:'Sesuai catatan sistem.', officer:'Admin Perpus'},
    {id:'OPN-002', bookId:'BK-014', systemStock:3, actualStock:2, date:daysAgo(14), note:'Selisih 1 unit, kemungkinan belum tercatat saat peminjaman manual.', officer:'Admin Perpus'},
    {id:'OPN-003', bookId:'BK-015', systemStock:6, actualStock:6, date:daysAgo(14), note:'Sesuai catatan sistem.', officer:'Admin Perpus'}
  ]);
  seedOnce('library_events', ()=>[
    {id:'EVT-001', title:'Bedah Buku "Sapiens"', date:daysFromNow(10), location:'Aula Perpustakaan', description:'Diskusi bersama komunitas baca membahas buku Sapiens.'},
    {id:'EVT-002', title:'Lomba Membaca Cepat', date:daysFromNow(20), location:'Ruang Baca Utama', description:'Kompetisi membaca cepat untuk anggota pelajar.'},
    {id:'EVT-003', title:'Workshop Menulis Kreatif', date:daysFromNow(30), location:'Ruang Diskusi 1', description:'Pelatihan menulis fiksi bersama penulis lokal.'}
  ]);
  seedOnce('library_announcements', ()=>[
    {id:'PGM-001', title:'Perpanjangan Jam Operasional', content:'Perpustakaan kini buka hingga pukul 20.00 setiap hari kerja.', date:daysAgo(4), priority:'Sedang'},
    {id:'PGM-002', title:'Pemeliharaan Sistem', content:'Sistem akan mengalami maintenance singkat pada akhir pekan.', date:daysAgo(1), priority:'Tinggi'},
    {id:'PGM-003', title:'Koleksi Buku Baru', content:'Lebih dari 50 judul buku baru telah tersedia di rak Non-Fiksi.', date:daysAgo(8), priority:'Rendah'}
  ]);
  seedOnce('library_roomBookings', ()=>[
    {id:'BKG-001', memberId:'AG-004', room:'Ruang Diskusi 1', date:daysFromNow(2), timeStart:'10:00', timeEnd:'12:00', purpose:'Diskusi kelompok tugas akhir.'},
    {id:'BKG-002', memberId:'AG-009', room:'Ruang Baca Tenang', date:daysFromNow(4), timeStart:'13:00', timeEnd:'15:00', purpose:'Belajar mandiri.'},
    {id:'BKG-003', memberId:'AG-002', room:'Ruang Diskusi 2', date:daysFromNow(6), timeStart:'09:00', timeEnd:'11:00', purpose:'Rapat komunitas baca.'}
  ]);
  seedOnce('library_faqs', ()=>[
    {id:'FAQ-001', question:'Bagaimana cara mendaftar sebagai anggota?', answer:'Kunjungi meja layanan dengan membawa kartu identitas untuk didaftarkan oleh petugas.', category:'Keanggotaan'},
    {id:'FAQ-002', question:'Berapa lama durasi maksimal peminjaman?', answer:'Durasi standar 14 hari, dapat berbeda sesuai jenis keanggotaan.', category:'Peminjaman'},
    {id:'FAQ-003', question:'Bagaimana jika buku dikembalikan terlambat?', answer:'Akan dikenakan denda sesuai jumlah hari keterlambatan dikali tarif per hari.', category:'Denda'},
    {id:'FAQ-004', question:'Apakah bisa memesan buku yang sedang dipinjam?', answer:'Bisa, gunakan fitur Reservasi Buku pada menu Peminjaman.', category:'Reservasi'},
    {id:'FAQ-005', question:'Bagaimana cara mengajukan perpanjangan pinjam?', answer:'Ajukan melalui fitur Perpanjangan Peminjaman sebelum tanggal jatuh tempo.', category:'Peminjaman'}
  ]);
  seedOnce('library_feedback', ()=>[
    {id:'FBK-001', memberName:'Rizky Pratama', type:'Saran', message:'Mohon ditambahkan lebih banyak buku teknologi terbaru.', date:daysAgo(9), status:'Ditinjau'},
    {id:'FBK-002', memberName:'Putri Ayu Wulandari', type:'Kritik', message:'Ruang baca kadang terlalu ramai saat siang hari.', date:daysAgo(3), status:'Menunggu'},
    {id:'FBK-003', memberName:'Fajar Nugroho', type:'Saran', message:'Perlu jam operasional yang lebih panjang di akhir pekan.', date:daysAgo(15), status:'Selesai'}
  ]);
  seedOnce('library_visits', ()=>[
    {id:'KJG-001', visitorName:'Ahmad Fadillah', memberId:'AG-001', purpose:'Meminjam buku', checkIn:daysAgo(0)+'T08:30', checkOut:daysAgo(0)+'T09:15'},
    {id:'KJG-002', visitorName:'Tamu Umum - Rina', memberId:null, purpose:'Membaca di tempat', checkIn:daysAgo(1)+'T10:00', checkOut:daysAgo(1)+'T12:00'},
    {id:'KJG-003', visitorName:'Dewi Lestari', memberId:'AG-004', purpose:'Mengembalikan buku', checkIn:daysAgo(2)+'T14:00', checkOut:daysAgo(2)+'T14:20'},
    {id:'KJG-004', visitorName:'Tamu Umum - Joko', memberId:null, purpose:'Riset tugas kuliah', checkIn:daysAgo(3)+'T09:00', checkOut:daysAgo(3)+'T11:30'}
  ]);
  seedOnce('library_roles', ()=>[
    {id:'ROL-001', name:'Administrator', permissions:'Akses penuh ke seluruh modul sistem.', level:1},
    {id:'ROL-002', name:'Pustakawan', permissions:'Kelola buku, anggota, peminjaman, dan pengembalian.', level:2},
    {id:'ROL-003', name:'Operator', permissions:'Input data peminjaman dan pengembalian saja.', level:3}
  ]);
  seedOnce('library_staff', ()=>[
    {id:'STF-001', name:'Admin Perpus', username:'admin', email:'admin@perpusnusantara.id', roleId:'ROL-001', status:'Aktif'},
    {id:'STF-002', name:'Sri Wahyuni', username:'sri.w', email:'sri.wahyuni@perpusnusantara.id', roleId:'ROL-002', status:'Aktif'},
    {id:'STF-003', name:'Bagas Saputra', username:'bagas.s', email:'bagas.saputra@perpusnusantara.id', roleId:'ROL-003', status:'Nonaktif'}
  ]);
  seedOnce('library_backups', ()=>[
    {id:'BCK-001', label:'Backup Awal Bulan', date:daysAgo(20), note:'Backup rutin data buku dan anggota.'},
    {id:'BCK-002', label:'Backup Sebelum Migrasi', date:daysAgo(5), note:'Backup sebelum penambahan fitur baru.'}
  ]);
  seedOnce('library_activitylog', ()=>[
    {id:'LOG-001', action:'Sistem', description:'Data awal LibrarySys berhasil dimuat.', timestamp:new Date(Date.now()-1000*60*60*24*20).toISOString(), actor:'Sistem'},
    {id:'LOG-002', action:'Peminjaman', description:'Transaksi peminjaman awal tercatat di sistem.', timestamp:new Date(Date.now()-1000*60*60*24*18).toISOString(), actor:'Admin Perpus'},
    {id:'LOG-003', action:'Anggota', description:'Data anggota awal diimpor ke sistem.', timestamp:new Date(Date.now()-1000*60*60*24*15).toISOString(), actor:'Admin Perpus'}
  ]);
}
seedExtra();

