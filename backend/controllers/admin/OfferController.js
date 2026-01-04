const Offer = require('../../models/Offer'); 
const logger = require('../../utils/logger');
const httpStatus = require('../../constants/httpStatus');
const Messages = require('../../constants/messages');

/**
 * Admin: Create a new offer
 * @param {q} req 
 * @param {*} res 
 */
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
    res.status(httpStatus.CREATED).json({ message: Messages.OFFER_ADDED, offer: newOffer });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.SERVER_ERROR, error });
  }
};

/**
 * Admin: Edit an existing offer
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
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
      return res.status(httpStatus.NOT_FOUND).json({ message: Messages.OFFER_NOT_FOUND });
    }

    res.status(httpStatus.OK).json({ message: Messages.OFFER_UPDATED_SUCCESSFULLY, offer: updatedOffer });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.SERVER_ERROR, error });
  }
};

/**
 * Admin: Soft delete (activate/deactivate) an offer
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.softDeleteOffer = async (req, res) => {
  try {
    const { offerId } = req.params;


    const offer = await Offer.findById(offerId);
    if(!offer){
      return res.status(httpStatus.NOT_FOUND).json({message: Messages.OFFER_NOT_FOUND});
    }
    offer.isActive = !offer.isActive; 
    const updatedOffer = await offer.save();
    res.status(httpStatus.OK).json({
    message: `Offer ${updatedOffer.isActive ? 'activated' : 'deactivated'} successfully`,
    offer: updatedOffer,
   })
  } catch (error) {
    logger.error(error.message);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.SERVER_ERROR, error });
  }
};

/**
 * Admin: Get details of a specific offer
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.getOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const offer = await Offer.findById(offerId).populate('categories products');

    if (!offer) {
      return res.status(httpStatus.NOT_FOUND).json({ message: Messages.OFFER_NOT_FOUND });
    }

    res.status(httpStatus.OK).json({ offer });
  } catch (error) {
    logger.error(error.message);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.SERVER_ERROR, error });
  }
};

/**
 * Admin: List all offers
 * @param {*} req 
 * @param {*} res 
 */
exports.listOffers = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate('categories products')
      .sort({ startDate: -1 }); 

    res.status(httpStatus.OK).json({ offers });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.SERVER_ERROR, error });
  }
};
