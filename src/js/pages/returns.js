/* ---------------------------- MODUL: PENGEMBALIAN ---------------------------- */
let returnsState = { search:'', filter:'aktif', page:1, perPage:8 };
function initReturnsPage(){
  document.getElementById('returnSearchInput').addEventListener('input', debounce(e=>{ returnsState.search=e.target.value.toLowerCase(); returnsState.page=1; updateReturnsTable(); }, 250));
  document.getElementById('returnFilterSelect').addEventListener('change', e=>{ returnsState.filter=e.target.value; returnsState.page=1; updateReturnsTable(); });
  document.getElementById('returnDateInput').addEventListener('change', updateReturnCalc);
  document.getElementById('confirmReturnBtn').addEventListener('click', handleConfirmReturn);
  updateReturnsTable();
}
function updateReturnsTable(){
  let list = getLoans().map(l=>({...l, _status:loanStatus(l), _member:findMember(l.memberId), _book:findBook(l.bookId)}))
    .filter(l=>{
      const matchSearch = !returnsState.search || ((l._member?l._member.name:'')+' '+(l._book?l._book.title:'')).toLowerCase().includes(returnsState.search);
      let matchFilter = true;
      if(returnsState.filter==='aktif') matchFilter = l._status!=='Dikembalikan';
      if(returnsState.filter==='dikembalikan') matchFilter = l._status==='Dikembalikan';
      return matchSearch && matchFilter;
    })
    .sort((a,b)=>{
      if(a._status==='Dikembalikan' && b._status!=='Dikembalikan') return 1;
      if(a._status!=='Dikembalikan' && b._status==='Dikembalikan') return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  const state = paginate(list, returnsState.page, returnsState.perPage);
  const tbody = document.getElementById('returnsTbody');
  const pag = document.getElementById('returnsPagination');
  if(state.total===0){
    tbody.innerHTML = `<tr><td colspan="10" class="p-0">${emptyStateHtml('package','Tidak ada data pengembalian','Semua buku sudah dikembalikan tepat waktu, atau belum ada transaksi.')}</td></tr>`;
    pag.innerHTML=''; refreshIcons(); return;
  }
  tbody.innerHTML = state.items.map(l=>{
    const settings=getSettings();
    const preview = !l.returnDate ? calcFine(l.dueDate, todayStr(), settings.finePerDay) : null;
    return `<tr>
      <td class="mono">${l.id}</td>
      <td>${escapeHtml(l._member?l._member.name:'-')}</td>
      <td class="cell-title">${escapeHtml(l._book?l._book.title:'-')}</td>
      <td>${formatDate(l.loanDate)}</td>
      <td>${formatDate(l.dueDate)}</td>
      <td>${l.returnDate ? formatDate(l.returnDate) : '<span class="cell-sub">Belum kembali</span>'}</td>
      <td>${l.returnDate ? l.lateDays+' hari' : (preview.lateDays>0 ? preview.lateDays+' hari (berjalan)' : '-')}</td>
      <td>${formatRupiah(l.returnDate ? l.fine : preview.fine)}</td>
      <td>${loanStatusBadge(l._status)}</td>
      <td>${l._status!=='Dikembalikan' ? `<span class="btn-icon-sm" title="Proses Pengembalian" onclick="openReturnModal('${l.id}')">${icon('corner-down-left')}</span>` : `<span class="btn-icon-sm" title="Detail" onclick="openLoanDetail('${l.id}')">${icon('eye')}</span>`}</td>
    </tr>`;
  }).join('');
  pag.innerHTML = paginationBarHtml(state, 'returnpage');
  pag.querySelectorAll('[data-returnpage]').forEach(btn=>btn.addEventListener('click', ()=>{ returnsState.page=parseInt(btn.dataset.returnpage); updateReturnsTable(); }));
  refreshIcons();
}
function openLoanDetail(id){
  const l = getLoans().find(x=>x.id===id);
  const member = findMember(l.memberId), book = findBook(l.bookId);
  const status = loanStatus(l);
  document.getElementById('detailModalTitle').textContent = 'Detail Peminjaman';
  document.getElementById('detailModalBody').innerHTML = `
    <div class="d-flex align-items-center justify-content-between mb-3">
      <span class="badge-soft b-slate mono">${icon('hash')}${l.id}</span>${loanStatusBadge(status)}
    </div>
    <div class="detail-row"><span class="k">Anggota</span><span class="v">${escapeHtml(member?member.name:'-')}</span></div>
    <div class="detail-row"><span class="k">Buku</span><span class="v">${escapeHtml(book?book.title:'-')}</span></div>
    <div class="detail-row"><span class="k">Tanggal Pinjam</span><span class="v">${formatDate(l.loanDate)}</span></div>
    <div class="detail-row"><span class="k">Jatuh Tempo</span><span class="v">${formatDate(l.dueDate)}</span></div>
    ${l.returnDate ? `<div class="detail-row"><span class="k">Tanggal Kembali</span><span class="v">${formatDate(l.returnDate)}</span></div>
    <div class="detail-row"><span class="k">Keterlambatan</span><span class="v">${l.lateDays} hari</span></div>
    <div class="detail-row"><span class="k">Denda</span><span class="v">${formatRupiah(l.fine)}</span></div>` : ''}
  `;
  bootstrap.Modal.getOrCreateInstance(document.getElementById('detailModal')).show();
  refreshIcons();
}
function openReturnModal(loanId){
  const l = getLoans().find(x=>x.id===loanId);
  const member = findMember(l.memberId), book = findBook(l.bookId);
  document.getElementById('returnLoanId').value = loanId;
  document.getElementById('returnMemberName').textContent = member?member.name:'-';
  document.getElementById('returnBookTitle').textContent = book?book.title:'-';
  document.getElementById('returnLoanDate').textContent = formatDate(l.loanDate);
  document.getElementById('returnDueDate').textContent = formatDate(l.dueDate);
  const dateInput = document.getElementById('returnDateInput');
  dateInput.value = todayStr();
  dateInput.min = l.loanDate;
  updateReturnCalc();
  bootstrap.Modal.getOrCreateInstance(document.getElementById('returnModal')).show();
}
function updateReturnCalc(){
  const loanId = document.getElementById('returnLoanId').value;
  const l = getLoans().find(x=>x.id===loanId);
  if(!l) return;
  const settings = getSettings();
  const retDate = document.getElementById('returnDateInput').value;
  const f = calcFine(l.dueDate, retDate, settings.finePerDay);
  document.getElementById('returnLateDays').textContent = f.lateDays + ' hari';
  document.getElementById('returnFineAmount').textContent = formatRupiah(f.fine);
}
function handleConfirmReturn(){
  const loanId = document.getElementById('returnLoanId').value;
  const retDate = document.getElementById('returnDateInput').value;
  if(!retDate){ showToast('Tanggal pengembalian wajib diisi.', 'danger'); return; }
  const loans = getLoans();
  const idx = loans.findIndex(x=>x.id===loanId);
  const l = loans[idx];
  const settings = getSettings();
  const f = calcFine(l.dueDate, retDate, settings.finePerDay);
  loans[idx] = {...l, returnDate:retDate, lateDays:f.lateDays, fine:f.fine};
  setLoans(loans);
  const books = getBooks();
  const book = books.find(b=>b.id===l.bookId);
  if(book){ book.stock += 1; setBooks(books); }
  showToast('Buku berhasil dikembalikan.', 'success');
  logActivity('Pengembalian', `Buku dari transaksi ${l.id} berhasil dikembalikan.`);
  bootstrap.Modal.getInstance(document.getElementById('returnModal')).hide();
  if(typeof updateReturnsTable==='function') updateReturnsTable();
  if(typeof updateLoansTable==='function') updateLoansTable();
}

