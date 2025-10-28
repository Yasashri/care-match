
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
  wrap.className = 'rating-stars';
  
  const label = document.createElement('span');
  label.textContent = 'Rate this caretaker:';
  label.className = 'muted';

  const starsRow = document.createElement('div');
  starsRow.className = 'stars-row';
  
  const stars = Array.from({length:5}).map((_,i)=>{
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ghost';
    b.setAttribute('aria-label', `Rate ${i+1} stars`);
    b.innerHTML = '★';
    b.dataset.v = String(i+1);
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
  stars.forEach(s => starsRow.appendChild(s));
  wrap.appendChild(label);
  wrap.appendChild(starsRow);
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
        <img src="${c.avatar}" alt="" class="cover-photo" />
        <div class="profile-header">
          <img src="${c.avatar}" alt="${formatName(c)}" />
          <div>
            <h2 style="margin:0 0 .5rem">${formatName(c)}</h2>
            <div class="stats">
              <span class="badge" id="avgBadge"><span class="dot"></span>${avg}★</span>
              <span class="badge"><span class="dot"></span>${c.experience} years experience</span>
            </div>
          </div>
        </div>
        
        ${c.verified ? `
        <div class="verified-info">
          <span class="verified">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 6L9 17l-5-5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Verified Caretaker
          </span>
          <span class="muted">Background checked and credentials verified</span>
        </div>
        ` : ''}

        <p style="margin:1rem 0;line-height:1.6">${c.bio}</p>
        
        <div id="rateBox" class="rating-stars"></div>

        <ul class="kv">
          <li>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            ${c.email}
          </li>
          <li>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            ${c.address}
          </li>
          <li>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
            ${c.contact}
          </li>
        </ul>
      </div>

      <div class="card hire-box">
        <h3>Request Care</h3>
        <p class="muted">Tell us when you need help. We'll notify ${c.firstName}.</p>
        
        <div class="date-inputs">
          <div class="input-group">
            <label class="muted" for="startDate">Start date</label>
            <input type="date" id="startDate" min="${new Date().toISOString().split('T')[0]}">
          </div>
          <div class="input-group">
            <label class="muted" for="endDate">End date</label>
            <input type="date" id="endDate" min="${new Date().toISOString().split('T')[0]}">
          </div>
        </div>

        <textarea id="notes" placeholder="Additional details about care needs (e.g., mobility support, medication schedule, specific requirements)"></textarea>
        
        <button class="primary" id="hireBtn">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin-right:8px">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          Send Care Request
        </button>

        <div class="muted" style="margin-top:1rem;text-align:center;padding:.75rem;border:1px solid #334155;border-radius:.6rem">
          You must be logged in to request care
        </div>
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
