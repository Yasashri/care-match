
initNavbar('home');
scrollTopButton();

const featured = $('#featured');
const caretakers = Storage.get('caretakers', []);

function star(v){
  const s = Math.round(v*2)/2;
  return `${s}★`;
}

function card(c){
  const vIcon = c.verified ? `<span class="verified"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Verified</span>` : '';
  return `<a class="card" data-magnet href="profile.html?id=${c.id}">
    <div class="row">
      <h3>${formatName(c)}</h3>
      <span class="badge"><span class="dot"></span>${star(c.rating)}</span>
    </div>
    <div class="muted">${c.bio}</div>
    <div class="row" style="margin-top:.8rem">
      <div class="meta">📍 ${c.address} ${vIcon}</div>
      <div class="meta">⌛ ${c.experience} yrs</div>
    </div>
  </a>`
}

function render(list){
  featured.innerHTML = list.slice(0,8).map(card).join('');
}
render(caretakers);

$('#yr').textContent = new Date().getFullYear();

$('#searchBtn').addEventListener('click', ()=>{
  const q = $('#q').value.trim().toLowerCase();
  const min = parseFloat($('#minRating').value);
  const res = caretakers.filter(c=>{
    const hay = [c.firstName, c.lastName, c.address, c.bio].join(' ').toLowerCase();
    return hay.includes(q) && c.rating >= min
  });
  if(res.length===0) showToast('No matches — try fewer filters');
  render(res);
});
