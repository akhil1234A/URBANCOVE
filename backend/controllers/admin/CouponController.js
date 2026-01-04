const Coupon = require("../../models/Coupon");
const User = require("../../models/User");
const logger = require("../../utils/logger");
const httpStatus = require("../../constants/httpStatus");
const Messages = require("../../constants/messages");

/**
 * Admin: Create a new coupon
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      validFrom,
      validUntil,
      usageLimit,
      minPurchase,
      maxDiscount,
    } = req.body;

    const couponExist = await Coupon.findOne({ code });

    if (couponExist)
      return res.status(httpStatus.BAD_REQUEST).json({ message: Messages.COUPON_EXISTS });

    const coupon = new Coupon({
      code,
      discountType,
      discountValue,
      validFrom,
      validUntil,
      usageLimit,
      minPurchase,
      maxDiscount,
    });

    await coupon.save();
    return res.status(httpStatus.CREATED).json(coupon);
  } catch (error) {
    logger.error(error.message);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.SERVER_ERROR });
  }
};

/**
 * Admin: Edit an existing coupon
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.editCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    const {
      discountValue,
      validFrom,
      validUntil,
      usageLimit,
      minPurchase,
      maxDiscount,
    } = req.body;

    const coupon = await Coupon.findByIdAndUpdate(
      couponId,
      {
        discountValue,
        validFrom,
        validUntil,
        usageLimit,
        minPurchase,
        maxDiscount,
      },
      { new: true }
    );

    if (!coupon) {
      return res.status(httpStatus.NOT_FOUND).json({ message: Messages.COUPON_NOT_FOUND });
    }

    return res.status(httpStatus.OK).json(coupon);
  } catch (error) {
    logger.error(error.message);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.SERVER_ERROR });
  }
};

/**
 * Admin: Delete a coupon (soft delete)
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
      return res.status(httpStatus.NOT_FOUND).json({ message: Messages.COUPON_NOT_FOUND });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    return res
      .status(httpStatus.OK)
      .json({ message: Messages.COUPON_DELETED, coupon });
  } catch (error) {
    logger.error(error.message);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.SERVER_ERROR });
  }
};

/**
 * Admin: Get all coupons
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    return res.status(httpStatus.OK).json(coupons);
  } catch (error) {
    logger.error(error.message);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.SERVER_ERROR });
  }
};

