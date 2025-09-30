
initNavbar();
scrollTopButton();

let sentCode = null;
let phoneTemp = '';

$('#sendOtp').addEventListener('click', ()=>{
  const contact = $('[name=contact]').value.trim();
  if(contact.length < 6){ showToast('Enter a valid contact number'); return; }
  sentCode = String(Math.floor(100000 + Math.random()*900000));
  phoneTemp = contact;
  sessionStorage.setItem('otpCode', sentCode);
  sessionStorage.setItem('otpPhone', contact);
  showToast(`OTP sent to ${contact}: ${sentCode}`); // simulation: show code directly
});

$('#signupForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const f = new FormData(e.target);
  const user = Object.fromEntries(f.entries());
  if((user.password||'').length < 6){ showToast('Password too short'); return; }
  const code = user.otp?.trim();
  const expected = sessionStorage.getItem('otpCode');
  const p = sessionStorage.getItem('otpPhone');
  if(!expected || code !== expected || user.contact.trim() !== p){
    showToast('Phone not verified. Click "Send OTP" and enter the code.');
    return;
  }

  // Save user
  const users = Storage.get('users', []);
  if(users.some(u=>u.email===user.email)){
    showToast('Email already registered');
    return;
  }
  const newUser = {
    id: 'u-'+Date.now(),
    firstName: user.firstName, lastName: user.lastName, email: user.email,
    address: user.address, contact: user.contact, role: user.role,
    password: user.password, phoneVerified: true
  };
  users.push(newUser);
  Storage.set('users', users);

  // If caretaker, also add/edit caretaker profile scaffold
  if(user.role === 'caretaker'){
    const caretakers = Storage.get('caretakers', []);
    caretakers.push({
      id: 'ct-'+Date.now(),
      firstName: user.firstName, lastName: user.lastName, email: user.email,
      address: user.address, contact: user.contact, experience: 1, rating: 4.0,
      verified: true, bio: 'New caretaker — update your bio from your dashboard.', avatar:'https://i.pravatar.cc/120'
    });
    Storage.set('caretakers', caretakers);
  }

  // Auto-login
  Storage.set('currentUser', {email:newUser.email, firstName:newUser.firstName, role:newUser.role});
  showToast('Account created!');
  setTimeout(()=>location.href='dashboard.html', 900);
});
