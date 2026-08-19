/* ---------------------------- LOOKUP HELPERS ---------------------------- */
function truncate(str,n){ str=String(str==null?'':str); return str.length>n ? str.slice(0,n-1)+'…' : str; }
function findVendor(id){ return (DB.get('library_vendors')||[]).find(x=>x.id===id); }
function findRole(id){ return (DB.get('library_roles')||[]).find(x=>x.id===id); }
function findLoanById(id){ return getLoans().find(x=>x.id===id); }
function bookOptions(){ return getBooks().map(b=>({value:b.id, label:b.title})); }
function memberOptions(){ return getMembers().map(m=>({value:m.id, label:m.name})); }
function activeLoanOptions(){ return getLoans().filter(l=>loanStatus(l)!=='Dikembalikan').map(l=>{ const b=findBook(l.bookId), m=findMember(l.memberId); return {value:l.id, label:`${l.id} — ${m?m.name:'-'} / ${b?b.title:'-'}`}; }); }
function fineLoanOptions(){ return getLoans().filter(l=>l.returnDate && l.fine>0).map(l=>{ const m=findMember(l.memberId); return {value:l.id, label:`${l.id} — ${m?m.name:'-'} (${formatRupiah(l.fine)})`}; }); }
function vendorOptions(){ return (DB.get('library_vendors')||[]).map(v=>({value:v.id, label:v.name})); }
function roleOptions(){ return (DB.get('library_roles')||[]).map(r=>({value:r.id, label:r.name})); }
function categoryOptions(){ return (DB.get('library_categories')||[]).map(c=>({value:c.name, label:c.name})); }

/* ---------------------------- 30 KONFIGURASI CRUD ---------------------------- */
const CONFIG_CATEGORIES = {
  key:'library_categories', idPrefix:'KAT', titleSingular:'Kategori Buku', searchFields:['name','description'],
  emptyIcon:'layers', emptyTitle:'Belum ada kategori', emptyMsg:'Tambahkan kategori buku untuk mengelompokkan koleksi.',
  columns:[
    {label:'Nama Kategori', render:i=>`<div class="icon-text">${icon(categoryIcon(i.name))}<span class="cell-title">${escapeHtml(i.name)}</span></div>`},
    {label:'Deskripsi', render:i=>`<span class="cell-sub">${escapeHtml(i.description||'-')}</span>`}
  ],
  fields:[
    {id:'name', label:'Nama Kategori', type:'text', col:12, required:true},
    {id:'description', label:'Deskripsi', type:'textarea', col:12}
  ],
  onBeforeDelete(item){ return getBooks().some(b=>b.category===item.name) ? 'Kategori masih digunakan oleh salah satu buku.' : true; }
};

const CONFIG_PUBLISHERS = {
  key:'library_publishers', idPrefix:'PNB', titleSingular:'Penerbit', searchFields:['name','address'],
  emptyIcon:'building-2', emptyTitle:'Belum ada penerbit', emptyMsg:'Tambahkan data penerbit buku.',
  columns:[
    {label:'Nama Penerbit', render:i=>`<span class="cell-title">${escapeHtml(i.name)}</span>`},
    {label:'Alamat', render:i=>`<span class="cell-sub">${escapeHtml(i.address||'-')}</span>`},
    {label:'Telepon', render:i=>escapeHtml(i.phone||'-')}
  ],
  fields:[
    {id:'name', label:'Nama Penerbit', type:'text', col:12, required:true},
    {id:'address', label:'Alamat', type:'text', col:6},
    {id:'phone', label:'Telepon', type:'text', col:6}
  ]
};

const CONFIG_SHELVES = {
  key:'library_shelves', idPrefix:'RAK', titleSingular:'Lokasi Rak', searchFields:['code','area'],
  emptyIcon:'map-pin', emptyTitle:'Belum ada lokasi rak', emptyMsg:'Tambahkan lokasi rak penyimpanan buku.',
  columns:[
    {label:'Kode Rak', render:i=>`<span class="mono cell-title">${escapeHtml(i.code)}</span>`},
    {label:'Area', render:i=>escapeHtml(i.area||'-')},
    {label:'Kapasitas', render:i=>`<span class="mono">${i.capacity ?? '-'}</span>`}
  ],
  fields:[
    {id:'code', label:'Kode Rak', type:'text', col:4, required:true},
    {id:'area', label:'Nama Area/Zona', type:'text', col:5, required:true},
    {id:'capacity', label:'Kapasitas', type:'number', col:3, min:0}
  ]
};

const CONFIG_LANGUAGES = {
  key:'library_languages', idPrefix:'BHS', titleSingular:'Bahasa Buku', searchFields:['name'],
  emptyIcon:'languages', emptyTitle:'Belum ada bahasa', emptyMsg:'Tambahkan bahasa buku yang tersedia.',
  columns:[ {label:'Nama Bahasa', render:i=>`<span class="icon-text">${icon('languages')}${escapeHtml(i.name)}</span>`} ],
  fields:[ {id:'name', label:'Nama Bahasa', type:'text', col:12, required:true} ]
};

