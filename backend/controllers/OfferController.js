const Offer = require('../models/Offer'); 

// Create a new offer
exports.createOffer = async (req, res) => {
  try {
    const { 
      name, 
      type, 
      categories, 
      products, 
      discountType, 
      discountValue, 
      maxDiscountAmount, 
      minCartValue, 
      startDate, 
      endDate, 
      isActive 
    } = req.body;

    const newOffer = new Offer({
      name,
      type,
      categories,
      products,
      discountType,
      discountValue,
      maxDiscountAmount,
      minCartValue,
      startDate,
      endDate,
      isActive,
    });

    // Save offer to database
    await newOffer.save();
    res.status(201).json({ message: 'Offer created successfully', offer: newOffer });
  } catch (error) {
    res.status(500).json({ message: 'Error creating offer', error });
  }
};

// Edit an existing offer
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
      maxDiscountAmount,
      minCartValue,
      startDate,
      endDate,
      isActive,
    } = req.body;

    // Find offer by ID and update
    const updatedOffer = await Offer.findByIdAndUpdate(
      offerId,
      {
        name,
        type,
        categories,
        products,
        discountType,
        discountValue,
        maxDiscountAmount,
        minCartValue,
        startDate,
        endDate,
        isActive,
      },
      { new: true } // Return the updated offer
    );

    if (!updatedOffer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    res.status(200).json({ message: 'Offer updated successfully', offer: updatedOffer });
  } catch (error) {
    res.status(500).json({ message: 'Error updating offer', error });
  }
};

// Soft delete an offer (set isActive to false)
exports.softDeleteOffer = async (req, res) => {
  try {
    const { offerId } = req.params;

    const deletedOffer = await Offer.findByIdAndUpdate(
      offerId,
      { isActive: false },
      { new: true } // Return the updated offer
    );

    if (!deletedOffer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    res.status(200).json({ message: 'Offer deactivated successfully', offer: deletedOffer });
  } catch (error) {
    res.status(500).json({ message: 'Error deactivating offer', error });
  }
};

// Get offer details
exports.getOffer = async (req, res) => {
  try {
    const { offerId } = req.params;

    const offer = await Offer.findById(offerId).populate('categories products');

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    res.status(200).json({ offer });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching offer', error });
  }
};

// List all offers (active or inactive)
exports.listOffers = async (req, res) => {
  try {
    const { isActive = true } = req.query; // Default to active offers

    const offers = await Offer.find({ isActive })
      .populate('categories products')
      .sort({ startDate: -1 }); // Sort by latest start date

    res.status(200).json({ offers });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching offers', error });
  }
};
