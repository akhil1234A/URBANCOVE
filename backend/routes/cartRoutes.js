const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authenticateUser  = require('../middlewares/authenticate')


router.post('/', authenticateUser, cartController.addToCart);
router.put('/:productId', authenticateUser, cartController.updateCartItemQuantity);
router.delete('/:productId', authenticateUser, cartController.removeFromCart);
router.get('/', authenticateUser, cartController.getUserCart);



module.exports = router;