const CONFIG_FORMATS = {
  key:'library_formats', idPrefix:'FMT', titleSingular:'Format Buku', searchFields:['name','description'],
  emptyIcon:'file-type', emptyTitle:'Belum ada format', emptyMsg:'Tambahkan format buku (fisik, e-book, dsb).',
  columns:[
    {label:'Nama Format', render:i=>`<span class="cell-title">${escapeHtml(i.name)}</span>`},
    {label:'Deskripsi', render:i=>`<span class="cell-sub">${escapeHtml(i.description||'-')}</span>`}
  ],
  fields:[
    {id:'name', label:'Nama Format', type:'text', col:12, required:true},
    {id:'description', label:'Deskripsi', type:'textarea', col:12}
  ]
};

const CONFIG_TAGS = {
  key:'library_tags', idPrefix:'TAG', titleSingular:'Tag/Label Buku', searchFields:['name'],
  emptyIcon:'tag', emptyTitle:'Belum ada tag', emptyMsg:'Tambahkan label untuk menandai buku tertentu.',
  columns:[
    {label:'Label', render:i=>`<span class="badge-soft" style="background:${escapeHtml(i.color||'#EEF2FF')}22;color:${escapeHtml(i.color||'#4F46E5')}">${icon('tag')}${escapeHtml(i.name)}</span>`},
    {label:'Warna', render:i=>`<span class="mono">${escapeHtml(i.color||'-')}</span>`}
  ],
  fields:[
    {id:'name', label:'Nama Label', type:'text', col:8, required:true},
    {id:'color', label:'Warna', type:'color', col:4, default:'#4F46E5'}
  ]
};

const CONFIG_VENDORS = {
  key:'library_vendors', idPrefix:'VDR', titleSingular:'Vendor/Supplier', searchFields:['name','address'],
  emptyIcon:'truck', emptyTitle:'Belum ada vendor', emptyMsg:'Tambahkan data vendor/supplier buku.',
  columns:[
    {label:'Nama Vendor', render:i=>`<span class="cell-title">${escapeHtml(i.name)}</span>`},
    {label:'Kontak', render:i=>escapeHtml(i.contact||'-')},
    {label:'Alamat', render:i=>`<span class="cell-sub">${escapeHtml(i.address||'-')}</span>`}
  ],
  fields:[
    {id:'name', label:'Nama Vendor', type:'text', col:12, required:true},
    {id:'contact', label:'Kontak', type:'text', col:6},
    {id:'address', label:'Alamat', type:'text', col:6}
  ]
};

const CONFIG_PROCUREMENTS = {
  key:'library_procurements', idPrefix:'PGD', titleSingular:'Pengadaan Buku', searchFields:['title'],
  emptyIcon:'shopping-cart', emptyTitle:'Belum ada pengadaan', emptyMsg:'Catat pengadaan buku baru dari vendor.',
  columns:[
    {label:'Judul Buku', render:i=>`<span class="cell-title">${escapeHtml(i.title)}</span>`},
    {label:'Vendor', render:i=>escapeHtml((findVendor(i.vendorId)||{}).name||'-')},
    {label:'Qty', render:i=>`<span class="mono">${i.qty}</span>`},
    {label:'Harga', render:i=>formatRupiah(i.price)},
    {label:'Status', render:i=>genericStatusBadge(i.status)}
  ],
  fields:[
    {id:'title', label:'Judul Buku', type:'text', col:6, required:true},
    {id:'vendorId', label:'Vendor', type:'select', col:6, required:true, options:vendorOptions},
    {id:'qty', label:'Jumlah', type:'number', col:4, required:true, min:1},
    {id:'price', label:'Harga Satuan (Rp)', type:'number', col:4, required:true, min:0},
    {id:'date', label:'Tanggal', type:'date', col:4, required:true},
    {id:'status', label:'Status', type:'select', col:12, options:[{value:'Menunggu',label:'Menunggu'},{value:'Diterima',label:'Diterima'},{value:'Dibatalkan',label:'Dibatalkan'}], default:'Menunggu'}
  ]
};

const CONFIG_REVIEWS = {
  key:'library_reviews', idPrefix:'ULS', titleSingular:'Ulasan & Rating', searchFields:['comment'],
  emptyIcon:'star', emptyTitle:'Belum ada ulasan', emptyMsg:'Ulasan dan rating buku dari anggota akan tampil di sini.',
  sort:(a,b)=>b.date.localeCompare(a.date),
  columns:[
    {label:'Buku', render:i=>escapeHtml((findBook(i.bookId)||{}).title||'-')},
    {label:'Anggota', render:i=>escapeHtml((findMember(i.memberId)||{}).name||'-')},
    {label:'Rating', render:i=>starRating(i.rating)},
    {label:'Komentar', render:i=>`<span class="cell-sub">${escapeHtml(truncate(i.comment,40))}</span>`}
  ],
  fields:[
    {id:'bookId', label:'Buku', type:'select', col:6, required:true, options:bookOptions},
    {id:'memberId', label:'Anggota', type:'select', col:6, required:true, options:memberOptions},
    {id:'rating', label:'Rating', type:'select', col:4, required:true, options:[1,2,3,4,5].map(n=>({value:n,label:n+' Bintang'}))},
    {id:'date', label:'Tanggal', type:'date', col:8, required:true},
    {id:'comment', label:'Komentar', type:'textarea', col:12}
  ]
};

