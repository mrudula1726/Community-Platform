const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', register);
router.post('/signin', login);
router.get('/me', authMiddleware, getMe);

module.exports = router;
