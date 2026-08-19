/* ---------------------------- REFRESH ICON LUCIDE ---------------------------- */
function refreshIcons(){
  if(window.lucide && lucide.createIcons){ lucide.createIcons({ attrs:{ width:18, height:18, 'stroke-width':2 } }); }
}
document.addEventListener('DOMContentLoaded', refreshIcons);
refreshIcons();
const _iconObserver = new MutationObserver(debounce(refreshIcons, 30));
_iconObserver.observe(document.documentElement, { childList:true, subtree:true });

/* ---------------------------- TOAST ---------------------------- */
function showToast(message, type){
  type = type || 'success';
  const icons = {success:'check-circle', danger:'x-circle', warning:'alert-triangle', info:'info'};
  const colors = {success:'#16A34A', danger:'#DC2626', warning:'#D97706', info:'#0EA5E9'};
  const el = document.createElement('div');
  el.className = 'toast align-items-center border-0';
  el.setAttribute('role','alert');
  el.innerHTML = `<div class="toast-body"><i data-lucide="${icons[type]}" style="color:${colors[type]}"></i><span>${escapeHtml(message)}</span></div>`;
  document.getElementById('toastContainer').appendChild(el);
  const t = new bootstrap.Toast(el, {delay:3200});
  t.show();
  el.addEventListener('hidden.bs.toast', () => el.remove());
}

/* ---------------------------- CONFIRM MODAL ---------------------------- */
function confirmAction(opts){
  document.getElementById('confirmTitle').textContent = opts.title || 'Hapus data ini?';
  document.getElementById('confirmMessage').textContent = opts.message || 'Tindakan ini tidak dapat dibatalkan.';
  const modalEl = document.getElementById('confirmModal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  const oldBtn = document.getElementById('confirmActionBtn');
  const newBtn = oldBtn.cloneNode(true);
  oldBtn.parentNode.replaceChild(newBtn, oldBtn);
  newBtn.addEventListener('click', () => { opts.onConfirm(); modal.hide(); });
  modal.show();
}

/* ---------------------------- HELPER TAMPILAN ---------------------------- */
function emptyStateHtml(iconName, title, msg){
  return `<div class="empty-state">
    <div class="empty-icon">${icon(iconName)}</div>
    <h3>${title}</h3><p>${msg}</p>
  </div>`;
}
function paginate(list, page, perPage){
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total/perPage));
  page = Math.min(Math.max(1,page), totalPages);
  const start = (page-1)*perPage;
  return { items:list.slice(start, start+perPage), page, totalPages, total };
}
function paginationBarHtml(state, onPageAttr){
  if(state.total===0) return '';
  let btns='';
  for(let i=1;i<=state.totalPages;i++){
    if(state.totalPages>7 && i!==1 && i!==state.totalPages && Math.abs(i-state.page)>1){
      if(i===2||i===state.totalPages-1) btns+=`<span class="pg-btn" style="border:none;">…</span>`;
      continue;
    }
    btns+=`<button type="button" class="pg-btn ${i===state.page?'active':''}" data-${onPageAttr}="${i}">${i}</button>`;
  }
  return `<div class="pagination-bar">
    <div class="pg-info">Menampilkan ${state.items ? state.items.length : 0} dari ${state.total} data · Halaman ${state.page}/${state.totalPages}</div>
    <div class="pg-btns">
      <button type="button" class="pg-btn" data-${onPageAttr}="${state.page-1}" ${state.page<=1?'disabled':''}>${icon('chevron-left')}</button>
      ${btns}
      <button type="button" class="pg-btn" data-${onPageAttr}="${state.page+1}" ${state.page>=state.totalPages?'disabled':''}>${icon('chevron-right')}</button>
    </div>
  </div>`;
}

/* ---------------------------- TABS (sub-fitur dalam satu halaman) ---------------------------- */
function setupTabs(){
  document.querySelectorAll('[data-tab-btn]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('[data-tab-btn]').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('[data-tab-panel]').forEach(p=>p.classList.remove('active'));
      const target = document.querySelector(`[data-tab-panel="${btn.dataset.tabBtn}"]`);
      if(target) target.classList.add('active');
    });
  });
}

/* ---------------------------- SIDEBAR / TOPBAR ---------------------------- */
function applySessionToChrome(){
  const session = window.__SESSION__;
  if(!session) return;
  const avatarEl = document.getElementById('profileAvatar');
  const nameEl = document.getElementById('profileName');
  if(avatarEl) avatarEl.textContent = initials(session.name || session.email);
  if(nameEl) nameEl.textContent = session.name || session.email;
}
function initChrome(){
  applySessionToChrome();
  const sidebarEl = document.getElementById('sidebar');
  const backdropEl = document.getElementById('sidebarBackdrop');
  const toggleBtn = document.getElementById('sidebarToggle');
  if(toggleBtn){
    toggleBtn.addEventListener('click', ()=>{
      if(window.innerWidth < 992){
        sidebarEl.classList.toggle('show');
        backdropEl.classList.toggle('show');
      } else {
        document.querySelector('.app-wrapper').classList.toggle('sidebar-collapsed');
      }
    });
  }
  if(backdropEl){
    backdropEl.addEventListener('click', ()=>{ sidebarEl.classList.remove('show'); backdropEl.classList.remove('show'); });
  }

  const notifBtn = document.getElementById('notifBtn');
  const notifPanel = document.getElementById('notifPanel');
  if(notifBtn){
    notifBtn.addEventListener('click', (e)=>{
      e.stopPropagation();
      buildNotifPanel();
      notifPanel.style.display = notifPanel.style.display === 'block' ? 'none' : 'block';
    });
    document.addEventListener('click', (e)=>{
      if(!notifPanel.contains(e.target) && e.target !== notifBtn) notifPanel.style.display = 'none';
    });
  }

  const searchForm = document.getElementById('globalSearchForm');
  if(searchForm){
    searchForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const q = document.getElementById('globalSearch').value.trim();
      if(q) window.location.href = 'books.html?q=' + encodeURIComponent(q);
    });
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if(logoutBtn){
    logoutBtn.addEventListener('click', (e)=>{ e.preventDefault(); if(window.AUTH) AUTH.logout(); });
  }
}
function buildNotifPanel(){
  const loans = getLoans().filter(l=>loanStatus(l)==='Terlambat');
  const list = document.getElementById('notifList');
  const dot = document.getElementById('notifDot');
  if(!list) return;
  dot.style.display = loans.length ? 'block' : 'none';
  if(!loans.length){
    list.innerHTML = `<div class="text-center text-muted py-4" style="font-size:.8rem;">Tidak ada notifikasi baru.</div>`;
    return;
  }
  list.innerHTML = loans.map(l=>{
    const book = findBook(l.bookId), member = findMember(l.memberId);
    return `<div class="icon-text" style="padding:.75rem 1.1rem;border-bottom:1px solid var(--border);align-items:flex-start;">
      ${icon('alert-triangle', 'style="color:var(--danger);margin-top:.15rem;"')}
      <div style="line-height:1.35;">
        <div style="font-weight:700;font-size:.8rem;">${escapeHtml(member ? member.name : '-')} terlambat mengembalikan</div>
        <div style="font-size:.74rem;color:var(--text-muted);">${escapeHtml(book ? book.title : '-')} · jatuh tempo ${formatDate(l.dueDate)}</div>
      </div>
    </div>`;
  }).join('');
}

