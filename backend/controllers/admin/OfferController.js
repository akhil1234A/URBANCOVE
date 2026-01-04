const offerService = require('../../services/offer.service');
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
    const offer = await offerService.createOffer(req.body);
    res.status(httpStatus.CREATED).json({
      message: Messages.OFFER_ADDED,
      offer,
    });
  } catch (error) {
    logger.error(error);
    res.status(httpStatus.BAD_REQUEST).json({
      message: error.message === 'OFFER_NOT_FOUND'
        ? Messages.OFFER_NOT_FOUND
        : error.message,
    });
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
    const offer = await offerService.updateOffer(req.params.offerId, req.body);
    res.status(httpStatus.OK).json({
      message: Messages.OFFER_UPDATED_SUCCESSFULLY,
      offer,
    });
  } catch (error) {
    logger.error(error);
    res.status(
      error.message === 'OFFER_NOT_FOUND'
        ? httpStatus.NOT_FOUND
        : httpStatus.BAD_REQUEST
    ).json({
      message:
        error.message === 'OFFER_NOT_FOUND'
          ? Messages.OFFER_NOT_FOUND
          : error.message,
    });
  }
};

/**
 * Admin: (activate/deactivate) an offer
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.toggleOfferStatus = async (req, res) => {
  try {
    const offer = await offerService.toggleOfferStatus(req.params.offerId);
    res.status(httpStatus.OK).json({
      message: `Offer ${offer.isActive ? 'activated' : 'deactivated'} successfully`,
      offer,
    });
  } catch (error) {
    logger.error(error);
    res.status(httpStatus.NOT_FOUND).json({
      message: Messages.OFFER_NOT_FOUND,
    });
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
    const offer = await offerService.getOfferById(req.params.offerId);
    res.status(httpStatus.OK).json({ offer });
  } catch (error) {
    logger.error(error);
    res.status(httpStatus.NOT_FOUND).json({
      message: Messages.OFFER_NOT_FOUND,
    });
  }
};

/**
 * Admin: List all offers
 * @param {*} req 
 * @param {*} res 
 */
exports.listOffers = async (_req, res) => {
  try {
    const offers = await offerService.listOffers();
    res.status(httpStatus.OK).json({ offers });
  } catch (error) {
    logger.error(error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: Messages.SERVER_ERROR,
    });
  }
};
