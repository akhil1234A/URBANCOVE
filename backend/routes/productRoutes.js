const express = require('express');
const { addProduct, editProduct, listProducts, deleteProduct, adminListProducts, getLatestProducts, getBestSellerProducts } = require('../controllers/productController');
const { adminAuth } = require('../middlewares/authMiddleware');
const multer = require('multer');  

const router = express.Router();

// multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/products'); // Set your upload directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage });



//Home
router.get('/', listProducts);
router.get('/latest', getLatestProducts);
router.get('/best-sellers',getBestSellerProducts);

//Admin: Product Management 
router.get('/admin',adminListProducts);
router.get('/admin/:productId?', listProducts);
router.post('/admin/', adminAuth, upload.array('images', 4), addProduct);
router.patch('/admin/:id', adminAuth, upload.array('images', 4), editProduct);
router.patch('/admin/:productId/delete', adminAuth, deleteProduct);

module.exports = router;
