const express = require('express');
const router = express.Router();
const { addAddress, getUserAddresses, updateAddress, deleteAddress } = require('../controllers/addressController')
const authenticateUser  = require('../middlewares/authenticate')

//User: Address Management Routes
router.post('/', authenticateUser, addAddress); 
router.get('/', authenticateUser, getUserAddresses); 
router.put('/:addressId', authenticateUser, updateAddress); 
router.delete('/:addressId', authenticateUser, deleteAddress); 

module.exports = router;
