/* =========================================================================
   LibrarySys — Sistem Informasi Perpustakaan (v2, multi-halaman)
   Setiap halaman menyertakan blok kode yang sama ini (CSS & JS inline per
   halaman sesuai permintaan) supaya tiap file HTML berdiri sendiri.
   ========================================================================= */

/* ---------------------------- KONSTANTA & UTILITAS ---------------------------- */
const KEYS = { books:'library_books', members:'library_members', loans:'library_loans', settings:'library_settings' };

const CATEGORY_ICONS = {
  'Fiksi':'book-open','Non-Fiksi':'notebook-text','Teknologi':'cpu','Sains':'sparkles',
  'Sejarah':'hourglass','Biografi':'user-round','Ekonomi':'trending-up',
  'Agama':'moon-star','Anak':'smile','Pendidikan':'graduation-cap'
};
const CATEGORY_COLORS = {
  'Fiksi':['#4F46E5','#312E81'], 'Non-Fiksi':['#0EA5E9','#0C4A6E'], 'Teknologi':['#16A34A','#14532D'],
  'Sains':['#7C3AED','#4C1D95'], 'Sejarah':['#D97706','#78350F'], 'Biografi':['#DB2777','#831843'],
  'Ekonomi':['#0D9488','#134E4A'], 'Agama':['#65A30D','#365314'], 'Anak':['#F59E0B','#92400E'],
  'Pendidikan':['#2563EB','#1E3A8A']
};
function categoryIcon(cat){ return CATEGORY_ICONS[cat] || 'tag'; }

function uid(prefix, list){
  const n = (list.length ? Math.max(...list.map(x=>parseInt(String(x.id).split('-')[1])||0)) : 0) + 1;
  return prefix + '-' + String(n).padStart(3,'0');
}
function todayStr(){ return new Date().toISOString().slice(0,10); }
function daysAgo(n){ const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); }
function daysFromNow(n){ const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); }
function formatRupiah(n){ return 'Rp' + Number(n||0).toLocaleString('id-ID'); }
function formatDate(str){
  if(!str) return '-';
  const d = new Date(str+'T00:00:00');
  const bulan=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  return d.getDate()+' '+bulan[d.getMonth()]+' '+d.getFullYear();
}
function daysBetween(a,b){ return Math.round((new Date(b) - new Date(a))/86400000); }
function escapeHtml(str){
  return String(str==null?'':str).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function initials(name){
  return String(name||'').trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();
}
function debounce(fn, wait){
  let t; return function(...args){ clearTimeout(t); t=setTimeout(()=>fn.apply(this,args), wait); };
}
function icon(name, extra){ return `<i data-lucide="${name}" ${extra||''}></i>`; }

/* ---------------------------- LAPISAN DATA (LocalStorage) ---------------------------- */
const DB = {
  get(key){ try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }catch(e){ return null; } },
  set(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
};
const getBooks = () => DB.get(KEYS.books) || [];
const setBooks = (v) => DB.set(KEYS.books, v);
const getMembers = () => DB.get(KEYS.members) || [];
const setMembers = (v) => DB.set(KEYS.members, v);
const getLoans = () => DB.get(KEYS.loans) || [];
const setLoans = (v) => DB.set(KEYS.loans, v);
const getSettings = () => DB.get(KEYS.settings) || defaultSettings();
const setSettings = (v) => DB.set(KEYS.settings, v);

function defaultSettings(){
  return {
    libraryName:'Perpustakaan Digital Nusantara',
    address:'Jl. Pendidikan No. 45, Surakarta, Jawa Tengah',
    email:'info@perpusnusantara.id',
    phone:'0271-123456',
    maxLoanDays:14,
    finePerDay:2000,
    maxBooksPerMember:3
  };
}
function findBook(id){ return getBooks().find(b=>b.id===id); }
function findMember(id){ return getMembers().find(m=>m.id===id); }

function bookStatus(book){
  if(!book) return '-';
  if(book.manualStatus==='rusak') return 'Rusak';
  if(book.manualStatus==='hilang') return 'Hilang';
  return book.stock>0 ? 'Tersedia' : 'Dipinjam';
}
function bookStatusBadge(status){
  const map={
    'Tersedia':{cls:'b-success',icon:'check-circle'},'Dipinjam':{cls:'b-warning',icon:'repeat'},
    'Rusak':{cls:'b-danger',icon:'octagon-x'},'Hilang':{cls:'b-slate',icon:'help-circle'}
  };
  const m = map[status] || {cls:'b-slate',icon:'circle'};
  return `<span class="badge-soft ${m.cls}">${icon(m.icon)}${status}</span>`;
}
function loanStatus(loan){
  if(loan.returnDate) return 'Dikembalikan';
  return (new Date(todayStr()) > new Date(loan.dueDate)) ? 'Terlambat' : 'Dipinjam';
}
function loanStatusBadge(status){
  const map={'Dipinjam':{cls:'b-info',icon:'clock'},'Dikembalikan':{cls:'b-success',icon:'check-circle'},'Terlambat':{cls:'b-danger',icon:'alert-triangle'}};
  const m = map[status] || {cls:'b-slate',icon:'circle'};
  return `<span class="badge-soft ${m.cls}">${icon(m.icon)}${status}</span>`;
}
function memberStatusBadge(status){
  return status==='Aktif'
    ? `<span class="badge-soft b-success">${icon('check-circle')}Aktif</span>`
    : `<span class="badge-soft b-slate">${icon('minus-circle')}Nonaktif</span>`;
}
function genericStatusBadge(status){
  const map = {
    'Menunggu':{cls:'b-warning',icon:'clock'}, 'Disetujui':{cls:'b-success',icon:'check-circle'},
    'Ditolak':{cls:'b-danger',icon:'x-circle'}, 'Selesai':{cls:'b-success',icon:'check-circle'},
    'Dibatalkan':{cls:'b-slate',icon:'x-circle'}, 'Aktif':{cls:'b-success',icon:'check-circle'},
    'Nonaktif':{cls:'b-slate',icon:'minus-circle'}, 'Siap Diambil':{cls:'b-info',icon:'package-check'},
    'Diterima':{cls:'b-success',icon:'check-circle'}, 'Ditinjau':{cls:'b-warning',icon:'eye'},
    'Terbit':{cls:'b-success',icon:'check-circle'}, 'Kedaluwarsa':{cls:'b-danger',icon:'alert-triangle'}
  };
  const m = map[status] || {cls:'b-slate',icon:'circle'};
  return `<span class="badge-soft ${m.cls}">${icon(m.icon)}${escapeHtml(status)}</span>`;
}
function calcFine(dueDateStr, returnDateStr, finePerDay){
  const late = Math.max(0, daysBetween(dueDateStr, returnDateStr));
  return { lateDays: late, fine: late * finePerDay };
}
function starRating(n){
  n = parseInt(n)||0;
  let s = '<span class="star-rating">';
  for(let i=1;i<=5;i++) s += icon('star', i<=n ? 'fill="currentColor"' : 'style="opacity:.25"');
  return s + '</span>';
}

/* ---------------------------- LOG AKTIVITAS (otomatis) ---------------------------- */
function logActivity(action, description){
  const list = DB.get('library_activitylog') || [];
  list.unshift({ id: uid('LOG', list), action, description, timestamp: new Date().toISOString(), actor:'Admin Perpus' });
  DB.set('library_activitylog', list.slice(0, 300));
}

