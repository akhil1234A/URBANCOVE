const express = require('express');
const router = express.Router();
const { getWalletBalance, initiateAddMoney, verifyAddMoney } = require('../controllers/user/walletController');
const authenticateUser  = require('../middlewares/authenticate')

//User: Wallet Routes

router.get('/balance', authenticateUser, getWalletBalance); 
router.post('/initiate', authenticateUser, initiateAddMoney);
router.post('/verify', authenticateUser, verifyAddMoney);



module.exports = router;