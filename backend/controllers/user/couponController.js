const Coupon = require("../../models/Coupon");
const User = require("../../models/User");
const logger = require("../../utils/logger");
const httpStatus = require("../../constants/httpStatus");
const Messages = require("../../constants/messages");


/**
 * User: Apply a coupon to the cart
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.applyCoupon = async (req, res) => {
  try {
    const { couponCode, total: cartTotal } = req.body;
    const userId = req.user.id;

    const coupon = await Coupon.findOne({ code: couponCode, isActive: true });

    if (!coupon) {
      return res.status(httpStatus.NOT_FOUND).json({ message: Messages.COUPON_NOT_FOUND });
    }

    const currentDate = new Date();
    if (coupon.validUntil < currentDate) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: Messages.COUPON_EXPIRED });
    }

    if (cartTotal < coupon.minPurchase) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: `Minimum purchase amount is ₹${coupon.minPurchase}` });
    }

    if (coupon.usageCount >= coupon.usageLimit) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: "Coupon usage limit reached" });
    }

    const userCoupon = coupon.userUsage.find(
      (usage) => usage.userId.toString() === userId
    );
    if (userCoupon && userCoupon.count >= 1) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({
          message:
            "You have already used this coupon the maximum number of times",
        });
    }

    let discount = coupon.discountValue;
    if (coupon.discountType === "percentage") {
      discount = Math.min(
        (cartTotal * coupon.discountValue) / 100,
        coupon.maxDiscount || Infinity
      );
    }

    // Apply coupon and update usage count
    if (!userCoupon) {
      coupon.userUsage.push({ userId, count: 1 });
    } else {
      userCoupon.count += 1;
    }

    coupon.usageCount += 1;
    await coupon.save();

    return res
      .status(httpStatus.CREATED)
      .json({ message: "Coupon applied successfully", discount });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: error.message });
  }
};

/**
 * User: Remove a coupon from the cart
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.removeCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    const userId = req.user.id;

    const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
    if (!coupon) {
      return res.status(httpStatus.NOT_FOUND).json({ message: Messages.COUPON_NOT_FOUND });
    }

    // Remove the user's usage record
    const userCouponIndex = coupon.userUsage.findIndex(
      (usage) => usage.userId.toString() === userId
    );
    if (userCouponIndex !== -1) {
      coupon.userUsage.splice(userCouponIndex, 1);
      coupon.usageCount -= 1;
      await coupon.save();
      return res.status(httpStatus.OK).json({ message: "Coupon removed successfully" });
    } else {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: "You have not applied this coupon" });
    }
  } catch (error) {
    logger.error(error.message);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
  }
};

/**
 * User: List Applicable Coupons
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.listApplicableCoupons = async (req, res) => {
  try {
    const currentDate = new Date();
    const userId = req.user.id;

    const applicableCoupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: currentDate },
      validUntil: { $gte: currentDate },
      $expr: { $lt: ["$usageCount", "$usageLimit"] },
      userUsage: {
        $not: {
          $elemMatch: { userId },
        },
      },
    }).select("-userUsage -usageCount -usageLimit");

    if (applicableCoupons.length === 0) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "No applicable coupons found." });
    }

    res.status(httpStatus.OK).json({
      message: "Applicable coupons retrieved successfully.",
      coupons: applicableCoupons,
    });
  } catch (error) {
    console.error("Error fetching applicable coupons:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error", error });
  }
};
