const express = require('express');
const router = express.Router();
const couponController = require('../controllers/CouponController');
const {adminAuth} = require('../middlewares/authMiddleware')
const userAuth = require('../middlewares/authenticate')


//admin controller 
router.post('/',adminAuth, couponController.createCoupon);
router.patch('/:couponId', adminAuth, couponController.editCoupon);
router.delete('/:couponId',adminAuth, couponController.deleteCoupon);
router.get('/',adminAuth,couponController.getAllCoupons);


//user controller
router.post('/apply',userAuth, couponController.applyCoupon);
router.post('/remove',userAuth, couponController.removeCoupon);


module.exports = router;