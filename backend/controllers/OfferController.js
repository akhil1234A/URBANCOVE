const Offer = require('../models/Offer'); 
const logger = require('../utils/logger');

// Admin: Create a new offer
exports.createOffer = async (req, res) => {
  try {
    const {
      name, 
      offerType, 
      selectedItems, 
      discountType, 
      discountValue, 
      startDate, 
      endDate 
    } = req.body;
  

    const newOffer = new Offer({
      name,
      type: offerType,
      categories: offerType === 'category' ? selectedItems : [],
      products: offerType === 'product' ? selectedItems : [],
      discountType,
      discountValue,
      startDate,
      endDate,
      isActive: true,
    });

    
    await newOffer.save();
    res.status(201).json({ message: 'Offer created successfully', offer: newOffer });
  } catch (error) {
    res.status(500).json({ message: 'Error creating offer', error });
  }
};

// Admin: Edit an existing offer
exports.editOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const {
      name,
      type,
      categories,
      products,
      discountType,
      discountValue,
      startDate,
      endDate,
      isActive,
    } = req.body;

    const updatedOffer = await Offer.findByIdAndUpdate(
      offerId,
      {
        name,
        type,
        categories,
        products,
        discountType,
        discountValue,
        startDate,
        endDate,
        isActive,
      },
      { new: true } 
    );

    if (!updatedOffer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    res.status(200).json({ message: 'Offer updated successfully', offer: updatedOffer });
  } catch (error) {
    res.status(500).json({ message: 'Error updating offer', error });
  }
};

// Admin: Soft delete an offer (set isActive to false)
exports.softDeleteOffer = async (req, res) => {
  try {
    const { offerId } = req.params;


    const offer = await Offer.findById(offerId);
    if(!offer){
      return res.status(404).json({message: 'Offer not found'});
    }
    offer.isActive = !offer.isActive; 
    const updatedOffer = await offer.save();
    res.status(200).json({
    message: `Offer ${updatedOffer.isActive ? 'activated' : 'deactivated'} successfully`,
    offer: updatedOffer,
   })
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ message: 'Error toggling offer status', error });
  }
};

// Admin: Get offer details
exports.getOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const offer = await Offer.findById(offerId).populate('categories products');

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    res.status(200).json({ offer });
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ message: 'Error fetching offer', error });
  }
};

// Admin: List all offers (active or inactive)
exports.listOffers = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate('categories products')
      .sort({ startDate: -1 }); 

    res.status(200).json({ offers });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching offers', error });
  }
};
