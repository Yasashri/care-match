
initNavbar('browse');
scrollTopButton();

const list = $('#list');
const caretakers = Storage.get('caretakers', []);

const PAGE_SIZE = 15;
let page = 1;
let filtered = [...caretakers];

function card(c){
  const vIcon = c.verified ? `<span class="verified"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Verified</span>` : '';
  return `<a class="card" data-magnet href="profile.html?id=${c.id}">
    <div class="row">
      <h3>${formatName(c)}</h3>
      <span class="badge"><span class="dot"></span>${c.rating}★</span>
    </div>
    <div class="muted">${c.bio}</div>
    <div class="row" style="margin-top:.8rem">
      <div class="meta">📍 ${c.address} ${vIcon}</div>
      <div class="meta">⌛ ${c.experience} yrs</div>
    </div>
  </a>`
}

function renderPagination(){
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if(page > totalPages) page = totalPages;
  const wrap = document.createElement('div');
  wrap.className = 'container';
  const controls = document.createElement('div');
  controls.style = 'display:flex;gap:.5rem;justify-content:center;margin:1rem 0;flex-wrap:wrap';
  const makeBtn = (label, disabled, handler)=>{
    const b = document.createElement('button');
    b.textContent = label;
    b.className = 'ghost'; b.disabled = disabled;
    b.addEventListener('click', handler);
    return b;
  };
  controls.append(
    makeBtn('« Prev', page<=1, ()=>{ page--; render() }),
  );
  // Page numbers (compact)
  for(let p=Math.max(1,page-2); p<=Math.min(totalPages, page+2); p++){
    const b = makeBtn(String(p), p===page, ()=>{ page=p; render() });
    if(p===page){ b.className='badge' }
    controls.append(b);
  }
  controls.append(
    makeBtn('Next »', page>=totalPages, ()=>{ page++; render() }),
  );
  wrap.append(controls);
  return wrap;
}

function render(){
  const start = (page-1)*PAGE_SIZE;
  const items = filtered.slice(start, start+PAGE_SIZE);
  list.innerHTML = items.map(card).join('');
  // Append pagination controls after the grid
  let oldP = document.getElementById('pager');
  if(oldP) oldP.remove();
  const pager = renderPagination();
  pager.id = 'pager';
  document.body.appendChild(pager);
}

// initial render
render();

$('#filterBtn').addEventListener('click', ()=>{
  const q = $('#q').value.trim().toLowerCase();
  const minR = parseFloat($('#minRating').value);
  const minE = parseInt($('#minExp').value,10);
  filtered = caretakers.filter(c=>{
    const hay = [c.firstName, c.lastName, c.address, c.bio].join(' ').toLowerCase();
    const okQ = q ? hay.includes(q) : true;
    return okQ && c.rating>=minR && c.experience>=minE;
  });
  page = 1;
  if(filtered.length===0) showToast('No matches for your filters');
  render();
});
