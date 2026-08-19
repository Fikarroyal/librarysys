/* ---------------------------------------------------------------------------
   AUTH GUARD — dimuat PALING AWAL di setiap halaman terproteksi.
   Mengecek sesi login di localStorage; jika tidak ada, langsung redirect ke
   halaman login sebelum konten/data lain sempat dirender.
   --------------------------------------------------------------------------- */
(function () {
  const SESSION_KEY = 'librarysys_session';

  function getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.replace('login.html');
  }

  const session = getSession();
  if (!session || !session.email) {
    window.location.replace('login.html');
  }

  window.__SESSION__ = session;
  window.AUTH = { SESSION_KEY, getSession, setSession, logout };
})();
