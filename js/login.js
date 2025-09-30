
initNavbar();
scrollTopButton();

$('#loginForm').addEventListener('submit',(e)=>{
  e.preventDefault();
  const f = new FormData(e.target);
  const email = f.get('email'), pw = f.get('password');
  const users = Storage.get('users', []);
  const user = users.find(u=>u.email===email && u.password===pw);
  if(!user){ showToast('Invalid credentials'); return; }
  Storage.set('currentUser', {email:user.email, firstName:user.firstName, role:user.role});
  showToast('Logged in');
  setTimeout(()=>location.href='dashboard.html', 800);
});
