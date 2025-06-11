const express = require('express');
const { placeOrder, cancelOrder, viewOrder, viewAllOrders, updateOrderStatus, viewUserOrders, verifyPayment, createRazorpayOrder, createFailedOrder, returnOrder} = require('../controllers/orderController');
const authenticateUser  = require('../middlewares/authenticate')
const {adminAuth} = require('../middlewares/authMiddleware');
const router = express.Router();

// User: Order management 
router.post('/', authenticateUser, placeOrder); 
router.post('/razorpay', authenticateUser, createRazorpayOrder); 
router.post('/verify', authenticateUser, verifyPayment);
router.get('/user', authenticateUser, viewUserOrders)
router.get('/:orderId', authenticateUser, viewOrder);
router.post('/:orderId/cancel', authenticateUser, cancelOrder); 
router.post('/create-failed',authenticateUser,createFailedOrder);
router.post('/:orderId/return',authenticateUser, returnOrder )


// Admin: Order management 
router.get('/admin/orders', adminAuth, viewAllOrders); 
router.patch('/admin/orders/:orderId', adminAuth, updateOrderStatus); 

module.exports = router;
