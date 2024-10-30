const express = require('express');
const { addSubCategory, listSubCategories, editSubCategory, deleteSubCategory } = require('../controllers/subCategoryController');
const router = express.Router();
const {adminAuth} = require('../middlewares/authMiddleware')


router.post('/', adminAuth, addSubCategory);

router.get('/', adminAuth, listSubCategories);

router.put('/:id', adminAuth, editSubCategory);

// Soft delete a subcategory
router.delete('/:id', adminAuth, deleteSubCategory);

module.exports = router;
