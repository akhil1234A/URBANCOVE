const express = require("express");
const router = express.Router();
const {listUniqueActiveCategories, listUniqueActiveSubCategories} = require('../controllers/admin/subCategoryController');


router.get("/subcategories", listUniqueActiveSubCategories);
router.get("/categories",listUniqueActiveCategories);

module.exports = router;
