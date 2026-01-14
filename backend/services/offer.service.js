const Offer = require('../models/Offer');

/**
 * Internal helper — single source of truth
 */
function mapOfferTargets({ offerType, selectedItems }) {
  if (!['product', 'category'].includes(offerType)) {
    throw new Error('Invalid offer type');
  }

  if (!Array.isArray(selectedItems) || selectedItems.length === 0) {
    throw new Error('Offer must target at least one item');
  }

  return {
    type: offerType,
    products: offerType === 'product' ? selectedItems : [],
    categories: offerType === 'category' ? selectedItems : [],
  };
}

function validateDates(startDate, endDate) {
  if (new Date(startDate) >= new Date(endDate)) {
    throw new Error('Invalid offer date range');
  }
}

class OfferService {
  async createOffer(data) {
    const {
      name,
      offerType,
      selectedItems,
      discountType,
      discountValue,
      startDate,
      endDate,
    } = data;

    validateDates(startDate, endDate);

    const targets = mapOfferTargets({ offerType, selectedItems });

    const offer = new Offer({
      name,
      ...targets,
      discountType,
      discountValue,
      startDate,
      endDate,
      isActive: true,
    });

    return await offer.save();
  }

  async updateOffer(offerId, data) {
    const {
      name,
      type: offerType,
      selectedItems,
      discountType,
      discountValue,
      startDate,
      endDate,
      isActive,
    } = data;

    if (startDate && endDate) {
      validateDates(startDate, endDate);
    }

    let targetUpdate = {};

    if (offerType && selectedItems) {
      targetUpdate = mapOfferTargets({ offerType, selectedItems });
    }


    const updatedOffer = await Offer.findByIdAndUpdate(
      offerId,
      {
        name,
        ...targetUpdate,
        discountType,
        discountValue,
        startDate,
        endDate,
        isActive,
      },
      { new: true }
    );

    if (!updatedOffer) {
      throw new Error('OFFER_NOT_FOUND');
    }

    return updatedOffer;
  }

  async toggleOfferStatus(offerId) {
    const offer = await Offer.findById(offerId);
    if (!offer) {
      throw new Error('OFFER_NOT_FOUND');
    }

    offer.isActive = !offer.isActive;
    return await offer.save();
  }

  async getOfferById(offerId) {
    const offer = await Offer.findById(offerId).populate('categories products');
    if (!offer) {
      throw new Error('OFFER_NOT_FOUND');
    }
    return offer;
  }

  async listOffers() {
    return Offer.find()
      .populate('categories products')
      .sort({ startDate: -1 });
  }
  
  async getActiveOffersForPricing() {
    const now = new Date();

    return Offer.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });
  }
}

module.exports = new OfferService();
