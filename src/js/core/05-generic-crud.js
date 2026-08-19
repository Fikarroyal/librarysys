/* =========================================================================
   GENERIC CRUD ENGINE
   Dipakai oleh 30 fitur tambahan (master data, reservasi, denda, dst).
   config = {
     key, idPrefix, titleSingular, icon, searchFields[], sort(a,b),
     columns:[{label, render(item)}],
     fields:[{id,label,type,col,required,options|options(),default,min,step,rows}],
     emptyIcon, emptyTitle, emptyMsg, deleteLabel(item),
     onBeforeSave(payload,isEdit), onAfterSave(item,isEdit), onBeforeDelete(item)
   }
   ========================================================================= */
function createCrudModule(root, config){
  const state = { search:'', page:1, perPage:6 };
  root.innerHTML = `
    <div class="section-card">
      <div class="section-card-head">
        <div class="filter-bar">
          <div class="search-box">${icon('search')}<input type="text" class="form-control form-control-sm" placeholder="Cari ${escapeHtml(config.titleSingular.toLowerCase())}..." data-crud-search></div>
        </div>
        <button type="button" class="btn btn-primary btn-sm" data-crud-add>${icon('plus')}Tambah ${escapeHtml(config.titleSingular)}</button>
      </div>
      <div class="table-responsive-modern">
        <table class="table table-modern mb-0">
          <thead><tr>${config.columns.map(c=>`<th>${escapeHtml(c.label)}</th>`).join('')}<th>Aksi</th></tr></thead>
          <tbody data-crud-tbody></tbody>
        </table>
      </div>
      <div data-crud-pagination></div>
    </div>
  `;
  const searchInput = root.querySelector('[data-crud-search]');
  const tbody = root.querySelector('[data-crud-tbody]');
  const pag = root.querySelector('[data-crud-pagination]');
  const addBtn = root.querySelector('[data-crud-add]');

  function refresh(){
    let list = (DB.get(config.key) || []).slice();
    if(config.sort) list.sort(config.sort);
    if(state.search){
      const q = state.search.toLowerCase();
      list = list.filter(item => (config.searchFields||[]).some(f => String(item[f]||'').toLowerCase().includes(q)));
    }
    const pstate = paginate(list, state.page, state.perPage);
    if(pstate.total===0){
      tbody.innerHTML = `<tr><td colspan="${config.columns.length+1}" class="p-0">${emptyStateHtml(config.emptyIcon||'inbox', config.emptyTitle||'Belum ada data', config.emptyMsg||'Tambahkan data baru untuk memulai.')}</td></tr>`;
      pag.innerHTML=''; return;
    }
    tbody.innerHTML = pstate.items.map(item => `<tr>
      ${config.columns.map(c=>`<td>${c.render(item)}</td>`).join('')}
      <td><div class="row-actions">
        <span class="btn-icon-sm" title="Edit" data-crud-edit="${item.id}">${icon('pencil')}</span>
        <span class="btn-icon-sm danger" title="Hapus" data-crud-del="${item.id}">${icon('trash-2')}</span>
      </div></td>
    </tr>`).join('');
    pag.innerHTML = paginationBarHtml(pstate, 'crudpage-'+config.key);
    pag.querySelectorAll('[data-crudpage-'+config.key+']').forEach(btn=>btn.addEventListener('click', ()=>{ state.page=parseInt(btn.getAttribute('data-crudpage-'+config.key)); refresh(); }));
    tbody.querySelectorAll('[data-crud-edit]').forEach(btn=>btn.addEventListener('click', ()=>openCrudModal(config, btn.dataset.crudEdit, refresh)));
    tbody.querySelectorAll('[data-crud-del]').forEach(btn=>btn.addEventListener('click', ()=>deleteCrudItem(config, btn.dataset.crudDel, refresh)));
    refreshIcons();
  }
  searchInput.addEventListener('input', debounce(e=>{ state.search=e.target.value; state.page=1; refresh(); }, 250));
  addBtn.addEventListener('click', ()=>openCrudModal(config, null, refresh));
  refresh();
  return refresh;
}

