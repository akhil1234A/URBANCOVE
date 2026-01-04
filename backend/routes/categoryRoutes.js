const express = require('express');
const {addCategory, editCategory, listCategories, deleteCategory} = require('../controllers/admin/categoryController')
const {adminAuth} = require('../middlewares/authMiddleware');
const {listSubCategories} = require('../controllers/admin/subCategoryController')
const router = express.Router();

//Admin: Category management Routes


router.get('/', adminAuth, listCategories);
router.get('/:categoryId/subcategories', listSubCategories);
router.post('/',adminAuth, addCategory);
router.put('/:id', adminAuth, editCategory);
router.delete('/:id',adminAuth, deleteCategory);


module.exports = router;