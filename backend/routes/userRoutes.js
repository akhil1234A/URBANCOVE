const express = require('express');
const { signUp, verifyOtp, login } = require('../controllers/userController');
const router = express.Router();

router.post('/signup', signUp);
router.post('/verify-otp', verifyOtp);
router.post('/login',login);

 

module.exports = router;
