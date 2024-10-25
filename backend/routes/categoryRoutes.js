const express = require('express');
const {addCategory, editCategory, listCategories, deleteCategory} = require('../controllers/categoryController')
const {adminAuth} = require('../middlewares/authMiddleware');

const router = express.Router();


//category management

router.get('/', adminAuth, listCategories);
router.post('/',adminAuth, addCategory);
router.put('/:id', adminAuth, editCategory);

//soft delete

router.delete('/:id',adminAuth, deleteCategory);


module.exports = router;