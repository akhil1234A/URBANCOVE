const express = require('express');
const { signUp, verifyOtp, login, resendOtp, googleAuth} = require('../controllers/userController');
const router = express.Router();


router.post('/signup', signUp);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login',login);
router.post('/google-auth', googleAuth);



module.exports = router;
