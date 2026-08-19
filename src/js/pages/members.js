/* ---------------------------- MODUL: DATA ANGGOTA ---------------------------- */
let membersState = { search:'', status:'', page:1, perPage:8 };
function initMembersPage(){
  document.getElementById('memberSearchInput').addEventListener('input', debounce(e=>{ membersState.search=e.target.value.toLowerCase(); membersState.page=1; updateMembersTable(); }, 250));
  document.getElementById('memberStatusFilter').addEventListener('change', e=>{ membersState.status=e.target.value; membersState.page=1; updateMembersTable(); });
  document.getElementById('btnAddMember').addEventListener('click', ()=>openMemberModal(null));
  document.getElementById('memberForm').addEventListener('submit', handleMemberFormSubmit);
  updateMembersTable();
}
function updateMembersTable(){
  let list = getMembers().filter(m=>{
    const matchSearch = !membersState.search || (m.name+' '+m.nis+' '+m.email).toLowerCase().includes(membersState.search);
    const matchStatus = !membersState.status || m.status===membersState.status;
    return matchSearch && matchStatus;
  }).sort((a,b)=>a.name.localeCompare(b.name));
  const state = paginate(list, membersState.page, membersState.perPage);
  const tbody = document.getElementById('membersTbody');
  const pag = document.getElementById('membersPagination');
  if(state.total===0){
    tbody.innerHTML = `<tr><td colspan="7" class="p-0">${emptyStateHtml('user-x','Anggota tidak ditemukan','Coba ubah kata kunci pencarian atau filter status.')}</td></tr>`;
    pag.innerHTML=''; refreshIcons(); return;
  }
  tbody.innerHTML = state.items.map(m=>`
    <tr>
      <td><div class="icon-text"><span class="avatar-sm">${initials(m.name)}</span><div><div class="cell-title">${escapeHtml(m.name)}</div><div class="cell-sub">${escapeHtml(m.email)}</div></div></div></td>
      <td class="mono">${escapeHtml(m.nis)}</td>
      <td>${m.gender==='L'?'Laki-laki':'Perempuan'}</td>
      <td class="cell-sub">${escapeHtml(m.phone)}</td>
      <td>${formatDate(m.registerDate)}</td>
      <td>${memberStatusBadge(m.status)}</td>
      <td><div class="row-actions">
        <span class="btn-icon-sm" title="Detail" onclick="openMemberDetail('${m.id}')">${icon('eye')}</span>
        <span class="btn-icon-sm" title="Edit" onclick="openMemberModal('${m.id}')">${icon('pencil')}</span>
        <span class="btn-icon-sm danger" title="Hapus" onclick="deleteMember('${m.id}')">${icon('trash-2')}</span>
      </div></td>
    </tr>`).join('');
  pag.innerHTML = paginationBarHtml(state, 'memberpage');
  pag.querySelectorAll('[data-memberpage]').forEach(btn=>btn.addEventListener('click', ()=>{ membersState.page=parseInt(btn.dataset.memberpage); updateMembersTable(); }));
  refreshIcons();
}
function openMemberModal(id){
  const form = document.getElementById('memberForm');
  form.classList.remove('was-validated'); form.reset();
  document.getElementById('memberId').value = id || '';
  document.getElementById('memberModalTitle').textContent = id ? 'Edit Anggota' : 'Tambah Anggota';
  if(id){
    const m = findMember(id);
    document.getElementById('memberName').value = m.name;
    document.getElementById('memberNis').value = m.nis;
    document.getElementById('memberGender').value = m.gender;
    document.getElementById('memberEmail').value = m.email;
    document.getElementById('memberPhone').value = m.phone;
    document.getElementById('memberAddress').value = m.address;
    document.getElementById('memberRegisterDate').value = m.registerDate;
    document.getElementById('memberStatus').value = m.status;
  } else {
    document.getElementById('memberRegisterDate').value = todayStr();
  }
  bootstrap.Modal.getOrCreateInstance(document.getElementById('memberModal')).show();
}
function handleMemberFormSubmit(e){
  e.preventDefault(); e.stopPropagation();
  const form = e.target;
  if(!form.checkValidity()){ form.classList.add('was-validated'); return; }
  const id = document.getElementById('memberId').value;
  const members = getMembers();
  const payload = {
    name: document.getElementById('memberName').value.trim(),
    nis: document.getElementById('memberNis').value.trim(),
    gender: document.getElementById('memberGender').value,
    email: document.getElementById('memberEmail').value.trim(),
    phone: document.getElementById('memberPhone').value.trim(),
    address: document.getElementById('memberAddress').value.trim(),
    registerDate: document.getElementById('memberRegisterDate').value,
    status: document.getElementById('memberStatus').value
  };
  if(id){
    const idx = members.findIndex(m=>m.id===id);
    members[idx] = {...members[idx], ...payload};
    showToast('Data anggota berhasil diperbarui.', 'success');
    logActivity('Anggota', `Memperbarui data anggota "${payload.name}".`);
  } else {
    payload.id = uid('AG', members);
    members.push(payload);
    showToast('Data anggota berhasil ditambahkan.', 'success');
    logActivity('Anggota', `Menambahkan anggota baru "${payload.name}".`);
  }
  setMembers(members);
  bootstrap.Modal.getInstance(document.getElementById('memberModal')).hide();
  updateMembersTable();
}
function deleteMember(id){
  const member = findMember(id);
  const hasActiveLoan = getLoans().some(l=>l.memberId===id && loanStatus(l)!=='Dikembalikan');
  if(hasActiveLoan){ showToast('Anggota tidak dapat dihapus karena masih memiliki peminjaman aktif.', 'danger'); return; }
  confirmAction({
    title:'Hapus anggota ini?',
    message:`Data "${member.name}" akan dihapus permanen.`,
    onConfirm(){
      setMembers(getMembers().filter(m=>m.id!==id));
      showToast('Data anggota berhasil dihapus.', 'success');
      logActivity('Anggota', `Menghapus anggota "${member.name}".`);
      updateMembersTable();
    }
  });
}
function openMemberDetail(id){
  const m = findMember(id);
  const loans = getLoans().filter(l=>l.memberId===id).sort((a,b)=>b.loanDate.localeCompare(a.loanDate));
  const activeLoans = loans.filter(l=>loanStatus(l)!=='Dikembalikan');
  document.getElementById('detailModalTitle').textContent = 'Detail Anggota';
  document.getElementById('detailModalBody').innerHTML = `
    <div class="d-flex align-items-center gap-3 mb-3">
      <div class="avatar-lg">${initials(m.name)}</div>
      <div>
        <h4 class="fw-bold mb-1">${escapeHtml(m.name)}</h4>
        <div class="d-flex align-items-center gap-2">${memberStatusBadge(m.status)}<span class="badge-soft b-slate mono">${icon('id-card')}${escapeHtml(m.nis)}</span></div>
      </div>
    </div>
    <div class="row g-3 mb-3">
      <div class="col-md-6">
        <div class="detail-row"><span class="k">Email</span><span class="v">${escapeHtml(m.email)}</span></div>
        <div class="detail-row"><span class="k">Telepon</span><span class="v">${escapeHtml(m.phone)}</span></div>
        <div class="detail-row"><span class="k">Alamat</span><span class="v">${escapeHtml(m.address)}</span></div>
        <div class="detail-row"><span class="k">Tanggal Daftar</span><span class="v">${formatDate(m.registerDate)}</span></div>
      </div>
      <div class="col-md-6">
        <div class="detail-row"><span class="k">Total Pernah Dipinjam</span><span class="v">${loans.length} buku</span></div>
        <div class="detail-row"><span class="k">Sedang Dipinjam</span><span class="v">${activeLoans.length} buku</span></div>
      </div>
    </div>
    <h6 class="fw-bold mb-2 icon-text">${icon('history')}Riwayat Peminjaman</h6>
    ${loans.length ? `<div class="table-responsive-modern"><table class="table table-modern mb-0"><thead><tr><th>Buku</th><th>Tgl Pinjam</th><th>Jatuh Tempo</th><th>Status</th></tr></thead><tbody>
      ${loans.map(l=>`<tr><td>${escapeHtml((findBook(l.bookId)||{}).title||'-')}</td><td>${formatDate(l.loanDate)}</td><td>${formatDate(l.dueDate)}</td><td>${loanStatusBadge(loanStatus(l))}</td></tr>`).join('')}
    </tbody></table></div>` : `<p class="text-muted" style="font-size:.83rem;">Belum pernah meminjam buku.</p>`}
  `;
  bootstrap.Modal.getOrCreateInstance(document.getElementById('detailModal')).show();
  refreshIcons();
}

