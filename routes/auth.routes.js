const express = require('express');
const router = express.Router();
const { renderLogin, renderRegister, login, register, logout } = require('../controllers/auth.controller');

router.get('/login', renderLogin);
router.post('/login', login);
router.get('/register', renderRegister);
router.post('/register', register);
router.post('/logout', logout);

module.exports = router;