const express = require('express');
const router = express.Router();
const cartController = require('../controllers/user/cartController');
const authenticateUser  = require('../middlewares/authenticate')

//User: Cart Management Routes
router.post('/', authenticateUser, cartController.addToCart);
router.get('/checkout', authenticateUser, cartController.cartCheckout);
router.put('/:productId', authenticateUser, cartController.updateCartItemQuantity);
router.delete('/:productId', authenticateUser, cartController.removeFromCart);
router.get('/', authenticateUser, cartController.getUserCart);



module.exports = router;
