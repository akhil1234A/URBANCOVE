const express = require('express');
const { addSubCategory, listSubCategories, editSubCategory, deleteSubCategory } = require('../controllers/subCategoryController');
const router = express.Router();


router.post('/', addSubCategory);

router.get('/', listSubCategories);

router.put('/:id', editSubCategory);

// Soft delete a subcategory
router.delete('/:id', deleteSubCategory);

module.exports = router;
