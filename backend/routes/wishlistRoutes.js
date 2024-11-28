const express = require('express');
const router = express.Router();
const { addToWishlist, removeFromWishlist, getWishlist } = require('../controllers/wishtlistController');
const authenticateUser  = require('../middlewares/authenticate')

//User: Wishlist Management Routes
router.post('/', authenticateUser, addToWishlist); 
router.delete('/:productId', authenticateUser, removeFromWishlist); 
router.get('/', authenticateUser, getWishlist); 



module.exports = router;
