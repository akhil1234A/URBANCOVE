const express = require('express');
const router = express.Router();
const couponController = require('../controllers/admin/CouponController');
const couponUserController = require('../controllers/user/couponController')
const {adminAuth} = require('../middlewares/authMiddleware')
const userAuth = require('../middlewares/authenticate')


//Admin: Coupon Management 
router.post('/',adminAuth, couponController.createCoupon);
router.patch('/:couponId', adminAuth, couponController.editCoupon);
router.delete('/:couponId',adminAuth, couponController.deleteCoupon);
router.get('/',adminAuth,couponController.getAllCoupons);


//User: Coupon Apply and Remove
router.post('/apply',userAuth, couponUserController.applyCoupon);
router.post('/remove',userAuth, couponUserController.removeCoupon);
router.get('/list', userAuth, couponUserController.listApplicableCoupons);


module.exports = router;