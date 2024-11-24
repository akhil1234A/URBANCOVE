const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
    },
    maxDiscount: {
      type: Number, 
      required: function () {
        return this.discountType === 'percentage';
      },
      default: null,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      required: true,
      min: 1,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    minPurchase: {
      type: Number,
      required: true,
    },
    userUsage: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        count: {
          type: Number,
          default: 0,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default:true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
