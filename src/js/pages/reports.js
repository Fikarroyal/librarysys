/* ---------------------------- MODUL: LAPORAN ---------------------------- */
let reportState = { type:'buku', dateStart:'', dateEnd:'', category:'', status:'' };
const REPORT_TYPES = [
  {key:'buku', label:'Laporan Buku', iconName:'book-marked'},
  {key:'anggota', label:'Laporan Anggota', iconName:'users'},
  {key:'peminjaman', label:'Laporan Peminjaman', iconName:'arrow-right-left'},
  {key:'pengembalian', label:'Laporan Pengembalian', iconName:'corner-down-left'},
  {key:'reservasi', label:'Laporan Reservasi', iconName:'bookmark'}
];
function initReportsPage(){
  const categories = [...new Set(getBooks().map(b=>b.category))].sort();
  const tabsWrap = document.getElementById('reportTabs');
  tabsWrap.innerHTML = REPORT_TYPES.map(t=>`<button type="button" class="btn btn-sm ${t.key==='buku'?'btn-primary':'btn-light-soft'}" data-reporttab="${t.key}">${icon(t.iconName)}${t.label}</button>`).join('');
  tabsWrap.querySelectorAll('[data-reporttab]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      reportState = { type:btn.dataset.reporttab, dateStart:'', dateEnd:'', category:'', status:'' };
      tabsWrap.querySelectorAll('[data-reporttab]').forEach(b=>b.className='btn btn-sm btn-light-soft');
      btn.className='btn btn-sm btn-primary';
      buildReportFilterBar(categories);
      renderReportTable();
    });
  });
  buildReportFilterBar(categories);
  renderReportTable();
  document.getElementById('btnExportCsv').addEventListener('click', exportReportCsv);
  document.getElementById('btnPrintReport').addEventListener('click', ()=>window.print());
  refreshIcons();
}
function buildReportFilterBar(categories){
  const bar = document.getElementById('reportFilterBar');
  let html = `<input type="date" class="form-control form-control-sm" id="reportDateStart" title="Tanggal awal">
              <span class="text-muted" style="font-size:.78rem;">s/d</span>
              <input type="date" class="form-control form-control-sm" id="reportDateEnd" title="Tanggal akhir">`;
  if(reportState.type==='buku'){
    html += `<select class="form-select form-select-sm" id="reportCategory"><option value="">Semua Kategori</option>${categories.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}</select>
              <select class="form-select form-select-sm" id="reportStatus"><option value="">Semua Status</option><option>Tersedia</option><option>Dipinjam</option><option>Rusak</option><option>Hilang</option></select>`;
  } else if(reportState.type==='anggota'){
    html += `<select class="form-select form-select-sm" id="reportStatus"><option value="">Semua Status</option><option>Aktif</option><option>Nonaktif</option></select>`;
  } else if(reportState.type==='peminjaman'){
    html += `<select class="form-select form-select-sm" id="reportStatus"><option value="">Semua Status</option><option>Dipinjam</option><option>Dikembalikan</option><option>Terlambat</option></select>`;
  } else if(reportState.type==='reservasi'){
    html += `<select class="form-select form-select-sm" id="reportStatus"><option value="">Semua Status</option><option>Menunggu</option><option>Siap Diambil</option><option>Selesai</option><option>Dibatalkan</option></select>`;
  }
  bar.innerHTML = html;
  const ds=document.getElementById('reportDateStart'), de=document.getElementById('reportDateEnd');
  if(ds) ds.addEventListener('change', e=>{ reportState.dateStart=e.target.value; renderReportTable(); });
  if(de) de.addEventListener('change', e=>{ reportState.dateEnd=e.target.value; renderReportTable(); });
  const cat=document.getElementById('reportCategory'); if(cat) cat.addEventListener('change', e=>{ reportState.category=e.target.value; renderReportTable(); });
  const st=document.getElementById('reportStatus'); if(st) st.addEventListener('change', e=>{ reportState.status=e.target.value; renderReportTable(); });
}
function inDateRange(dateStr, start, end){
  if(!dateStr) return !start && !end;
  if(start && dateStr < start) return false;
  if(end && dateStr > end) return false;
  return true;
}
function getReportData(){
  const s = reportState;
  if(s.type==='buku') return getBooks().filter(b => (!s.category || b.category===s.category) && (!s.status || bookStatus(b)===s.status));
  if(s.type==='anggota') return getMembers().filter(m => (!s.status || m.status===s.status) && inDateRange(m.registerDate, s.dateStart, s.dateEnd));
  if(s.type==='peminjaman') return getLoans().filter(l => (!s.status || loanStatus(l)===s.status) && inDateRange(l.loanDate, s.dateStart, s.dateEnd));
  if(s.type==='pengembalian') return getLoans().filter(l => l.returnDate && inDateRange(l.returnDate, s.dateStart, s.dateEnd));
  if(s.type==='reservasi') return (DB.get('library_reservations')||[]).filter(r => (!s.status || r.status===s.status) && inDateRange(r.reserveDate, s.dateStart, s.dateEnd));
  return [];
}
function reportColumns(){
  const s = reportState.type;
  if(s==='buku') return ['ID','Judul','Penulis','Kategori','Stok','Status'];
  if(s==='anggota') return ['ID','Nama','NIM/NIS','Jenis Kelamin','Status','Tgl Daftar'];
  if(s==='peminjaman') return ['ID','Anggota','Buku','Tgl Pinjam','Jatuh Tempo','Status'];
  if(s==='pengembalian') return ['ID','Anggota','Buku','Tgl Pinjam','Tgl Kembali','Terlambat','Denda'];
  if(s==='reservasi') return ['ID','Anggota','Buku','Tgl Reservasi','Status'];
  return [];
}
function reportRowValues(item){
  const s = reportState.type;
  if(s==='buku') return [item.id, item.title, item.author, item.category, item.stock, bookStatus(item)];
  if(s==='anggota') return [item.id, item.name, item.nis, item.gender==='L'?'Laki-laki':'Perempuan', item.status, formatDate(item.registerDate)];
  if(s==='peminjaman'){ const m=findMember(item.memberId), b=findBook(item.bookId); return [item.id, m?m.name:'-', b?b.title:'-', formatDate(item.loanDate), formatDate(item.dueDate), loanStatus(item)]; }
  if(s==='pengembalian'){ const m=findMember(item.memberId), b=findBook(item.bookId); return [item.id, m?m.name:'-', b?b.title:'-', formatDate(item.loanDate), formatDate(item.returnDate), item.lateDays+' hari', formatRupiah(item.fine)]; }
  if(s==='reservasi'){ const m=findMember(item.memberId), b=findBook(item.bookId); return [item.id, m?m.name:'-', b?b.title:'-', formatDate(item.reserveDate), item.status]; }
  return [];
}
function renderReportTable(){
  const data = getReportData();
  const cols = reportColumns();
  const table = document.getElementById('reportTable');
  if(!table) return;
  if(data.length===0){
    table.innerHTML = `<tbody><tr><td class="p-0">${emptyStateHtml('file-x','Tidak ada data','Tidak ada data yang sesuai dengan filter yang dipilih.')}</td></tr></tbody>`;
    refreshIcons(); return;
  }
  table.innerHTML = `<thead><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead>
    <tbody>${data.map(item=>`<tr>${reportRowValues(item).map((v,i)=>`<td class="${i===1?'cell-title':''} ${i===0?'mono':''}">${escapeHtml(v)}</td>`).join('')}</tr>`).join('')}</tbody>`;
}
function exportReportCsv(){
  const data = getReportData();
  if(data.length===0){ showToast('Tidak ada data untuk diekspor.', 'warning'); return; }
  const cols = reportColumns();
  const rows = [cols, ...data.map(reportRowValues)];
  const csv = rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\r\n');
  const blob = new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `laporan-${reportState.type}-${todayStr()}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  logActivity('Laporan', `Mengekspor laporan ${reportState.type} ke CSV.`);
  showToast('Laporan berhasil diekspor ke CSV.', 'success');
}

