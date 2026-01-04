const express = require('express');
const router = express.Router();
const offerController = require('../controllers/admin/OfferController');
const {adminAuth} = require('../middlewares/authMiddleware');

// Admin: Offer Management
router.post('/', adminAuth, offerController.createOffer); 
router.put('/:offerId', adminAuth, offerController.editOffer); 
router.patch('/:offerId', adminAuth, offerController.softDeleteOffer); 
router.get('/:offerId', adminAuth, offerController.getOffer); 
router.get('/', adminAuth, offerController.listOffers); 

module.exports = router;
