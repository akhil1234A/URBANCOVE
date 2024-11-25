const Coupon = require('../models/Coupon');
const User = require('../models/User');

// Admin: Create a new coupon
exports.createCoupon = async (req, res) => {
  try {
   
    const { code, discountType, discountValue, validFrom, validUntil, usageLimit, minPurchase, maxDiscount } = req.body;

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
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Edit an existing coupon
exports.editCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    const { discountValue, validFrom, validUntil, usageLimit, minPurchase, maxDiscount } = req.body;

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
      return res.status(404).json({ message: 'Coupon not found' });
    }

    return res.status(200).json(coupon);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Soft delete (mark as inactive) a coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;

    const coupon = await Coupon.findByIdAndUpdate(couponId, { isActive: false }, { new: true });

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    return res.status(200).json({ message: 'Coupon deleted successfully', coupon });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Get all coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    return res.status(200).json(coupons);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};




// User: Apply a coupon to the cart
exports.applyCoupon = async (req, res) => {
  try {
    const { couponCode, total: cartTotal } = req.body;
    const userId = req.user.id;
    
    
    // Fetch coupon by code
    const coupon = await Coupon.findOne({ code: couponCode, isActive: true });

    if (!coupon) {
      return res.status(400).json({ message: 'Coupon not found or inactive' });
    }

    // Check if coupon is expired
    const currentDate = new Date();
    if (coupon.validUntil < currentDate) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    // Check if the cart meets the minimum purchase requirement
    if (cartTotal < coupon.minPurchase) {
      return res.status(400).json({ message: `Minimum purchase amount is ₹${coupon.minPurchase}` });
    }

    // Check if the coupon usage limit is exceeded
    if (coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    // Check if the user has exceeded their usage limit
    const userCoupon = coupon.userUsage.find((usage) => usage.userId.toString() === userId);
    if (userCoupon && userCoupon.count >= 1) {
      return res.status(400).json({ message: 'You have already used this coupon the maximum number of times' });
    }

    // Calculate the discount
    let discount = coupon.discountValue;
    if (coupon.discountType === 'percentage') {
      discount = Math.min((cartTotal * coupon.discountValue) / 100, coupon.maxDiscount || Infinity);
    }

    // Apply coupon and update usage count
    if (!userCoupon) {
      coupon.userUsage.push({ userId, count: 1 });
    } else {
      userCoupon.count += 1;
    }

    coupon.usageCount += 1;
    await coupon.save();

    return res.status(200).json({ message: 'Coupon applied successfully', discount });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// User: Remove a coupon from the cart
exports.removeCoupon = async (req, res) => {
  try {
    
    const { couponCode} = req.body;
    const userId = req.user.id;

    // Fetch coupon by code
    const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
  ;
    if (!coupon) {
      return res.status(400).json({ message: 'Coupon not found or inactive' });
    }

    // Remove the user's usage record
    const userCouponIndex = coupon.userUsage.findIndex((usage) => usage.userId.toString() === userId);
    if (userCouponIndex !== -1) {
      coupon.userUsage.splice(userCouponIndex, 1);
      coupon.usageCount -= 1;
      await coupon.save();
      return res.status(200).json({ message: 'Coupon removed successfully' });
    } else {
      return res.status(400).json({ message: 'You have not applied this coupon' });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
