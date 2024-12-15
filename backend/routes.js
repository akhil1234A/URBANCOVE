const express = require('express');
const router = express.Router();

const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subCategoryRoutes = require('./routes/subCategoryRoutes');
const productRoutes = require('./routes/productRoutes')
const userRoutes = require('./routes/userRoutes');
const addressRoutes = require('./routes/addressRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const offerRoutes = require('./routes/offerRoutes');
const couponRoutes = require('./routes/couponRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes')
const walletRoutes = require('./routes/walletRoutes')
const salesRoutes = require('./routes/salesRoute');
const collectionRoutes = require('./routes/collectionRoutes');


router.use('/admin', adminRoutes);
router.use('/admin/categories',categoryRoutes);
router.use('/admin/categories/subcategories',subCategoryRoutes);
router.use('/products',productRoutes);
router.use('/admin/offers', offerRoutes);
router.use('/admin/sales-report',salesRoutes);
router.use('/user',userRoutes);
router.use('/user/address',addressRoutes);
router.use('/user/cart', cartRoutes)
router.use('/user/wishlist',wishlistRoutes);
router.use('/user/wallet',walletRoutes);
router.use('/orders', orderRoutes);
router.use('/coupons',couponRoutes);
router.use('/collection',collectionRoutes);


module.exports = router;
