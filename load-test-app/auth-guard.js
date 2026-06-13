import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { firebaseConfig } from '../firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
  if (!user) location.href = '../login.html';
});

window.hitLogout = async function () {
  await signOut(auth);
  location.href = '../login.html';
};