const CONFIG_BOOK_REQUESTS = {
  key:'library_bookRequests', idPrefix:'PRM', titleSingular:'Permintaan Buku Baru', searchFields:['title','author'],
  emptyIcon:'book-plus', emptyTitle:'Belum ada permintaan', emptyMsg:'Usulan judul buku baru dari anggota akan tampil di sini.',
  sort:(a,b)=>b.date.localeCompare(a.date),
  columns:[
    {label:'Judul Usulan', render:i=>`<span class="cell-title">${escapeHtml(i.title)}</span><div class="cell-sub">${escapeHtml(i.author||'-')}</div>`},
    {label:'Anggota', render:i=>escapeHtml((findMember(i.memberId)||{}).name||'-')},
    {label:'Tanggal', render:i=>formatDate(i.date)},
    {label:'Status', render:i=>genericStatusBadge(i.status)}
  ],
  fields:[
    {id:'memberId', label:'Anggota', type:'select', col:6, required:true, options:memberOptions},
    {id:'title', label:'Judul Buku', type:'text', col:6, required:true},
    {id:'author', label:'Penulis', type:'text', col:6},
    {id:'date', label:'Tanggal', type:'date', col:6, required:true},
    {id:'reason', label:'Alasan Usulan', type:'textarea', col:12},
    {id:'status', label:'Status', type:'select', col:6, options:[{value:'Menunggu',label:'Menunggu'},{value:'Disetujui',label:'Disetujui'},{value:'Ditolak',label:'Ditolak'}], default:'Menunggu'}
  ]
};

const CONFIG_DONATIONS = {
  key:'library_donations', idPrefix:'DNS', titleSingular:'Donasi Buku', searchFields:['title','donorName'],
  emptyIcon:'heart-handshake', emptyTitle:'Belum ada donasi', emptyMsg:'Catat donasi buku dari masyarakat atau alumni.',
  sort:(a,b)=>b.date.localeCompare(a.date),
  columns:[
    {label:'Judul Buku', render:i=>`<span class="cell-title">${escapeHtml(i.title)}</span>`},
    {label:'Donatur', render:i=>escapeHtml(i.donorName)},
    {label:'Qty', render:i=>`<span class="mono">${i.qty}</span>`},
    {label:'Status', render:i=>genericStatusBadge(i.status)}
  ],
  fields:[
    {id:'donorName', label:'Nama Donatur', type:'text', col:6, required:true},
    {id:'donorContact', label:'Kontak Donatur', type:'text', col:6},
    {id:'title', label:'Judul Buku', type:'text', col:6, required:true},
    {id:'author', label:'Penulis', type:'text', col:6},
    {id:'qty', label:'Jumlah', type:'number', col:3, required:true, min:1},
    {id:'condition', label:'Kondisi', type:'select', col:3, options:[{value:'Baik',label:'Baik'},{value:'Cukup Baik',label:'Cukup Baik'},{value:'Rusak Ringan',label:'Rusak Ringan'}]},
    {id:'date', label:'Tanggal', type:'date', col:3, required:true},
    {id:'status', label:'Status', type:'select', col:3, options:[{value:'Ditinjau',label:'Ditinjau'},{value:'Diterima',label:'Diterima'},{value:'Ditolak',label:'Ditolak'}], default:'Ditinjau'}
  ]
};

const CONFIG_BLACKLIST = {
  key:'library_blacklist', idPrefix:'BLK', titleSingular:'Blacklist Anggota', searchFields:['reason'],
  emptyIcon:'ban', emptyTitle:'Belum ada anggota di-blacklist', emptyMsg:'Anggota bermasalah dapat dicatat di sini.',
  columns:[
    {label:'Anggota', render:i=>escapeHtml((findMember(i.memberId)||{}).name||'-')},
    {label:'Alasan', render:i=>`<span class="cell-sub">${escapeHtml(truncate(i.reason,40))}</span>`},
    {label:'Periode', render:i=>`${formatDate(i.startDate)} – ${formatDate(i.endDate)}`},
    {label:'Status', render:i=>genericStatusBadge(i.status)}
  ],
  fields:[
    {id:'memberId', label:'Anggota', type:'select', col:12, required:true, options:memberOptions},
    {id:'reason', label:'Alasan', type:'textarea', col:12, required:true},
    {id:'startDate', label:'Tanggal Mulai', type:'date', col:6, required:true},
    {id:'endDate', label:'Tanggal Berakhir', type:'date', col:6, required:true},
    {id:'status', label:'Status', type:'select', col:12, options:[{value:'Aktif',label:'Aktif'},{value:'Selesai',label:'Selesai'}], default:'Aktif'}
  ]
};