function openCrudModal(config, id, onDone){
  const modalEl = document.getElementById('genericCrudModal');
  document.getElementById('genericModalIcon').setAttribute('data-lucide', id ? 'pencil' : 'plus-circle');
  document.getElementById('genericCrudId').value = id || '';
  document.getElementById('genericModalTitle').textContent = (id?'Edit ':'Tambah ') + config.titleSingular;
  const item = id ? (DB.get(config.key)||[]).find(x=>x.id===id) : null;
  document.getElementById('genericCrudFields').innerHTML = config.fields.map(f=>{
    const colClass = 'col-md-'+(f.col||6);
    const val = item ? (item[f.id] ?? '') : (f.default!=null ? f.default : '');
    let control = '';
    if(f.type==='select'){
      const opts = typeof f.options==='function' ? f.options() : f.options;
      control = `<select class="form-select" id="gf_${f.id}" ${f.required?'required':''}>
        <option value="">${f.placeholder||'Pilih...'}</option>
        ${opts.map(o=>`<option value="${escapeHtml(o.value)}" ${String(o.value)===String(val)?'selected':''}>${escapeHtml(o.label)}</option>`).join('')}
      </select>`;
    } else if(f.type==='textarea'){
      control = `<textarea class="form-control" id="gf_${f.id}" rows="${f.rows||3}" ${f.required?'required':''}>${escapeHtml(val)}</textarea>`;
    } else {
      control = `<input type="${f.type||'text'}" class="form-control" id="gf_${f.id}" value="${escapeHtml(val)}" ${f.required?'required':''} ${f.min!=null?`min="${f.min}"`:''} ${f.step!=null?`step="${f.step}"`:''}>`;
    }
    return `<div class="${colClass}"><label class="form-label">${escapeHtml(f.label)}</label>${control}
      <div class="invalid-feedback">${escapeHtml(f.label)} wajib diisi.</div></div>`;
  }).join('');
  refreshIcons();

  const oldForm = document.getElementById('genericCrudForm');
  const newForm = oldForm.cloneNode(true);
  oldForm.parentNode.replaceChild(newForm, oldForm);
  newForm.addEventListener('submit', function(e){
    e.preventDefault(); e.stopPropagation();
    if(!newForm.checkValidity()){ newForm.classList.add('was-validated'); return; }
    const list = DB.get(config.key) || [];
    let payload = {};
    config.fields.forEach(f=>{
      const el = document.getElementById('gf_'+f.id);
      let v = el.value;
      if(f.type==='number') v = v===''? null : parseFloat(v);
      payload[f.id] = v;
    });
    if(config.onBeforeSave) payload = config.onBeforeSave(payload, !!id) || payload;
    let savedItem;
    if(id){
      const idx = list.findIndex(x=>x.id===id);
      list[idx] = {...list[idx], ...payload};
      savedItem = list[idx];
      DB.set(config.key, list);
      showToast(`${config.titleSingular} berhasil diperbarui.`, 'success');
      logActivity(config.titleSingular, `Memperbarui data ${config.titleSingular.toLowerCase()}: ${id}`);
    } else {
      payload.id = uid(config.idPrefix, list);
      list.push(payload);
      savedItem = payload;
      DB.set(config.key, list);
      showToast(`${config.titleSingular} berhasil ditambahkan.`, 'success');
      logActivity(config.titleSingular, `Menambahkan data ${config.titleSingular.toLowerCase()} baru: ${payload.id}`);
    }
    if(config.onAfterSave) config.onAfterSave(savedItem, !!id);
    bootstrap.Modal.getInstance(modalEl).hide();
    if(onDone) onDone();
  });
  bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

function deleteCrudItem(config, id, onDone){
  const list = DB.get(config.key) || [];
  const item = list.find(x=>x.id===id);
  if(config.onBeforeDelete){
    const res = config.onBeforeDelete(item);
    if(res !== true){ showToast(res || 'Data tidak dapat dihapus.', 'danger'); return; }
  }
  confirmAction({
    title: `Hapus ${config.titleSingular.toLowerCase()} ini?`,
    message: config.deleteLabel ? config.deleteLabel(item) : 'Tindakan ini tidak dapat dibatalkan.',
    onConfirm(){
      DB.set(config.key, list.filter(x=>x.id!==id));
      showToast(`${config.titleSingular} berhasil dihapus.`, 'success');
      logActivity(config.titleSingular, `Menghapus data ${config.titleSingular.toLowerCase()}: ${id}`);
      if(onDone) onDone();
    }
  });
}

