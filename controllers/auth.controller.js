const authService = require('../services/auth.service');

function renderLogin(req, res) {
  res.render('login', { error: null });
}

function renderRegister(req, res) {
  res.render('register', { error: null });
}

async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.render('login', { error: 'Username dan password wajib diisi' });
    }

    const result = await authService.verifyLogin({ username, password });
    if (!result.success) {
      return res.render('login', { error: result.message });
    }

    req.session.user = {
      id: result.user.id,
      username: result.user.username,
      role: result.user.role,
    };

    // Admin diarahin ke dashboard produk, customer ke katalog
    if (result.user.role === 'admin') {
      return res.redirect('/admin/products');
    }
    return res.redirect('/');
  } catch (err) {
    res.status(500).send('Gagal login: ' + err.message);
  }
}

async function register(req, res) {
  try {
    const { username, password, confirmPassword } = req.body;

    if (!username || !password || !confirmPassword) {
      return res.render('register', { error: 'Semua field wajib diisi' });
    }
    if (password !== confirmPassword) {
      return res.render('register', { error: 'Konfirmasi password tidak cocok' });
    }
    if (password.length < 6) {
      return res.render('register', { error: 'Password minimal 6 karakter' });
    }

    // Registrasi mandiri SELALU jadi role customer — akun admin dibikin lewat seeder,
    // bukan dari form publik, biar orang gak bisa daftar jadi admin sendiri.
    const result = await authService.registerUser({ username, password, role: 'customer' });
    if (!result.success) {
      return res.render('register', { error: result.message });
    }

    req.session.user = {
      id: result.user.id,
      username: result.user.username,
      role: result.user.role,
    };
    return res.redirect('/');
  } catch (err) {
    res.status(500).send('Gagal daftar: ' + err.message);
  }
}

function logout(req, res) {
  req.session.destroy(() => {
    res.redirect('/login');
  });
}

module.exports = { renderLogin, renderRegister, login, register, logout };