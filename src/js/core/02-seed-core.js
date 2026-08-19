/* ---------------------------- SEED DATA INTI (buku, anggota, peminjaman) ---------------------------- */
function seedIfEmpty(){
  if(DB.get(KEYS.settings) === null) setSettings(defaultSettings());

  if(DB.get(KEYS.books) === null){
    const books = [
      {id:'BK-001', isbn:'978-979-1227-78-0', title:'Laskar Pelangi', author:'Andrea Hirata', publisher:'Bentang Pustaka', year:2005, category:'Fiksi', stock:0, location:'A1-01', description:'Kisah perjuangan sepuluh anak di Belitung untuk mengenyam pendidikan di tengah keterbatasan.', manualStatus:null},
      {id:'BK-002', isbn:'978-979-9731-23-5', title:'Bumi Manusia', author:'Pramoedya Ananta Toer', publisher:'Hasta Mitra', year:1980, category:'Fiksi', stock:0, location:'A1-02', description:'Novel epik tetralogi Buru tentang Minke pada masa kolonial Hindia Belanda.', manualStatus:null},
      {id:'BK-003', isbn:'978-602-291-078-9', title:'Filosofi Teras', author:'Henry Manampiring', publisher:'Kompas', year:2018, category:'Non-Fiksi', stock:0, location:'B2-05', description:'Pengantar filsafat Stoa untuk menghadapi kecemasan hidup modern.', manualStatus:null},
      {id:'BK-004', isbn:'978-602-9481-45-6', title:'Sapiens: Riwayat Singkat Umat Manusia', author:'Yuval Noah Harari', publisher:'Pustaka Alvabet', year:2017, category:'Non-Fiksi', stock:0, location:'B2-08', description:'Perjalanan sejarah manusia dari zaman batu hingga era revolusi kognitif dan sains.', manualStatus:null},
      {id:'BK-005', isbn:'978-0-13-235088-4', title:'Clean Code', author:'Robert C. Martin', publisher:'Prentice Hall', year:2008, category:'Teknologi', stock:0, location:'C3-01', description:'Panduan menulis kode yang rapi, mudah dibaca, dan mudah dirawat.', manualStatus:null},
      {id:'BK-006', isbn:'978-0-345-33135-9', title:'Cosmos', author:'Carl Sagan', publisher:'Ballantine Books', year:1980, category:'Sains', stock:0, location:'D1-03', description:'Eksplorasi alam semesta dan tempat manusia di dalamnya.', manualStatus:null},
      {id:'BK-007', isbn:'978-602-291-054-3', title:'Atomic Habits', author:'James Clear', publisher:'Gramedia Pustaka Utama', year:2019, category:'Non-Fiksi', stock:0, location:'B2-10', description:'Strategi membangun kebiasaan baik dan menghilangkan kebiasaan buruk secara bertahap.', manualStatus:null},
      {id:'BK-008', isbn:'978-979-22-4861-6', title:'Negeri 5 Menara', author:'Ahmad Fuadi', publisher:'Gramedia Pustaka Utama', year:2009, category:'Fiksi', stock:3, location:'A1-05', description:'Kisah santri Pondok Madani yang mengejar mimpi hingga ke penjuru dunia.', manualStatus:null},
      {id:'BK-009', isbn:'978-979-9101-92-6', title:'Sejarah Dunia yang Disederhanakan', author:'E.H. Gombrich', publisher:'Pustaka Alvabet', year:2015, category:'Sejarah', stock:4, location:'E1-02', description:'Ringkasan sejarah dunia yang ditulis dengan gaya bertutur yang mudah dipahami.', manualStatus:null},
      {id:'BK-010', isbn:'978-602-291-011-6', title:'Ayah', author:'Andrea Hirata', publisher:'Bentang Pustaka', year:2015, category:'Fiksi', stock:2, location:'A1-08', description:'Kisah cinta dan kesabaran seorang ayah bernama Sabari.', manualStatus:null},
      {id:'BK-011', isbn:'978-979-061-448-1', title:'Pengantar Ekonomi Mikro', author:'N. Gregory Mankiw', publisher:'Salemba Empat', year:2014, category:'Ekonomi', stock:5, location:'F1-01', description:'Buku ajar dasar ilmu ekonomi mikro untuk mahasiswa.', manualStatus:null},
      {id:'BK-012', isbn:'978-1-4516-4853-9', title:'Steve Jobs', author:'Walter Isaacson', publisher:'Simon & Schuster', year:2011, category:'Biografi', stock:1, location:'G1-04', description:'Biografi resmi pendiri Apple, Steve Jobs.', manualStatus:'rusak'},
      {id:'BK-013', isbn:'978-979-22-6081-6', title:'Harry Potter dan Batu Bertuah', author:'J.K. Rowling', publisher:'Gramedia Pustaka Utama', year:2000, category:'Anak', stock:0, location:'H1-02', description:'Awal petualangan Harry Potter di Dunia Sihir dan Sekolah Hogwarts.', manualStatus:'hilang'},
      {id:'BK-014', isbn:'978-0-262-03384-8', title:'Introduction to Algorithms', author:'Thomas H. Cormen dkk.', publisher:'MIT Press', year:2009, category:'Teknologi', stock:3, location:'C3-05', description:'Buku rujukan utama untuk struktur data dan algoritma tingkat lanjut.', manualStatus:null},
      {id:'BK-015', isbn:'978-602-04-1122-8', title:'Belajar JavaScript Modern', author:'Tim Penulis Elex Media', publisher:'Elex Media Komputindo', year:2021, category:'Teknologi', stock:6, location:'C3-08', description:'Panduan praktis pemrograman JavaScript dari dasar hingga ES6+.', manualStatus:null}
    ];
    setBooks(books);
  }

  if(DB.get(KEYS.members) === null){
    const members = [
      {id:'AG-001', name:'Ahmad Fadillah', nis:'2021010001', gender:'L', email:'ahmad.fadillah@mail.com', phone:'0812-1000-0001', address:'Jl. Slamet Riyadi No. 12, Surakarta', registerDate:daysAgo(410), status:'Aktif'},
      {id:'AG-002', name:'Siti Nurhaliza', nis:'2021010002', gender:'P', email:'siti.nurhaliza@mail.com', phone:'0812-1000-0002', address:'Jl. Adi Sucipto No. 8, Surakarta', registerDate:daysAgo(395), status:'Aktif'},
      {id:'AG-003', name:'Budi Santoso', nis:'2021010003', gender:'L', email:'budi.santoso@mail.com', phone:'0812-1000-0003', address:'Jl. Dr. Radjiman No. 23, Surakarta', registerDate:daysAgo(380), status:'Aktif'},
      {id:'AG-004', name:'Dewi Lestari', nis:'2021010004', gender:'P', email:'dewi.lestari@mail.com', phone:'0812-1000-0004', address:'Jl. Veteran No. 5, Surakarta', registerDate:daysAgo(360), status:'Aktif'},
      {id:'AG-005', name:'Rizky Pratama', nis:'2021010005', gender:'L', email:'rizky.pratama@mail.com', phone:'0812-1000-0005', address:'Jl. Ahmad Yani No. 17, Surakarta', registerDate:daysAgo(340), status:'Aktif'},
      {id:'AG-006', name:'Putri Ayu Wulandari', nis:'2021010006', gender:'P', email:'putri.ayu@mail.com', phone:'0812-1000-0006', address:'Jl. Ki Hajar Dewantara No. 3, Surakarta', registerDate:daysAgo(300), status:'Aktif'},
      {id:'AG-007', name:'Agus Setiawan', nis:'2021010007', gender:'L', email:'agus.setiawan@mail.com', phone:'0812-1000-0007', address:'Jl. Kartini No. 9, Surakarta', registerDate:daysAgo(280), status:'Nonaktif'},
      {id:'AG-008', name:'Maya Sari', nis:'2021010008', gender:'P', email:'maya.sari@mail.com', phone:'0812-1000-0008', address:'Jl. Diponegoro No. 21, Surakarta', registerDate:daysAgo(250), status:'Aktif'},
      {id:'AG-009', name:'Fajar Nugroho', nis:'2021010009', gender:'L', email:'fajar.nugroho@mail.com', phone:'0812-1000-0009', address:'Jl. Yos Sudarso No. 14, Surakarta', registerDate:daysAgo(220), status:'Aktif'},
      {id:'AG-010', name:'Indah Permata', nis:'2021010010', gender:'P', email:'indah.permata@mail.com', phone:'0812-1000-0010', address:'Jl. Gajah Mada No. 6, Surakarta', registerDate:daysAgo(190), status:'Nonaktif'}
    ];
    setMembers(members);
  }

  if(DB.get(KEYS.loans) === null){
    const settings = getSettings();
    const raw = [
      {id:'PJ-001', bookId:'BK-001', memberId:'AG-001', loanDate:daysAgo(20), dueDate:daysAgo(6), returnDate:null},
      {id:'PJ-002', bookId:'BK-002', memberId:'AG-002', loanDate:daysAgo(5),  dueDate:daysFromNow(9), returnDate:null},
      {id:'PJ-003', bookId:'BK-003', memberId:'AG-003', loanDate:daysAgo(25), dueDate:daysAgo(11), returnDate:null},
      {id:'PJ-004', bookId:'BK-004', memberId:'AG-004', loanDate:daysAgo(3),  dueDate:daysFromNow(11), returnDate:null},
      {id:'PJ-005', bookId:'BK-005', memberId:'AG-005', loanDate:daysAgo(18), dueDate:daysAgo(4), returnDate:null},
      {id:'PJ-006', bookId:'BK-006', memberId:'AG-006', loanDate:daysAgo(0),  dueDate:daysFromNow(14), returnDate:null},
      {id:'PJ-007', bookId:'BK-007', memberId:'AG-001', loanDate:daysAgo(7),  dueDate:daysFromNow(7), returnDate:null},
      {id:'PJ-008', bookId:'BK-008', memberId:'AG-007', loanDate:daysAgo(30), dueDate:daysAgo(16), returnDate:daysAgo(15)},
      {id:'PJ-009', bookId:'BK-009', memberId:'AG-008', loanDate:daysAgo(20), dueDate:daysAgo(6),  returnDate:daysAgo(8)},
      {id:'PJ-010', bookId:'BK-010', memberId:'AG-009', loanDate:daysAgo(40), dueDate:daysAgo(26), returnDate:daysAgo(20)}
    ];
    const loans = raw.map(l=>{
      if(l.returnDate){
        const f = calcFine(l.dueDate, l.returnDate, settings.finePerDay);
        return {...l, lateDays:f.lateDays, fine:f.fine};
      }
      return {...l, lateDays:0, fine:0};
    });
    setLoans(loans);
  }
}
seedIfEmpty();

