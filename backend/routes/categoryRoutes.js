const express = require('express');
const {addCategory, editCategory, listCategories, deleteCategory} = require('../controllers/categoryController')
const {adminAuth} = require('../middlewares/authMiddleware');
const {listSubCategories} = require('../controllers/subCategoryController')
const router = express.Router();


//category management

router.get('/', adminAuth, listCategories);
router.get('/:categoryId/subcategories', listSubCategories);


router.post('/',adminAuth, addCategory);
router.put('/:id', adminAuth, editCategory);

//soft delete

router.delete('/:id',adminAuth, deleteCategory);


module.exports = router;