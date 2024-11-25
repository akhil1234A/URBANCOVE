const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();




const app = express();
app.use(express.json());
app.use(cors());



const PORT = process.env.PORT || 5000;


mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));    

const adminRoutes = require('./routes/adminRoutes');
app.use('/admin', adminRoutes);

const categoryRoutes = require('./routes/categoryRoutes');
app.use('/admin/categories',categoryRoutes);

const subCategoryRoutes = require('./routes/subCategoryRoutes');
app.use('/admin/categories/subcategories',subCategoryRoutes);

const productRoutes = require('./routes/productRoutes')
app.use('/admin/products',productRoutes);


const userRoutes = require('./routes/userRoutes');
app.use('/user',userRoutes);

const addressRoutes = require('./routes/addressRoutes');
app.use('/user/address',addressRoutes);

const cartRoutes = require('./routes/cartRoutes');
app.use('/user/cart', cartRoutes)

const orderRoutes = require('./routes/orderRoutes');
app.use('/orders', orderRoutes);

const offerRoutes = require('./routes/offerRoutes');
app.use('/admin/offers', offerRoutes);

const couponRoutes = require('./routes/couponRoutes');
app.use('/coupons',couponRoutes)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
