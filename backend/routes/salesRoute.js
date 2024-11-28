const express = require('express');
const generateSalesReport = require('../controllers/salesController');
const { adminAuth } = require('../middlewares/authMiddleware');
const { validateInput } = require('../controllers/salesController'); 
const router = express.Router();

router.post('/generate-sales-report', adminAuth, validateInput, generateSalesReport.generateSalesReport); 
router.post('/generate-pdf', adminAuth, validateInput, generateSalesReport.generatePDF); 
router.post('/generate-excel', adminAuth, validateInput, generateSalesReport.generateExcel);

module.exports = router;
