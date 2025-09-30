
initNavbar();
scrollTopButton();

const params = new URLSearchParams(location.search);
const id = params.get('id');
const caretakers = Storage.get('caretakers', []);
const c = caretakers.find(x=>x.id===id) || caretakers[0];


function getRatings(){ return Storage.get('ratings', []) }
function saveRatings(r){ Storage.set('ratings', r) }

function avgRatingFor(caretakerId, fallback){
  const rs = getRatings().filter(r=>r.caretakerId===caretakerId);
  if(rs.length===0) return fallback;
  const avg = rs.reduce((a,b)=>a+b.rating,0)/rs.length;
  return Math.round(avg*10)/10;
}

function ratingStars(current=0){
  const wrap = document.createElement('div');
  wrap.style = 'display:flex;gap:.35rem;align-items:center;flex-wrap:wrap;margin:.6rem 0';
  const label = document.createElement('span'); label.textContent = 'Rate this caretaker:';
  label.className = 'muted';
  const stars = Array.from({length:5}).map((_,i)=>{
    const b = document.createElement('button');
    b.type='button'; b.className = 'ghost'; b.setAttribute('aria-label', `Rate ${i+1} stars`);
    b.innerHTML = '★';
    b.dataset.v = String(i+1);
    b.style.fontSize = '1.2rem';
    return b;
  });
  function paint(v){
    stars.forEach((s,idx)=>{
      s.style.color = (idx < v) ? '#fde047' : '#94a3b8';
      s.style.borderColor = (idx < v) ? '#fde04766' : '#334155';
    });
  }
  paint(Math.round(current));
  stars.forEach(s=>s.addEventListener('click', ()=>{
    const user = Storage.get('currentUser', null);
    if(!user){ showToast('Please log in to rate'); return; }
    const v = parseInt(s.dataset.v,10);
    // upsert user rating per caretaker
    const rs = getRatings();
    const idx = rs.findIndex(r=>r.caretakerId===c.id && r.userEmail===user.email);
    const rec = { caretakerId: c.id, userEmail: user.email, rating: v, at: Date.now() };
    if(idx>=0) rs[idx] = rec; else rs.push(rec);
    saveRatings(rs);
    showToast(`Thanks! You rated ${v} ★`);
    // update shown average
    const newAvg = avgRatingFor(c.id, c.rating);
    const badge = document.getElementById('avgBadge');
    if(badge) badge.innerHTML = `<span class="dot"></span>${newAvg}★`;
    paint(v);
  }));
  stars.forEach(s=>wrap.appendChild(s));
  wrap.prepend(label);
  return wrap;
}

const wrap = $('#wrap');
if(!c){ wrap.innerHTML = '<p>Not found.</p>'; }
else{
  const vIcon = c.verified ? `<span class="verified"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Verified</span>` : '';
  const avg = avgRatingFor(c.id, c.rating);
wrap.innerHTML = `
    <div class="profile">
      <div class="card" data-magnet>
        <img src="${c.avatar}" alt="${formatName(c)}" />
        <h2 style="margin:.6rem 0">${formatName(c)}</h2>
        <div class="row"><span class="badge" id="avgBadge"><span class="dot"></span>${avg}★</span><span class="muted">· ${c.experience} years exp</span></div>
        <p>${c.bio}</p>
        <ul class="kv">
          <li>📧 ${c.email}</li>
          <li>📍 ${c.address} ${vIcon}</li>
          <li>📞 ${c.contact} ${vIcon}</li>
        </ul>
        <div id="rateBox"></div>
      </div>
      <div class="card hireBox">
        <h3>Request Care</h3>
        <p class="muted">Tell us when you need help. We'll notify ${c.firstName}.</p>
        <div class="row">
          <div style="display:flex;gap:.6rem;flex-wrap:wrap;width:100%">
            <div style="display:flex;flex-direction:column;gap:.3rem;min-width:180px;flex:1">
              <label class="muted" for="startDate">Start date</label>
              <input type="date" id="startDate">
            </div>
            <div style="display:flex;flex-direction:column;gap:.3rem;min-width:180px;flex:1">
              <label class="muted" for="endDate">End date</label>
              <input type="date" id="endDate">
            </div>
          </div>
        </div>
        <textarea id="notes" placeholder="Notes (e.g., mobility support, medication reminders)"></textarea>
        <button class="primary" id="hireBtn">Send Request</button>
        <div class="muted" style="margin-top:.6rem">You must be logged in to request care.</div>
      </div>
    </div>
  `;
  const box = document.getElementById('rateBox');
  if(box){ box.appendChild(ratingStars(avg)); }
}

$('#hireBtn')?.addEventListener('click', ()=>{
  const user = Storage.get('currentUser', null);
  if(!user){ showToast('Please log in first'); setTimeout(()=>location.href='login.html', 900); return; }
  const startDate = $('#startDate').value;
  const endDate = $('#endDate').value;
  const notes = $('#notes').value.trim();
  if(!startDate || !endDate){ showToast('Pick both start and end dates'); return; }
  if(new Date(endDate) < new Date(startDate)){ showToast('End date must be after start date'); return; }
  const booking = { id: 'bk-'+Date.now(), caretakerId:c.id, caretakerName: formatName(c), startDate, endDate, notes, userEmail: user.email, status:'pending' };
  const bookings = Storage.get('bookings', []);
  bookings.push(booking);
  Storage.set('bookings', bookings);
  showToast('Request sent!');
  setTimeout(()=>location.href='dashboard.html',900);
});
