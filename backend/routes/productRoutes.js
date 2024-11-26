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


//Admin: Product Management 

router.get('/', listProducts);
router.get('/:productId?', listProducts);
router.post('/', adminAuth, upload.array('images', 4), addProduct);
router.patch('/:id', adminAuth, upload.array('images', 4), editProduct);
router.patch('/:productId/delete', adminAuth, deleteProduct);

module.exports = router;
