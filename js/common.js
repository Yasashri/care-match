
// Simple helper shared by all pages
const $ = (q, ctx=document)=>ctx.querySelector(q);
const $$ = (q, ctx=document)=>Array.from(ctx.querySelectorAll(q));

const Storage = {
  get(key, fallback){
    try{ return JSON.parse(localStorage.getItem(key)) ?? fallback }catch(e){ return fallback }
  },
  set(key, val){ localStorage.setItem(key, JSON.stringify(val)) }
}

// Demo seed caretakers if empty
;
(function seed(){
  if(!Storage.get('caretakers')){
    if (window.CARETAKERS && Array.isArray(window.CARETAKERS) && window.CARETAKERS.length){ Storage.set('caretakers', window.CARETAKERS); return; }
    const demos = [
      {id:'ct-1001', firstName:'Lina', lastName:'Hsu', email:'lina.hsu@example.com', address:'Zuoying, Kandy', contact:'+886 912 345 678', experience:6, rating:4.8, verified:true, bio:'Experienced eldercare nurse specializing in dementia support and nutrition.', avatar:'https://i.pravatar.cc/120?img=47'},
      {id:'ct-1002', firstName:'Ravi', lastName:'Perera', email:'ravi.perera@example.com', address:'Sanmin, Kandy', contact:'+886 987 654 321', experience:4, rating:4.5, verified:true, bio:'Kind and patient caregiver with focus on mobility assistance and stroke recovery.', avatar:'https://i.pravatar.cc/120?img=12'},
      {id:'ct-1003', firstName:'Mei', lastName:'Chen', email:'mei.chen@example.com', address:'Gushan, Kandy', contact:'+886 923 111 222', experience:8, rating:4.9, verified:true, bio:'Licensed practical nurse, palliative care specialist, fluent in Mandarin and English.', avatar:'https://i.pravatar.cc/120?img=32'},
      {id:'ct-1004', firstName:'Sanjaya', lastName:'Jay', email:'s.jay@example.com', address:'Fengshan, Kandy', contact:'+886 955 666 777', experience:3, rating:4.2, verified:false, bio:'Home-visit caregiver focused on daily living assistance and companionship.', avatar:'https://i.pravatar.cc/120?img=5'}
    ];
    Storage.set('caretakers', demos);
  }
})();

function formatName(c){ return `${c.firstName} ${c.lastName}` }

function initNavbar(active=''){
  const nav = document.createElement('nav');
  nav.innerHTML = `
    <div class="container navbar">
      <a class="brand" href="index.html"><span class="logo"></span> CareMatch</a>
      <button class="hamburger" aria-label="Menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div class="navlinks">
        <a href="index.html" class="${active==='home'?'active':''}">Home</a>
        <a href="caretakers.html" class="${active==='browse'?'active':''}">Browse Caretakers</a>
        <a href="hires.html" id="nav-hires" style="display:none" class="${active==='hires'?'active':''}">Hired Caretakers</a>
        <a href="dashboard.html" id="nav-account" style="display:none">My Account</a>
        <a href="login.html" id="nav-login">Login</a>
        <a href="signup.html" id="nav-signup" class="badge"><span class="dot"></span>Sign Up</a>
        <button class="ghost" id="nav-logout" style="display:none">Logout</button>
      </div>
    </div>`;
  document.body.prepend(nav);

  // Hamburger menu functionality
  const hamburger = $('.hamburger');
  const navlinks = $('.navlinks');
  
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navlinks.classList.toggle('active');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && navlinks.classList.contains('active')) {
      hamburger.classList.remove('active');
      navlinks.classList.remove('active');
    }
  });

  // Close menu when clicking on a link
  navlinks.querySelectorAll('a, button').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navlinks.classList.remove('active');
    });
  });

  const user = Storage.get('currentUser', null);
  const navLogin = $('#nav-login'), navSignup = $('#nav-signup');
  const navLogout = $('#nav-logout'), navAccount = $('#nav-account');
  const navHires = $('#nav-hires');

  if(user){
    navLogin.style.display = 'none';
    navSignup.style.display = 'none';
    navLogout.style.display = 'inline-block';
    navAccount.style.display = 'inline-block';
    if(navHires) navHires.style.display = 'inline-block';
    navLogout.addEventListener('click', ()=>{
      localStorage.removeItem('currentUser');
      showToast('Logged out');
      setTimeout(()=>location.href='index.html',650);
    });
  }
}

function showToast(msg, timeout=2200){
  let t = $('.toast');
  if(!t){ t = document.createElement('div'); t.className='toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.style.display='block';
  setTimeout(()=>t.style.display='none', timeout);
}

function scrollTopButton(){
  const btn = document.createElement('button');
  btn.id='scrollTopBtn'; btn.title='Back to top'; btn.innerHTML='↑';
  document.body.appendChild(btn);
  window.addEventListener('scroll', ()=>{
    btn.style.display = window.scrollY > 300 ? 'block':'none';
  });
  btn.addEventListener('click', ()=>window.scrollTo({top:0, behavior:'smooth'}));
}

document.addEventListener('pointermove', e=>{
  $$('[data-magnet]').forEach(el=>{
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${((e.clientX-rect.left)/rect.width)*100}%`);
  })
});