const CONFIG_CARDS = {
  key:'library_cards', idPrefix:'KRT', titleSingular:'Kartu Anggota', searchFields:['cardNumber'],
  emptyIcon:'id-card', emptyTitle:'Belum ada kartu anggota', emptyMsg:'Terbitkan kartu anggota digital untuk anggota.',
  columns:[
    {label:'Anggota', render:i=>escapeHtml((findMember(i.memberId)||{}).name||'-')},
    {label:'No. Kartu', render:i=>`<span class="mono">${escapeHtml(i.cardNumber)}</span>`},
    {label:'Berlaku s/d', render:i=>formatDate(i.expiryDate)},
    {label:'Status', render:i=>genericStatusBadge(i.status)}
  ],
  fields:[
    {id:'memberId', label:'Anggota', type:'select', col:6, required:true, options:memberOptions},
    {id:'cardNumber', label:'Nomor Kartu', type:'text', col:6, required:true},
    {id:'issueDate', label:'Tanggal Terbit', type:'date', col:6, required:true},
    {id:'expiryDate', label:'Tanggal Berakhir', type:'date', col:6, required:true},
    {id:'status', label:'Status', type:'select', col:6, options:[{value:'Aktif',label:'Aktif'},{value:'Kedaluwarsa',label:'Kedaluwarsa'},{value:'Diblokir',label:'Diblokir'}], default:'Aktif'}
  ]
};

const CONFIG_MEMBERSHIP_TYPES = {
  key:'library_membershipTypes', idPrefix:'JKA', titleSingular:'Jenis Keanggotaan', searchFields:['name'],
  emptyIcon:'id-card', emptyTitle:'Belum ada jenis keanggotaan', emptyMsg:'Tambahkan jenis keanggotaan beserta aturannya.',
  columns:[
    {label:'Nama', render:i=>`<span class="cell-title">${escapeHtml(i.name)}</span>`},
    {label:'Durasi Pinjam', render:i=>`${i.maxLoanDays} hari`},
    {label:'Maks. Buku', render:i=>`<span class="mono">${i.maxBooks}</span>`}
  ],
  fields:[
    {id:'name', label:'Nama Jenis Keanggotaan', type:'text', col:12, required:true},
    {id:'maxLoanDays', label:'Durasi Pinjam Maks. (hari)', type:'number', col:6, required:true, min:1},
    {id:'maxBooks', label:'Maks. Buku Dipinjam', type:'number', col:6, required:true, min:1},
    {id:'description', label:'Deskripsi', type:'textarea', col:12}
  ]
};

const CONFIG_DEPARTMENTS = {
  key:'library_departments', idPrefix:'JRS', titleSingular:'Jurusan/Kelas', searchFields:['name'],
  emptyIcon:'graduation-cap', emptyTitle:'Belum ada jurusan/kelas', emptyMsg:'Tambahkan jurusan atau kelas anggota.',
  columns:[
    {label:'Nama', render:i=>`<span class="icon-text">${icon('graduation-cap')}${escapeHtml(i.name)}</span>`},
    {label:'Deskripsi', render:i=>`<span class="cell-sub">${escapeHtml(i.description||'-')}</span>`}
  ],
  fields:[
    {id:'name', label:'Nama Jurusan/Kelas', type:'text', col:12, required:true},
    {id:'description', label:'Deskripsi', type:'textarea', col:12}
  ]
};

const CONFIG_RESERVATIONS = {
  key:'library_reservations', idPrefix:'RSV', titleSingular:'Reservasi Buku', searchFields:[],
  emptyIcon:'bookmark', emptyTitle:'Belum ada reservasi', emptyMsg:'Reservasi buku yang stoknya sedang habis akan tampil di sini.',
  sort:(a,b)=>b.reserveDate.localeCompare(a.reserveDate),
  columns:[
    {label:'Buku', render:i=>escapeHtml((findBook(i.bookId)||{}).title||'-')},
    {label:'Anggota', render:i=>escapeHtml((findMember(i.memberId)||{}).name||'-')},
    {label:'Tgl Reservasi', render:i=>formatDate(i.reserveDate)},
    {label:'Status', render:i=>genericStatusBadge(i.status)}
  ],
  fields:[
    {id:'bookId', label:'Buku', type:'select', col:6, required:true, options:bookOptions},
    {id:'memberId', label:'Anggota', type:'select', col:6, required:true, options:memberOptions},
    {id:'reserveDate', label:'Tanggal Reservasi', type:'date', col:6, required:true},
    {id:'status', label:'Status', type:'select', col:6, options:[{value:'Menunggu',label:'Menunggu'},{value:'Siap Diambil',label:'Siap Diambil'},{value:'Selesai',label:'Selesai'},{value:'Dibatalkan',label:'Dibatalkan'}], default:'Menunggu'}
  ]
};

