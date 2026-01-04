const express = require('express');
const { signUp, verifyOtp, login, resendOtp, googleAuth, updatePassword, forgotPassword, resetPassword} = require('../controllers/user/userController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

//User: Authentification
router.post('/signup', signUp);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login',login);
router.post('/google-auth', googleAuth);
router.put('/update-password',authenticate,updatePassword)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword)



module.exports = router;
