const Coupon = require("../../models/Coupon");
const User = require("../../models/User");
const logger = require("../../utils/logger");

// Admin: Create a new coupon
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
      return res.status(400).json({ message: "Coupon Already Exist" });

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
    return res.status(201).json(coupon);
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// Admin: Edit an existing coupon
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
      return res.status(404).json({ message: "Coupon not found" });
    }

    return res.status(200).json(coupon);
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// Admin: Soft delete (mark as inactive) a coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    return res
      .status(200)
      .json({ message: "Coupon deleted successfully", coupon });
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// Admin: Get all coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    return res.status(200).json(coupons);
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