const CONFIG_EXTENSIONS = {
  key:'library_extensions', idPrefix:'PPJ', titleSingular:'Perpanjangan', searchFields:[],
  emptyIcon:'calendar-clock', emptyTitle:'Belum ada pengajuan perpanjangan', emptyMsg:'Pengajuan perpanjangan masa pinjam akan tampil di sini.',
  sort:(a,b)=>b.requestDate.localeCompare(a.requestDate),
  columns:[
    {label:'ID Pinjam', render:i=>`<span class="mono">${escapeHtml(i.loanId)}</span>`},
    {label:'Anggota / Buku', render:i=>{ const l=findLoanById(i.loanId); if(!l) return '-'; const m=findMember(l.memberId), b=findBook(l.bookId); return `${escapeHtml(m?m.name:'-')} <span class="cell-sub">/ ${escapeHtml(b?b.title:'-')}</span>`; }},
    {label:'Tgl Jatuh Tempo Baru', render:i=>formatDate(i.newDueDate)},
    {label:'Status', render:i=>genericStatusBadge(i.status)}
  ],
  fields:[
    {id:'loanId', label:'Transaksi Peminjaman', type:'select', col:12, required:true, options:activeLoanOptions},
    {id:'requestDate', label:'Tanggal Pengajuan', type:'date', col:6, required:true},
    {id:'newDueDate', label:'Tanggal Jatuh Tempo Baru', type:'date', col:6, required:true},
    {id:'status', label:'Status', type:'select', col:6, options:[{value:'Menunggu',label:'Menunggu'},{value:'Disetujui',label:'Disetujui'},{value:'Ditolak',label:'Ditolak'}], default:'Menunggu'},
    {id:'reason', label:'Alasan', type:'textarea', col:12}
  ],
  onAfterSave(item){
    if(item.status==='Disetujui' && item.loanId && item.newDueDate){
      const loans = getLoans();
      const idx = loans.findIndex(l=>l.id===item.loanId);
      if(idx>-1 && loans[idx].dueDate !== item.newDueDate){
        loans[idx].dueDate = item.newDueDate;
        setLoans(loans);
        showToast('Jatuh tempo peminjaman diperbarui mengikuti perpanjangan.', 'info');
      }
    }
  }
};

const CONFIG_FINE_PAYMENTS = {
  key:'library_finePayments', idPrefix:'BYR', titleSingular:'Pembayaran Denda', searchFields:[],
  emptyIcon:'wallet', emptyTitle:'Belum ada pembayaran denda', emptyMsg:'Riwayat pembayaran denda keterlambatan akan tampil di sini.',
  sort:(a,b)=>b.paymentDate.localeCompare(a.paymentDate),
  columns:[
    {label:'ID Pinjam', render:i=>`<span class="mono">${escapeHtml(i.loanId)}</span>`},
    {label:'Anggota', render:i=>{ const l=findLoanById(i.loanId); const m=l?findMember(l.memberId):null; return escapeHtml(m?m.name:'-'); }},
    {label:'Jumlah', render:i=>formatRupiah(i.amount)},
    {label:'Tgl Bayar', render:i=>formatDate(i.paymentDate)},
    {label:'Metode', render:i=>escapeHtml(i.method||'-')}
  ],
  fields:[
    {id:'loanId', label:'Transaksi Peminjaman (Denda)', type:'select', col:12, required:true, options:fineLoanOptions},
    {id:'amount', label:'Jumlah Dibayar (Rp)', type:'number', col:6, required:true, min:0},
    {id:'paymentDate', label:'Tanggal Bayar', type:'date', col:6, required:true},
    {id:'method', label:'Metode Pembayaran', type:'select', col:6, options:[{value:'Tunai',label:'Tunai'},{value:'Transfer',label:'Transfer'},{value:'QRIS',label:'QRIS'}]}
  ]
};

const CONFIG_DAMAGE_REPORTS = {
  key:'library_damageReports', idPrefix:'KRS', titleSingular:'Kerusakan/Kehilangan', searchFields:['description'],
  emptyIcon:'triangle-alert', emptyTitle:'Belum ada laporan', emptyMsg:'Laporan buku rusak atau hilang akan tampil di sini.',
  sort:(a,b)=>b.date.localeCompare(a.date),
  columns:[
    {label:'Buku', render:i=>escapeHtml((findBook(i.bookId)||{}).title||'-')},
    {label:'Jenis', render:i=>i.type==='Rusak'?`<span class="badge-soft b-warning">${icon('wrench')}Rusak</span>`:`<span class="badge-soft b-slate">${icon('help-circle')}Hilang</span>`},
    {label:'Tanggal', render:i=>formatDate(i.date)},
    {label:'Status', render:i=>genericStatusBadge(i.status)}
  ],
  fields:[
    {id:'bookId', label:'Buku', type:'select', col:6, required:true, options:bookOptions},
    {id:'type', label:'Jenis Laporan', type:'select', col:6, required:true, options:[{value:'Rusak',label:'Rusak'},{value:'Hilang',label:'Hilang'}]},
    {id:'reporterMemberId', label:'Dilaporkan oleh Anggota', type:'select', col:6, options:memberOptions},
    {id:'date', label:'Tanggal Laporan', type:'date', col:6, required:true},
    {id:'description', label:'Keterangan', type:'textarea', col:12},
    {id:'status', label:'Status Penanganan', type:'select', col:12, options:[{value:'Ditinjau',label:'Ditinjau'},{value:'Diproses',label:'Diproses'},{value:'Selesai',label:'Selesai'}], default:'Ditinjau'}
  ],
  onAfterSave(item){
    if(item.status==='Selesai' && item.bookId){
      const books = getBooks();
      const idx = books.findIndex(b=>b.id===item.bookId);
      if(idx>-1){
        books[idx].manualStatus = item.type==='Hilang' ? 'hilang' : 'rusak';
        setBooks(books);
        showToast('Status buku diperbarui mengikuti laporan.', 'info');
      }
    }
  }
};

