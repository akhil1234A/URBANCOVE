const express = require('express');
const { addSubCategory, listSubCategories, editSubCategory, deleteSubCategory } = require('../controllers/subCategoryController');
const router = express.Router();
const {adminAuth} = require('../middlewares/authMiddleware')


//Admin: Sub Category Management 
router.post('/', adminAuth, addSubCategory);
router.get('/', adminAuth, listSubCategories);
router.put('/:id', adminAuth, editSubCategory);
router.patch('/:id', adminAuth, deleteSubCategory);

module.exports = router;
