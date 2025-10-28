
initNavbar('browse');
scrollTopButton();

const list = $('#list');
const caretakers = Storage.get('caretakers', []);

const PAGE_SIZE = 15;
let page = 1;
let filtered = [...caretakers];

function card(c){
  const vIcon = c.verified ? `<span class="verified"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Verified</span>` : '';
  
  // Extract skills from bio for tags
  const skills = c.bio.toLowerCase()
    .match(/(?:specializing in|specialist|focus on|expertise in) ([\w\s,]+)/i)?.[1]
    ?.split(/,|\sand\s/)
    .map(s => s.trim())
    .filter(s => s.length > 0) || [];

  return `<a class="card" data-magnet href="profile.html?id=${c.id}">
    <div class="card-header">
      <img src="${c.avatar}" alt="${formatName(c)}" class="avatar" loading="lazy">
      <div class="card-info">
        <div class="row">
          <h3>${formatName(c)}</h3>
          <span class="badge"><span class="dot"></span>${c.rating}★</span>
        </div>
        <div class="card-meta">
          <div class="meta">📍 ${c.address}</div>
          <div class="meta">⌛ ${c.experience} yrs</div>
          ${vIcon}
        </div>
      </div>
    </div>
    <div class="muted">${c.bio}</div>
    ${skills.length ? `
    <div class="skill-tags">
      ${skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
    </div>
    ` : ''}
  </a>`
}

function renderPagination(){
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if(page > totalPages) page = totalPages;
  const wrap = document.createElement('div');
  wrap.className = 'container';
  const controls = document.createElement('div');
  controls.className = 'pager-controls';
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
    const b = makeBtn(String(p), false, ()=>{ page=p; render() });
    b.classList.add('page-num');
    if(p===page){ b.classList.remove('ghost'); b.classList.add('badge'); b.setAttribute('aria-current','page'); }
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
  // Insert pager directly after the results list container for correct layout
  list.parentNode.insertBefore(pager, list.nextSibling);
}

// initial render
render();

function updateResults() {
  const resultsInfo = $('#results-info');
  const resultsCount = $('#results-count');
  
  if (filtered.length > 0) {
    resultsCount.textContent = filtered.length;
    resultsInfo.style.display = 'block';
  } else {
    resultsInfo.style.display = 'none';
  }
}

// Debounce function for search
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function filterCaretakers() {
  const q = $('#q').value.trim().toLowerCase();
  const minR = parseFloat($('#minRating').value);
  const minE = parseInt($('#minExp').value,10);
  
  filtered = caretakers.filter(c=>{
    const hay = [c.firstName, c.lastName, c.address, c.bio].join(' ').toLowerCase();
    const okQ = q ? hay.includes(q) : true;
    return okQ && c.rating>=minR && c.experience>=minE;
  });
  
  page = 1;
  if(filtered.length===0) {
    showToast('No matches for your filters');
    list.innerHTML = `
      <div class="card" style="text-align: center">
        <h3>No matches found</h3>
        <p class="muted">Try adjusting your filters or search terms</p>
      </div>
    `;
  } else {
    render();
  }
  updateResults();
}

// Add event listeners
$('#filterBtn').addEventListener('click', filterCaretakers);

// Add input event listener with debounce for mobile
const debouncedFilter = debounce(filterCaretakers, 300);
$('#q').addEventListener('input', debouncedFilter);

// Add change listeners for select elements
$('#minRating').addEventListener('change', filterCaretakers);
$('#minExp').addEventListener('change', filterCaretakers);