const CONFIG_STOCK_OPNAME = {
  key:'library_stockOpname', idPrefix:'OPN', titleSingular:'Stok Opname', searchFields:['note'],
  emptyIcon:'clipboard-check', emptyTitle:'Belum ada catatan stok opname', emptyMsg:'Catat hasil pemeriksaan stok fisik buku secara berkala.',
  sort:(a,b)=>b.date.localeCompare(a.date),
  columns:[
    {label:'Buku', render:i=>escapeHtml((findBook(i.bookId)||{}).title||'-')},
    {label:'Sistem', render:i=>`<span class="mono">${i.systemStock}</span>`},
    {label:'Aktual', render:i=>`<span class="mono">${i.actualStock}</span>`},
    {label:'Selisih', render:i=>{ const d=i.actualStock-i.systemStock; return `<span class="mono" style="color:${d===0?'var(--success)':'var(--danger)'}">${d>0?'+':''}${d}</span>`; }},
    {label:'Tanggal', render:i=>formatDate(i.date)}
  ],
  fields:[
    {id:'bookId', label:'Buku', type:'select', col:12, required:true, options:bookOptions},
    {id:'systemStock', label:'Stok Sistem', type:'number', col:4, required:true, min:0},
    {id:'actualStock', label:'Stok Aktual (Fisik)', type:'number', col:4, required:true, min:0},
    {id:'date', label:'Tanggal Periksa', type:'date', col:4, required:true},
    {id:'officer', label:'Petugas', type:'text', col:6, required:true},
    {id:'note', label:'Catatan', type:'textarea', col:12}
  ]
};

const CONFIG_EVENTS = {
  key:'library_events', idPrefix:'EVT', titleSingular:'Event/Kegiatan', searchFields:['title','location'],
  emptyIcon:'party-popper', emptyTitle:'Belum ada kegiatan', emptyMsg:'Tambahkan kegiatan atau acara perpustakaan.',
  sort:(a,b)=>a.date.localeCompare(b.date),
  columns:[
    {label:'Judul Acara', render:i=>`<span class="cell-title">${escapeHtml(i.title)}</span>`},
    {label:'Tanggal', render:i=>formatDate(i.date)},
    {label:'Lokasi', render:i=>escapeHtml(i.location||'-')}
  ],
  fields:[
    {id:'title', label:'Judul Kegiatan', type:'text', col:12, required:true},
    {id:'date', label:'Tanggal', type:'date', col:4, required:true},
    {id:'location', label:'Lokasi', type:'text', col:8, required:true},
    {id:'description', label:'Deskripsi', type:'textarea', col:12}
  ]
};

const CONFIG_ANNOUNCEMENTS = {
  key:'library_announcements', idPrefix:'PGM', titleSingular:'Pengumuman', searchFields:['title','content'],
  emptyIcon:'megaphone', emptyTitle:'Belum ada pengumuman', emptyMsg:'Tambahkan pengumuman untuk anggota perpustakaan.',
  sort:(a,b)=>b.date.localeCompare(a.date),
  columns:[
    {label:'Judul', render:i=>`<span class="cell-title">${escapeHtml(i.title)}</span>`},
    {label:'Prioritas', render:i=>{ const m={'Tinggi':'b-danger','Sedang':'b-warning','Rendah':'b-slate'}; return `<span class="badge-soft ${m[i.priority]||'b-slate'}">${icon('flag')}${escapeHtml(i.priority||'-')}</span>`; }},
    {label:'Tanggal', render:i=>formatDate(i.date)}
  ],
  fields:[
    {id:'title', label:'Judul Pengumuman', type:'text', col:8, required:true},
    {id:'priority', label:'Prioritas', type:'select', col:4, options:[{value:'Rendah',label:'Rendah'},{value:'Sedang',label:'Sedang'},{value:'Tinggi',label:'Tinggi'}], default:'Sedang'},
    {id:'content', label:'Isi Pengumuman', type:'textarea', col:12, required:true},
    {id:'date', label:'Tanggal', type:'date', col:6, required:true}
  ]
};

