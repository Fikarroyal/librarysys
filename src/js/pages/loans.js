/* ---------------------------- MODUL: PEMINJAMAN ---------------------------- */
let loansState = { search:'', status:'', page:1, perPage:8 };
function initLoansPage(){
  document.getElementById('loanSearchInput').addEventListener('input', debounce(e=>{ loansState.search=e.target.value.toLowerCase(); loansState.page=1; updateLoansTable(); }, 250));
  document.getElementById('loanStatusFilter').addEventListener('change', e=>{ loansState.status=e.target.value; loansState.page=1; updateLoansTable(); });
  document.getElementById('btnAddLoan').addEventListener('click', openLoanModal);
  document.getElementById('loanForm').addEventListener('submit', handleLoanFormSubmit);
  document.getElementById('loanDate').addEventListener('change', function(){
    const settings = getSettings();
    document.getElementById('loanDueDate').value = new Date(new Date(this.value).getTime() + settings.maxLoanDays*86400000).toISOString().slice(0,10);
  });
  updateLoansTable();
}
function updateLoansTable(){
  let list = getLoans().map(l=>({...l, _status:loanStatus(l), _member:findMember(l.memberId), _book:findBook(l.bookId)}))
    .filter(l=>{
      const matchSearch = !loansState.search || ((l._member?l._member.name:'')+' '+(l._book?l._book.title:'')).toLowerCase().includes(loansState.search);
      const matchStatus = !loansState.status || l._status===loansState.status;
      return matchSearch && matchStatus;
    }).sort((a,b)=>b.loanDate.localeCompare(a.loanDate));
  const state = paginate(list, loansState.page, loansState.perPage);
  const tbody = document.getElementById('loansTbody');
  const pag = document.getElementById('loansPagination');
  if(state.total===0){
    tbody.innerHTML = `<tr><td colspan="7" class="p-0">${emptyStateHtml('inbox','Tidak ada transaksi peminjaman','Coba ubah kata kunci pencarian atau filter status.')}</td></tr>`;
    pag.innerHTML=''; refreshIcons(); return;
  }
  tbody.innerHTML = state.items.map(l=>`
    <tr>
      <td class="mono">${l.id}</td>
      <td>${escapeHtml(l._member?l._member.name:'-')}</td>
      <td class="cell-title">${escapeHtml(l._book?l._book.title:'-')}</td>
      <td>${formatDate(l.loanDate)}</td>
      <td>${formatDate(l.dueDate)}</td>
      <td>${loanStatusBadge(l._status)}</td>
      <td><div class="row-actions">
        <span class="btn-icon-sm" title="Detail" onclick="openLoanDetail('${l.id}')">${icon('eye')}</span>
      </div></td>
    </tr>`).join('');
  pag.innerHTML = paginationBarHtml(state, 'loanpage');
  pag.querySelectorAll('[data-loanpage]').forEach(btn=>btn.addEventListener('click', ()=>{ loansState.page=parseInt(btn.dataset.loanpage); updateLoansTable(); }));
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
function openLoanModal(){
  const form = document.getElementById('loanForm');
  form.classList.remove('was-validated'); form.reset();
  const settings = getSettings();
  const memberSel = document.getElementById('loanMember');
  const bookSel = document.getElementById('loanBook');
  memberSel.innerHTML = '<option value="">Pilih anggota</option>' +
    getMembers().filter(m=>m.status==='Aktif').map(m=>`<option value="${m.id}">${escapeHtml(m.name)} (${escapeHtml(m.nis)})</option>`).join('');
  bookSel.innerHTML = '<option value="">Pilih buku (stok tersedia)</option>' +
    getBooks().filter(b=>bookStatus(b)==='Tersedia').map(b=>`<option value="${b.id}">${escapeHtml(b.title)} — stok: ${b.stock}</option>`).join('');
  document.getElementById('loanDate').value = todayStr();
  document.getElementById('loanDueDate').value = daysFromNow(settings.maxLoanDays);
  document.getElementById('loanBookStockInfo').textContent = `Maks. ${settings.maxBooksPerMember} buku aktif per anggota · durasi standar ${settings.maxLoanDays} hari.`;
  bootstrap.Modal.getOrCreateInstance(document.getElementById('loanModal')).show();
}
function handleLoanFormSubmit(e){
  e.preventDefault(); e.stopPropagation();
  const form = e.target;
  if(!form.checkValidity()){ form.classList.add('was-validated'); return; }
  const memberId = document.getElementById('loanMember').value;
  const bookId = document.getElementById('loanBook').value;
  const loanDate = document.getElementById('loanDate').value;
  const dueDate = document.getElementById('loanDueDate').value;
  const settings = getSettings();
  const books = getBooks();
  const book = books.find(b=>b.id===bookId);
  if(!book || book.stock<=0){ showToast('Stok buku tidak tersedia.', 'danger'); return; }
  const activeCount = getLoans().filter(l=>l.memberId===memberId && loanStatus(l)!=='Dikembalikan').length;
  if(activeCount >= settings.maxBooksPerMember){ showToast(`Anggota sudah mencapai batas maksimal ${settings.maxBooksPerMember} buku dipinjam.`, 'danger'); return; }
  const loans = getLoans();
  const newLoan = { id:uid('PJ', loans), bookId, memberId, loanDate, dueDate, returnDate:null, lateDays:0, fine:0 };
  loans.push(newLoan);
  setLoans(loans);
  book.stock -= 1;
  setBooks(books);
  showToast('Peminjaman berhasil dibuat.', 'success');
  logActivity('Peminjaman', `Peminjaman baru ${newLoan.id} dibuat.`);
  bootstrap.Modal.getInstance(document.getElementById('loanModal')).hide();
  updateLoansTable();
}

