/* ---------------------------- MODUL: STATUS BUKU ---------------------------- */
let statusState = { filter:'', page:1, perPage:8 };
function initStatusPage(){
  renderStatusCards();
  document.getElementById('statusFilterSelect').addEventListener('change', e=>{ statusState.filter=e.target.value; statusState.page=1; updateStatusTable(); });
  updateStatusTable();
}
function renderStatusCards(){
  const books = getBooks();
  const loans = getLoans();
  const counts = {
    Tersedia: books.filter(b=>bookStatus(b)==='Tersedia').length,
    Dipinjam: books.filter(b=>bookStatus(b)==='Dipinjam').length,
    Terlambat: loans.filter(l=>loanStatus(l)==='Terlambat').length,
    Rusak: books.filter(b=>bookStatus(b)==='Rusak').length,
    Hilang: books.filter(b=>bookStatus(b)==='Hilang').length
  };
  const cards = [
    {label:'Buku Tersedia', value:counts.Tersedia, iconName:'check-circle', color:'success'},
    {label:'Sedang Dipinjam', value:counts.Dipinjam, iconName:'repeat', color:'warning'},
    {label:'Terlambat', value:counts.Terlambat, iconName:'alert-triangle', color:'danger'},
    {label:'Rusak', value:counts.Rusak, iconName:'octagon-x', color:'slate'},
    {label:'Hilang', value:counts.Hilang, iconName:'help-circle', color:'info'}
  ];
  const colorVar = {info:'var(--info)', success:'var(--success)', warning:'var(--warning)', danger:'var(--danger)', slate:'var(--slate)'};
  const colorBg = {info:'var(--info-light)', success:'var(--success-light)', warning:'var(--warning-light)', danger:'var(--danger-light)', slate:'var(--slate-light)'};
  document.getElementById('statusCards').innerHTML = cards.map(c=>`
    <div class="col-6 col-lg">
      <div class="stat-card">
        <div class="stat-icon" style="background:${colorBg[c.color]};color:${colorVar[c.color]};">${icon(c.iconName)}</div>
        <div><div class="stat-value">${c.value}</div><div class="stat-label">${c.label}</div></div>
      </div>
    </div>`).join('');
  refreshIcons();
}
function updateStatusTable(){
  const tbody = document.getElementById('statusTbody');
  if(!tbody) return;
  let list = getBooks().filter(b=> !statusState.filter || bookStatus(b)===statusState.filter).sort((a,b)=>a.title.localeCompare(b.title));
  const state = paginate(list, statusState.page, statusState.perPage);
  const pag = document.getElementById('statusPagination');
  if(state.total===0){
    tbody.innerHTML = `<tr><td colspan="6" class="p-0">${emptyStateHtml('clipboard-x','Tidak ada data','Tidak ada buku dengan status tersebut.')}</td></tr>`;
    pag.innerHTML=''; refreshIcons(); return;
  }
  tbody.innerHTML = state.items.map(b=>{
    const activeBorrow = getLoans().filter(l=>l.bookId===b.id && loanStatus(l)!=='Dikembalikan').length;
    return `<tr>
      <td class="cell-title">${escapeHtml(b.title)}</td>
      <td><span class="badge-soft b-primary">${icon(categoryIcon(b.category))}${escapeHtml(b.category)}</span></td>
      <td class="mono">${b.stock}</td>
      <td class="mono">${activeBorrow}</td>
      <td>${bookStatusBadge(bookStatus(b))}</td>
      <td class="cell-sub">${escapeHtml(b.location)}</td>
    </tr>`;
  }).join('');
  pag.innerHTML = paginationBarHtml(state, 'statuspage');
  pag.querySelectorAll('[data-statuspage]').forEach(btn=>btn.addEventListener('click', ()=>{ statusState.page=parseInt(btn.dataset.statuspage); updateStatusTable(); }));
  refreshIcons();
}

