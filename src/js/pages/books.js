/* ---------------------------- MODUL: DATA BUKU ---------------------------- */
let booksState = { search:'', category:'', status:'', page:1, perPage:8 };
function initBooksPage(){
  const params = new URLSearchParams(window.location.search);
  if(params.get('q')) booksState.search = params.get('q');
  const categories = [...new Set(getBooks().map(b=>b.category))].sort();
  const catFilter = document.getElementById('bookCategoryFilter');
  catFilter.innerHTML = '<option value="">Semua Kategori</option>' + categories.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  document.getElementById('bookSearchInput').value = booksState.search;
  document.getElementById('bookSearchInput').addEventListener('input', debounce(e=>{ booksState.search=e.target.value.toLowerCase(); booksState.page=1; updateBooksTable(); }, 250));
  catFilter.addEventListener('change', e=>{ booksState.category=e.target.value; booksState.page=1; updateBooksTable(); });
  document.getElementById('bookStatusFilter').addEventListener('change', e=>{ booksState.status=e.target.value; booksState.page=1; updateBooksTable(); });
  document.getElementById('btnAddBook').addEventListener('click', ()=>openBookModal(null));
  document.getElementById('bookForm').addEventListener('submit', handleBookFormSubmit);
  updateBooksTable();
}
function updateBooksTable(){
  let list = getBooks().filter(b=>{
    const matchSearch = !booksState.search || (b.title+' '+b.author+' '+b.isbn).toLowerCase().includes(booksState.search);
    const matchCat = !booksState.category || b.category===booksState.category;
    const matchStatus = !booksState.status || bookStatus(b)===booksState.status;
    return matchSearch && matchCat && matchStatus;
  }).sort((a,b)=>a.title.localeCompare(b.title));

  const state = paginate(list, booksState.page, booksState.perPage);
  const tbody = document.getElementById('booksTbody');
  const pag = document.getElementById('booksPagination');
  if(!tbody) return;
  if(state.total===0){
    tbody.innerHTML = `<tr><td colspan="8" class="p-0">${emptyStateHtml('book-x','Buku tidak ditemukan','Coba ubah kata kunci pencarian atau filter yang digunakan.')}</td></tr>`;
    pag.innerHTML=''; refreshIcons(); return;
  }
  tbody.innerHTML = state.items.map(b=>{
    const status = bookStatus(b);
    return `<tr>
      <td>
        <div class="icon-text">
          <span class="avatar-sm">${icon(categoryIcon(b.category))}</span>
          <div><div class="cell-title">${escapeHtml(b.title)}</div><div class="cell-sub">${escapeHtml(b.author)}</div></div>
        </div>
      </td>
      <td class="mono cell-sub">${escapeHtml(b.isbn)}</td>
      <td>${escapeHtml(b.publisher)}</td>
      <td>${b.year}</td>
      <td><span class="badge-soft b-primary">${icon(categoryIcon(b.category))}${escapeHtml(b.category)}</span></td>
      <td class="mono">${b.stock}</td>
      <td>${bookStatusBadge(status)}</td>
      <td>
        <div class="row-actions">
          <span class="btn-icon-sm" title="Detail" onclick="openBookDetail('${b.id}')">${icon('eye')}</span>
          <span class="btn-icon-sm" title="Edit" onclick="openBookModal('${b.id}')">${icon('pencil')}</span>
          <span class="btn-icon-sm danger" title="Hapus" onclick="deleteBook('${b.id}')">${icon('trash-2')}</span>
        </div>
      </td>
    </tr>`;
  }).join('');
  pag.innerHTML = paginationBarHtml(state, 'bookpage');
  pag.querySelectorAll('[data-bookpage]').forEach(btn=>btn.addEventListener('click', ()=>{ booksState.page = parseInt(btn.dataset.bookpage); updateBooksTable(); }));
  refreshIcons();
}
function openBookModal(id){
  const form = document.getElementById('bookForm');
  form.classList.remove('was-validated');
  form.reset();
  document.getElementById('bookId').value = id || '';
  document.getElementById('bookModalTitle').textContent = id ? 'Edit Buku' : 'Tambah Buku';
  const catSelect = document.getElementById('bookCategory');
  catSelect.innerHTML = '<option value="">Pilih kategori</option>' + categoryOptions().map(o=>`<option value="${escapeHtml(o.value)}">${escapeHtml(o.label)}</option>`).join('');
  const pubList = document.getElementById('publisherSuggestions');
  if(pubList) pubList.innerHTML = (DB.get('library_publishers')||[]).map(p=>`<option value="${escapeHtml(p.name)}">`).join('');
  const shelfList = document.getElementById('shelfSuggestions');
  if(shelfList) shelfList.innerHTML = (DB.get('library_shelves')||[]).map(s=>`<option value="${escapeHtml(s.code)}">`).join('');
  if(id){
    const b = findBook(id);
    document.getElementById('bookIsbn').value = b.isbn;
    document.getElementById('bookCategory').value = b.category;
    document.getElementById('bookTitle').value = b.title;
    document.getElementById('bookAuthor').value = b.author;
    document.getElementById('bookPublisher').value = b.publisher;
    document.getElementById('bookYear').value = b.year;
    document.getElementById('bookStock').value = b.stock;
    document.getElementById('bookLocation').value = b.location;
    document.getElementById('bookManualStatus').value = b.manualStatus || '';
    document.getElementById('bookDescription').value = b.description || '';
  }
  bootstrap.Modal.getOrCreateInstance(document.getElementById('bookModal')).show();
}
function handleBookFormSubmit(e){
  e.preventDefault(); e.stopPropagation();
  const form = e.target;
  if(!form.checkValidity()){ form.classList.add('was-validated'); return; }
  const id = document.getElementById('bookId').value;
  const books = getBooks();
  const payload = {
    isbn: document.getElementById('bookIsbn').value.trim(),
    category: document.getElementById('bookCategory').value,
    title: document.getElementById('bookTitle').value.trim(),
    author: document.getElementById('bookAuthor').value.trim(),
    publisher: document.getElementById('bookPublisher').value.trim(),
    year: parseInt(document.getElementById('bookYear').value),
    stock: parseInt(document.getElementById('bookStock').value),
    location: document.getElementById('bookLocation').value.trim(),
    manualStatus: document.getElementById('bookManualStatus').value || null,
    description: document.getElementById('bookDescription').value.trim()
  };
  if(id){
    const idx = books.findIndex(b=>b.id===id);
    books[idx] = {...books[idx], ...payload};
    showToast('Data buku berhasil diperbarui.', 'success');
    logActivity('Buku', `Memperbarui data buku "${payload.title}".`);
  } else {
    payload.id = uid('BK', books);
    books.push(payload);
    showToast('Data buku berhasil ditambahkan.', 'success');
    logActivity('Buku', `Menambahkan buku baru "${payload.title}".`);
  }
  setBooks(books);
  bootstrap.Modal.getInstance(document.getElementById('bookModal')).hide();
  updateBooksTable();
}
function deleteBook(id){
  const book = findBook(id);
  const hasActiveLoan = getLoans().some(l=>l.bookId===id && loanStatus(l)!=='Dikembalikan');
  if(hasActiveLoan){ showToast('Buku tidak dapat dihapus karena masih dalam peminjaman aktif.', 'danger'); return; }
  confirmAction({
    title:'Hapus buku ini?',
    message:`"${book.title}" akan dihapus permanen dari data koleksi.`,
    onConfirm(){
      setBooks(getBooks().filter(b=>b.id!==id));
      showToast('Data buku berhasil dihapus.', 'success');
      logActivity('Buku', `Menghapus buku "${book.title}".`);
      updateBooksTable();
    }
  });
}
function openBookDetail(id){
  const b = findBook(id);
  const status = bookStatus(b);
  const history = getLoans().filter(l=>l.bookId===id).sort((a,b2)=>b2.loanDate.localeCompare(a.loanDate));
  const [c1,c2] = CATEGORY_COLORS[b.category] || ['#64748B','#1E293B'];
  document.getElementById('detailModalTitle').textContent = 'Detail Buku';
  document.getElementById('detailModalBody').innerHTML = `
    <div class="row g-4">
      <div class="col-md-4">
        <div class="book-cover" style="--c1:${c1};--c2:${c2};">
          <div class="cover-icon">${icon(categoryIcon(b.category))}</div>
          <div class="cover-txt">${escapeHtml(b.title)}</div>
        </div>
      </div>
      <div class="col-md-8">
        <div class="d-flex align-items-center gap-2 mb-2">${bookStatusBadge(status)}<span class="badge-soft b-primary">${icon(categoryIcon(b.category))}${escapeHtml(b.category)}</span></div>
        <h4 class="fw-bold mb-1">${escapeHtml(b.title)}</h4>
        <p class="text-muted mb-3" style="font-size:.85rem;">${escapeHtml(b.description||'Tidak ada deskripsi.')}</p>
        <div class="detail-row"><span class="k">ISBN</span><span class="v mono">${escapeHtml(b.isbn)}</span></div>
        <div class="detail-row"><span class="k">Penulis</span><span class="v">${escapeHtml(b.author)}</span></div>
        <div class="detail-row"><span class="k">Penerbit</span><span class="v">${escapeHtml(b.publisher)}</span></div>
        <div class="detail-row"><span class="k">Tahun Terbit</span><span class="v">${b.year}</span></div>
        <div class="detail-row"><span class="k">Lokasi Rak</span><span class="v">${escapeHtml(b.location)}</span></div>
        <div class="detail-row"><span class="k">Stok</span><span class="v">${b.stock}</span></div>
      </div>
      <div class="col-12">
        <h6 class="fw-bold mb-2 icon-text">${icon('history')}Riwayat Peminjaman</h6>
        ${history.length ? `<div class="table-responsive-modern"><table class="table table-modern mb-0"><thead><tr><th>Anggota</th><th>Tgl Pinjam</th><th>Jatuh Tempo</th><th>Status</th></tr></thead><tbody>
          ${history.map(l=>`<tr><td>${escapeHtml((findMember(l.memberId)||{}).name||'-')}</td><td>${formatDate(l.loanDate)}</td><td>${formatDate(l.dueDate)}</td><td>${loanStatusBadge(loanStatus(l))}</td></tr>`).join('')}
        </tbody></table></div>` : `<p class="text-muted" style="font-size:.83rem;">Belum pernah dipinjam.</p>`}
      </div>
    </div>
  `;
  bootstrap.Modal.getOrCreateInstance(document.getElementById('detailModal')).show();
  refreshIcons();
}

