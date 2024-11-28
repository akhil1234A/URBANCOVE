const express = require('express');
const router = express.Router();
const { getWalletBalance } = require('../controllers/walletController');
const authenticateUser  = require('../middlewares/authenticate')

//User: Wallet Routes

router.get('/balance', authenticateUser, getWalletBalance); 



module.exports = router;