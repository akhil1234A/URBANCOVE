const express = require('express');
const generateSalesReport = require('../controllers/admin/salesController');
const { adminAuth } = require('../middlewares/authMiddleware');
const { validateInput } = require('../controllers/admin/salesController'); 
const router = express.Router();

router.post('/generate-sales-report', adminAuth, validateInput, generateSalesReport.generateSalesReport); 
router.get('/counters', adminAuth, generateSalesReport.counters); 
router.get('/orders-chart', adminAuth, generateSalesReport.getOrdersChart);
router.get('/top-selling-product',adminAuth, generateSalesReport.getTopSellingProducts);
router.get('/top-selling-category',adminAuth, generateSalesReport.getTopSellingCategories);


module.exports = router;
