const bcrypt = require('bcryptjs');
const { User } = require('../models');

// 🛡️ DRY: dipake dari auth.controller.js (register) DAN seeders/seed.js (bikin akun admin awal)
async function registerUser({ username, password, role = 'customer' }) {
  const existing = await User.findOne({ where: { username } });
  if (existing) {
    return { success: false, message: 'Username sudah dipakai, coba yang lain' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ username, password: hashedPassword, role });
  return { success: true, user };
}

// 🛡️ DRY: satu-satunya tempat yang ngecek kredensial, dipake auth.controller.js (login)
async function verifyLogin({ username, password }) {
  const user = await User.findOne({ where: { username } });
  if (!user) {
    return { success: false, message: 'Username atau password salah' };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { success: false, message: 'Username atau password salah' };
  }

  return { success: true, user };
}

module.exports = { registerUser, verifyLogin };