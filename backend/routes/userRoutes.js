const express = require('express');
const { signUp, verifyOtp, login, resendOtp, googleAuth, updatePassword} = require('../controllers/userController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

//User: Authentification
router.post('/signup', signUp);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login',login);
router.post('/google-auth', googleAuth);
router.put('/update-password',authenticate,updatePassword)



module.exports = router;
