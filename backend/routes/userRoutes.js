const express = require('express');
const { signUp, verifyOtp, login, resendOtp} = require('../controllers/userController');
const router = express.Router();
const passport = require('passport');

router.post('/signup', signUp);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login',login);

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    // Successful authentication, redirect home.
    res.status(200).json({ message: "Google login successful", token });
});

router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), (req, res) => {
    // Successful authentication, redirect home.
    res.status(200).json({ message: "Facebook login successful", token });
});


module.exports = router;
