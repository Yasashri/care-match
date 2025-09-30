
initNavbar('hires');
scrollTopButton();

const user = Storage.get('currentUser', null);
if(!user){ showToast('Please log in'); setTimeout(()=>location.href='login.html', 900) }

const hiresList = $('#hiresList');
const caretakers = Storage.get('caretakers', []);

function getMyBookings(){
  return Storage.get('bookings', []).filter(b=>b.userEmail===user?.email);
}
function saveBookings(bks){ Storage.set('bookings', bks) }

function row(b){
  const c = caretakers.find(x=>x.id===b.caretakerId);
  const vIcon = c?.verified ? `<span class="verified"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Verified</span>` : '';
  const statusColor = b.status==='canceled' ? 'color:#f87171' : (b.status==='confirmed' ? 'color:#34d399' : 'color:#fbbf24');
  return `<div class="card" data-magnet>
    <div class="row">
      <h3>${c ? c.firstName + ' ' + c.lastName : b.caretakerName}</h3>
      <span class="badge" style="${statusColor}"><span class="dot"></span>${b.status}</span>
    </div>
    <div class="muted">${c?.bio||''}</div>
    <div class="row" style="margin-top:.8rem">
      <div class="meta">📍 ${c?.address||''} ${vIcon}</div>
      <div class="meta">🗓️ ${b.startDate} → ${b.endDate}</div>
    </div>
    <div class="row" style="margin-top:.8rem">
      <a class="ghost" href="profile.html?id=${b.caretakerId}">View profile</a>
      ${b.status==='pending' ? `<button class="ghost cancelBtn" data-id="${b.id}">Cancel</button>` : ''}
    </div>
  </div>`
}

function render(){
  const mine = getMyBookings();
  if(mine.length===0){
    hiresList.innerHTML = '<p class="muted">No hires yet. Visit a profile and click "Send Request".</p>';
    return;
  }
  hiresList.innerHTML = mine.map(row).join('');
  // wire cancel buttons
  document.querySelectorAll('.cancelBtn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.dataset.id;
      const all = Storage.get('bookings', []);
      const idx = all.findIndex(x=>x.id===id && x.userEmail===user.email);
      if(idx>=0){
        all[idx].status = 'canceled';
        saveBookings(all);
        showToast('Request canceled');
        render();
      }
    });
  });
}

render();
