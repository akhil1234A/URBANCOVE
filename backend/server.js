const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));    

connectDB()


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

app.use('/admin', adminRoutes);
app.use('/admin/categories',categoryRoutes);
app.use('/admin/categories/subcategories',subCategoryRoutes);
app.use('/admin/products',productRoutes);
app.use('/admin/offers', offerRoutes);
app.use('/user',userRoutes);
app.use('/user/address',addressRoutes);
app.use('/user/cart', cartRoutes)
app.use('/user/wishlist',wishlistRoutes);
app.use('/user/wallet',walletRoutes);
app.use('/orders', orderRoutes);
app.use('/coupons',couponRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
