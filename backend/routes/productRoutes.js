const express = require('express');
const { addProduct, editProduct, listProducts, deleteProduct } = require('../controllers/productController');
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


//product management routes

router.get('/', listProducts);

// Route to fetch a specific product by ID
router.get('/:productId?', listProducts);

router.post('/', adminAuth, upload.array('images', 4), addProduct);


router.put('/:id', adminAuth, upload.array('images', 4), editProduct);


router.delete('/:id', adminAuth, deleteProduct);

module.exports = router;
