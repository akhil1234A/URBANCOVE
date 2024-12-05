const express = require('express');
const router = express.Router();
const couponController = require('../controllers/CouponController');
const {adminAuth} = require('../middlewares/authMiddleware')
const userAuth = require('../middlewares/authenticate')


//Admin: Coupon Management 
router.post('/',adminAuth, couponController.createCoupon);
router.patch('/:couponId', adminAuth, couponController.editCoupon);
router.delete('/:couponId',adminAuth, couponController.deleteCoupon);
router.get('/',adminAuth,couponController.getAllCoupons);


//User: Coupon Apply and Remove
router.post('/apply',userAuth, couponController.applyCoupon);
router.post('/remove',userAuth, couponController.removeCoupon);
router.get('/list',couponController.listApplicableCoupons);


module.exports = router;