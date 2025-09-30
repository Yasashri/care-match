
initNavbar();
scrollTopButton();

const user = Storage.get('currentUser', null);
if(!user){ showToast('Please log in'); setTimeout(()=>location.href='login.html', 800) }

const content = $('#content');

function bookingsSection(){
  const all = Storage.get('bookings', []);
  const mine = all.filter(b=>b.userEmail===user.email);
  return `<div class="card" data-magnet>
    <h3>Your Requests</h3>
    ${mine.length===0?'<p class="muted">No requests yet.</p>':
      `<table class="table">
        <tr><th>Date</th><th>Hours</th><th>Caretaker</th><th>Status</th></tr>
        ${mine.map(b=>`<tr><td>${b.date}</td><td>${b.hours}</td><td>${b.caretakerName}</td><td>${b.status}</td></tr>`).join('')}
      </table>`
    }
  </div>`
}

function caretakerSection(){
  if(user.role!=='caretaker') return '';
  const cs = Storage.get('caretakers', []);
  const me = cs.find(c=>c.email===user.email);
  if(!me) return '<div class="card"><p>No caretaker profile yet.</p></div>';
  return `<div class="card" data-magnet>
    <h3>Edit Your Caretaker Profile</h3>
    <div class="grid" style="grid-template-columns:1fr 1fr;gap:.6rem">
      <input id="bio" value="${me.bio||''}" placeholder="Bio">
      <input id="address" value="${me.address||''}" placeholder="Address">
      <input id="contact" value="${me.contact||''}" placeholder="Contact">
      <input id="experience" type="number" value="${me.experience||1}" placeholder="Experience (years)">
      <input id="rating" type="number" step="0.1" value="${me.rating||4.0}" placeholder="Rating">
    </div>
    <button class="primary" id="saveProfile">Save</button>
  </div>`
}

content.innerHTML = `
  <div class="card" data-magnet>
    <h3>Hello, ${user?.firstName||'there'} 👋</h3>
    <p class="muted">Role: ${user.role}</p>
  </div>
  ${bookingsSection()}
  ${caretakerSection()}
`;

$('#saveProfile')?.addEventListener('click', ()=>{
  const cs = Storage.get('caretakers', []);
  const idx = cs.findIndex(c=>c.email===user.email);
  if(idx>=0){
    cs[idx].bio = $('#bio').value;
    cs[idx].address = $('#address').value;
    cs[idx].contact = $('#contact').value;
    cs[idx].experience = parseInt($('#experience').value||'1',10);
    cs[idx].rating = parseFloat($('#rating').value||'4');
    cs[idx].verified = true;
    Storage.set('caretakers', cs);
    showToast('Profile saved');
  }
});