const CONFIG_ROOM_BOOKINGS = {
  key:'library_roomBookings', idPrefix:'BKG', titleSingular:'Booking Ruang Baca', searchFields:['purpose','room'],
  emptyIcon:'door-open', emptyTitle:'Belum ada booking ruang', emptyMsg:'Pemesanan ruang diskusi/baca oleh anggota akan tampil di sini.',
  sort:(a,b)=>a.date.localeCompare(b.date),
  columns:[
    {label:'Anggota', render:i=>escapeHtml((findMember(i.memberId)||{}).name||'-')},
    {label:'Ruangan', render:i=>escapeHtml(i.room)},
    {label:'Tanggal', render:i=>formatDate(i.date)},
    {label:'Waktu', render:i=>`${escapeHtml(i.timeStart||'-')} – ${escapeHtml(i.timeEnd||'-')}`}
  ],
  fields:[
    {id:'memberId', label:'Anggota', type:'select', col:6, required:true, options:memberOptions},
    {id:'room', label:'Ruangan', type:'select', col:6, required:true, options:[
      {value:'Ruang Diskusi 1',label:'Ruang Diskusi 1'},{value:'Ruang Diskusi 2',label:'Ruang Diskusi 2'},
      {value:'Ruang Baca Tenang',label:'Ruang Baca Tenang'},{value:'Aula Perpustakaan',label:'Aula Perpustakaan'}]},
    {id:'date', label:'Tanggal', type:'date', col:4, required:true},
    {id:'timeStart', label:'Jam Mulai', type:'time', col:4, required:true},
    {id:'timeEnd', label:'Jam Selesai', type:'time', col:4, required:true},
    {id:'purpose', label:'Keperluan', type:'textarea', col:12}
  ]
};

const CONFIG_FAQS = {
  key:'library_faqs', idPrefix:'FAQ', titleSingular:'FAQ', searchFields:['question','answer','category'],
  emptyIcon:'help-circle', emptyTitle:'Belum ada FAQ', emptyMsg:'Tambahkan pertanyaan yang sering diajukan anggota.',
  columns:[
    {label:'Pertanyaan', render:i=>`<span class="cell-title">${escapeHtml(i.question)}</span>`},
    {label:'Kategori', render:i=>`<span class="badge-soft b-primary">${icon('tag')}${escapeHtml(i.category||'Umum')}</span>`}
  ],
  fields:[
    {id:'question', label:'Pertanyaan', type:'text', col:12, required:true},
    {id:'answer', label:'Jawaban', type:'textarea', col:12, required:true},
    {id:'category', label:'Kategori', type:'text', col:12}
  ]
};

const CONFIG_FEEDBACK = {
  key:'library_feedback', idPrefix:'FBK', titleSingular:'Kritik & Saran', searchFields:['memberName','message'],
  emptyIcon:'message-square', emptyTitle:'Belum ada kritik & saran', emptyMsg:'Masukan dari anggota akan tampil di sini.',
  sort:(a,b)=>b.date.localeCompare(a.date),
  columns:[
    {label:'Nama', render:i=>escapeHtml(i.memberName)},
    {label:'Jenis', render:i=>i.type==='Kritik'?`<span class="badge-soft b-danger">${icon('message-square')}Kritik</span>`:`<span class="badge-soft b-info">${icon('lightbulb')}Saran</span>`},
    {label:'Pesan', render:i=>`<span class="cell-sub">${escapeHtml(truncate(i.message,45))}</span>`},
    {label:'Status', render:i=>genericStatusBadge(i.status)}
  ],
  fields:[
    {id:'memberName', label:'Nama Pengirim', type:'text', col:6, required:true},
    {id:'type', label:'Jenis', type:'select', col:6, required:true, options:[{value:'Kritik',label:'Kritik'},{value:'Saran',label:'Saran'}]},
    {id:'message', label:'Pesan', type:'textarea', col:12, required:true},
    {id:'date', label:'Tanggal', type:'date', col:6, required:true},
    {id:'status', label:'Status', type:'select', col:6, options:[{value:'Menunggu',label:'Menunggu'},{value:'Ditinjau',label:'Ditinjau'},{value:'Selesai',label:'Selesai'}], default:'Menunggu'}
  ]
};

const CONFIG_VISITS = {
  key:'library_visits', idPrefix:'KJG', titleSingular:'Kunjungan (Buku Tamu)', searchFields:['visitorName','purpose'],
  emptyIcon:'door-open', emptyTitle:'Belum ada kunjungan tercatat', emptyMsg:'Catatan buku tamu kunjungan perpustakaan akan tampil di sini.',
  sort:(a,b)=>String(b.checkIn).localeCompare(String(a.checkIn)),
  columns:[
    {label:'Nama Pengunjung', render:i=>`<span class="cell-title">${escapeHtml(i.visitorName)}</span>`},
    {label:'Keperluan', render:i=>escapeHtml(i.purpose||'-')},
    {label:'Check-in', render:i=>i.checkIn ? i.checkIn.replace('T',' ') : '-'},
    {label:'Check-out', render:i=>i.checkOut ? i.checkOut.replace('T',' ') : '-'}
  ],
  fields:[
    {id:'visitorName', label:'Nama Pengunjung', type:'text', col:6, required:true},
    {id:'memberId', label:'Anggota (opsional)', type:'select', col:6, options:memberOptions, placeholder:'Tamu umum / non-anggota'},
    {id:'purpose', label:'Keperluan', type:'text', col:12, required:true},
    {id:'checkIn', label:'Waktu Check-in', type:'datetime-local', col:6, required:true},
    {id:'checkOut', label:'Waktu Check-out', type:'datetime-local', col:6}
  ]
};

