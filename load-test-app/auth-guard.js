// auth-guard.js
// Firebaseログイン接続後に有効になります。
// firebase-config.js が無い環境でもアプリ確認できるよう、エラー時は止めません。

(async () => {
  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
    const { getAuth, onAuthStateChanged, signOut } = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js");
    const { firebaseConfig } = await import("../firebase-config.js");

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = "../login.html";
      }
    });

    window.hitLogout = async function () {
      await signOut(auth);
      window.location.href = "../login.html";
    };
  } catch (e) {
    console.warn("Firebase auth guard skipped:", e);
    window.hitLogout = function(){ window.location.href = "../login.html"; };
  }
})();
