const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const passport=require('passport');

dotenv.config();
require('./config/passport')(passport);



const app = express();
app.use(express.json());
app.use(cors());

app.use(passport.initialize());

const PORT = process.env.PORT || 5000;


mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));


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


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
