/* ---------------------------- MODUL: DASHBOARD ---------------------------- */
const chartRegistry = {};
function destroyChart(name){ if(chartRegistry[name]){ chartRegistry[name].destroy(); delete chartRegistry[name]; } }

function initDashboardPage(){
  const books = getBooks(), members = getMembers(), loans = getLoans();
  const totalMembers = members.length;
  const available = books.filter(b=>bookStatus(b)==='Tersedia').length;
  const borrowed = books.filter(b=>bookStatus(b)==='Dipinjam').length;
  const overdue = loans.filter(l=>loanStatus(l)==='Terlambat').length;
  const today = todayStr();
  const loanToday = loans.filter(l=>l.loanDate===today).length;

  const stats = [
    {label:'Total Buku', value:books.length, iconName:'book-marked', color:'primary', trend:`${books.length} judul terdaftar`},
    {label:'Total Anggota', value:totalMembers, iconName:'users', color:'info', trend:`${members.filter(m=>m.status==='Aktif').length} anggota aktif`},
    {label:'Buku Tersedia', value:available, iconName:'check-circle', color:'success', trend:`dari ${books.length} judul koleksi`},
    {label:'Buku Dipinjam', value:borrowed, iconName:'repeat', color:'warning', trend:`${loans.filter(l=>loanStatus(l)!=='Dikembalikan').length} transaksi berjalan`},
    {label:'Buku Terlambat', value:overdue, iconName:'alert-triangle', color:'danger', trend: overdue ? 'perlu ditindaklanjuti' : 'tidak ada keterlambatan'},
    {label:'Peminjaman Hari Ini', value:loanToday, iconName:'calendar-check', color:'slate', trend: formatDate(today)}
  ];
  const colorVar = {primary:'var(--primary)', info:'var(--info)', success:'var(--success)', warning:'var(--warning)', danger:'var(--danger)', slate:'var(--slate)'};
  const colorBg = {primary:'var(--primary-light)', info:'var(--info-light)', success:'var(--success-light)', warning:'var(--warning-light)', danger:'var(--danger-light)', slate:'var(--slate-light)'};

  document.getElementById('dashStats').innerHTML = stats.map(s=>`
    <div class="col-6 col-lg-4 col-xl-2">
      <div class="stat-card">
        <div class="stat-top"><div class="stat-icon" style="background:${colorBg[s.color]};color:${colorVar[s.color]};">${icon(s.iconName)}</div></div>
        <div><div class="stat-value">${s.value}</div><div class="stat-label">${s.label}</div></div>
        <div class="stat-trend">${icon('dot')}<span>${s.trend}</span></div>
      </div>
    </div>`).join('');

  document.getElementById('recentLoansTbody').innerHTML = [...loans].sort((a,b)=>b.loanDate.localeCompare(a.loanDate)).slice(0,6).map(l=>{
    const book=findBook(l.bookId), member=findMember(l.memberId);
    return `<tr>
      <td class="mono">${l.id}</td>
      <td>${escapeHtml(member?member.name:'-')}</td>
      <td class="cell-title">${escapeHtml(book?book.title:'-')}</td>
      <td>${formatDate(l.loanDate)}</td>
      <td>${formatDate(l.dueDate)}</td>
      <td>${loanStatusBadge(loanStatus(l))}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="6" class="text-center text-muted py-4">Belum ada transaksi peminjaman.</td></tr>`;

  refreshIcons();

  /* chart: peminjaman per bulan (6 bulan terakhir, data nyata) */
  const monthLabels=[]; const monthKeys=[]; const bulanNama=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  const now = new Date();
  for(let i=5;i>=0;i--){
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
    monthKeys.push(d.getFullYear()+'-'+d.getMonth());
    monthLabels.push(bulanNama[d.getMonth()]);
  }
  const monthCounts = monthKeys.map(key => loans.filter(l=>{ const d=new Date(l.loanDate+'T00:00:00'); return (d.getFullYear()+'-'+d.getMonth())===key; }).length);
  destroyChart('monthly');
  chartRegistry.monthly = new Chart(document.getElementById('chartMonthlyLoans'), {
    type:'bar',
    data:{ labels:monthLabels, datasets:[{ label:'Jumlah Peminjaman', data:monthCounts, backgroundColor:'#4F46E5', borderRadius:8, maxBarThickness:42 }] },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ y:{beginAtZero:true, ticks:{precision:0}, grid:{color:'#EEF0F5'}}, x:{grid:{display:false}} } }
  });

  /* chart: status doughnut */
  const onTimeActive = loans.filter(l=>loanStatus(l)==='Dipinjam').length;
  const terlambatCount = loans.filter(l=>loanStatus(l)==='Terlambat').length;
  const rusakCount = books.filter(b=>bookStatus(b)==='Rusak').length;
  const tersediaCount = books.filter(b=>bookStatus(b)==='Tersedia').length;
  destroyChart('status');
  chartRegistry.status = new Chart(document.getElementById('chartStatusDoughnut'), {
    type:'doughnut',
    data:{ labels:['Tersedia','Dipinjam','Terlambat','Rusak'], datasets:[{ data:[tersediaCount, onTimeActive, terlambatCount, rusakCount], backgroundColor:['#16A34A','#0EA5E9','#DC2626','#D97706'], borderWidth:0, spacing:2 }] },
    options:{ responsive:true, maintainAspectRatio:false, cutout:'68%', plugins:{legend:{position:'bottom', labels:{boxWidth:10, boxHeight:10, usePointStyle:true, pointStyle:'circle', font:{size:11, weight:600}}}} }
  });

  /* chart: top 5 buku */
  const loanCountByBook = {};
  loans.forEach(l=>{ loanCountByBook[l.bookId] = (loanCountByBook[l.bookId]||0)+1; });
  const topBooks = Object.entries(loanCountByBook).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([bookId,count])=>({title:(findBook(bookId)||{}).title||'-', count}));
  destroyChart('top');
  chartRegistry.top = new Chart(document.getElementById('chartTopBooks'), {
    type:'bar',
    data:{ labels:topBooks.map(b=>b.title.length>18?b.title.slice(0,18)+'…':b.title), datasets:[{ data:topBooks.map(b=>b.count), backgroundColor:'#7C6EF0', borderRadius:8, maxBarThickness:18 }] },
    options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ x:{beginAtZero:true, ticks:{precision:0}, grid:{color:'#EEF0F5'}}, y:{grid:{display:false}} } }
  });
}

