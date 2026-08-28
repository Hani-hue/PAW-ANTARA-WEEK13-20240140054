// 🛡️ DRY: middleware ini yang nentuin siapa boleh akses halaman apa,
// dipake berkali-kali di app.js buat proteksi route customer & admin
// tanpa nulis ulang logic cek session di tiap controller.

function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect('/login');
}

function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  return res.status(403).send('Akses ditolak: halaman ini khusus admin');
}

function isCustomer(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'customer') {
    return next();
  }
  return res.status(403).send('Akses ditolak: halaman ini khusus customer');
}

// Bikin req.session.user kebaca otomatis di semua view EJS lewat currentUser,
// jadi nav.ejs bisa nampilin nama user / tombol login-logout tanpa tiap controller kirim manual.
function attachUserToViews(req, res, next) {
  res.locals.currentUser = req.session.user || null;
  res.locals.storeName = process.env.STORE_NAME || 'Toko Kita';
  next();
}

module.exports = { isAuthenticated, isAdmin, isCustomer, attachUserToViews };