const CONFIG_ROLES = {
  key:'library_roles', idPrefix:'ROL', titleSingular:'Role & Hak Akses', searchFields:['name','permissions'],
  emptyIcon:'shield', emptyTitle:'Belum ada role', emptyMsg:'Tambahkan role dan hak akses pengguna sistem.',
  sort:(a,b)=>(a.level||99)-(b.level||99),
  columns:[
    {label:'Nama Role', render:i=>`<span class="icon-text">${icon('shield')}<span class="cell-title">${escapeHtml(i.name)}</span></span>`},
    {label:'Level', render:i=>`<span class="mono">${i.level ?? '-'}</span>`},
    {label:'Hak Akses', render:i=>`<span class="cell-sub">${escapeHtml(truncate(i.permissions,50))}</span>`}
  ],
  fields:[
    {id:'name', label:'Nama Role', type:'text', col:8, required:true},
    {id:'level', label:'Level (1=tertinggi)', type:'number', col:4, required:true, min:1},
    {id:'permissions', label:'Deskripsi Hak Akses', type:'textarea', col:12, required:true}
  ],
  onBeforeDelete(item){ return (DB.get('library_staff')||[]).some(s=>s.roleId===item.id) ? 'Role masih digunakan oleh salah satu pengguna staf.' : true; }
};

const CONFIG_STAFF = {
  key:'library_staff', idPrefix:'STF', titleSingular:'Pengguna/Staf Sistem', searchFields:['name','username','email'],
  emptyIcon:'user-cog', emptyTitle:'Belum ada pengguna', emptyMsg:'Tambahkan akun staf pengelola sistem.',
  columns:[
    {label:'Nama', render:i=>`<div class="icon-text"><span class="avatar-sm">${escapeHtml(initials(i.name))}</span><span class="cell-title">${escapeHtml(i.name)}</span></div>`},
    {label:'Username', render:i=>`<span class="mono">${escapeHtml(i.username)}</span>`},
    {label:'Role', render:i=>escapeHtml((findRole(i.roleId)||{}).name||'-')},
    {label:'Status', render:i=>genericStatusBadge(i.status)}
  ],
  fields:[
    {id:'name', label:'Nama Lengkap', type:'text', col:6, required:true},
    {id:'username', label:'Username', type:'text', col:6, required:true},
    {id:'email', label:'Email', type:'email', col:6, required:true},
    {id:'roleId', label:'Role', type:'select', col:6, required:true, options:roleOptions},
    {id:'status', label:'Status', type:'select', col:12, options:[{value:'Aktif',label:'Aktif'},{value:'Nonaktif',label:'Nonaktif'}], default:'Aktif'}
  ]
};

const CONFIG_ACTIVITY_LOG = {
  key:'library_activitylog', idPrefix:'LOG', titleSingular:'Log Aktivitas', searchFields:['action','description','actor'],
  emptyIcon:'history', emptyTitle:'Belum ada log', emptyMsg:'Riwayat aktivitas pada sistem akan tercatat otomatis di sini.',
  sort:(a,b)=>String(b.timestamp).localeCompare(String(a.timestamp)),
  columns:[
    {label:'Aktivitas', render:i=>`<span class="badge-soft b-primary">${icon('activity')}${escapeHtml(i.action)}</span>`},
    {label:'Deskripsi', render:i=>`<span class="cell-sub">${escapeHtml(truncate(i.description,50))}</span>`},
    {label:'Oleh', render:i=>escapeHtml(i.actor||'-')},
    {label:'Waktu', render:i=>{ const d=new Date(i.timestamp); return isNaN(d) ? '-' : formatDate(d.toISOString().slice(0,10)) + ' ' + d.toTimeString().slice(0,5); }}
  ],
  fields:[
    {id:'action', label:'Jenis Aktivitas', type:'text', col:6, required:true},
    {id:'actor', label:'Dilakukan oleh', type:'text', col:6, required:true},
    {id:'description', label:'Deskripsi', type:'textarea', col:12, required:true}
  ],
  onBeforeSave(payload, isEdit){ if(!isEdit) payload.timestamp = new Date().toISOString(); return payload; }
};

const CONFIG_BACKUPS = {
  key:'library_backups', idPrefix:'BCK', titleSingular:'Riwayat Backup', searchFields:['label','note'],
  emptyIcon:'database', emptyTitle:'Belum ada riwayat backup', emptyMsg:'Buat snapshot data untuk mencatat riwayat backup.',
  sort:(a,b)=>b.date.localeCompare(a.date),
  columns:[
    {label:'Label', render:i=>`<span class="cell-title">${escapeHtml(i.label)}</span>`},
    {label:'Tanggal', render:i=>formatDate(i.date)},
    {label:'Catatan', render:i=>`<span class="cell-sub">${escapeHtml(truncate(i.note,50))}</span>`}
  ],
  fields:[
    {id:'label', label:'Label Backup', type:'text', col:8, required:true},
    {id:'date', label:'Tanggal', type:'date', col:4, required:true},
    {id:'note', label:'Catatan', type:'textarea', col:12}
  ]
};

