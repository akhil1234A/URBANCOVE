const express = require('express');
const { placeOrder, cancelOrder, viewAllOrders, updateOrderStatus, viewUserOrders, verifyPayment, createRazorpayOrder} = require('../controllers/orderController');
const authenticateUser  = require('../middlewares/authenticate')
const {adminAuth} = require('../middlewares/authMiddleware');
const router = express.Router();

// User routes
router.post('/', authenticateUser, placeOrder); 
router.post('/razorpay', authenticateUser, createRazorpayOrder); 
router.post('/verify', authenticateUser, verifyPayment);
router.get('/user', authenticateUser, viewUserOrders)
router.put('/:orderId', authenticateUser, cancelOrder); 


// Admin routes
router.get('/admin/orders', adminAuth, viewAllOrders); 
router.patch('/admin/orders/:orderId', adminAuth, updateOrderStatus); 

module.exports = router;
