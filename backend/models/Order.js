const mongoose = require('mongoose');
const crypto = require('crypto');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderReference: { type: String, unique: true }, 
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  paymentMethod: { type: String, enum: ['cod', 'wallet', 'razorpay'], required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded', 'Cancelled'], default: 'Pending' },
  deliveryAddress: { type: Object, required: true },
  totalAmount: { type: Number, required: true },
  discountAmount: { type: Number, required: true},
  status: { type: String, enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled', 'Returned'], default: 'Pending' },
  placedAt: { type: Date, default: Date.now },
  returnedAt: { type: Date }, 
  razorpayOrderId: {type: String}
});

orderSchema.pre('save', function (next) {
  try {
    // Generate orderReference if not present
    if (!this.orderReference) {
      const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase(); 
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, ''); 
      this.orderReference = `ORD-${datePart}-${randomSuffix}`;
    }

    console.log(`Processing order: ID=${this._id}, Status=${this.status}, Payment Method=${this.paymentMethod}`);

    // Ensure valid state transitions
    if (this.isModified('status')) {
      if (this.status === 'Cancelled' && ['Shipped', 'Delivered'].includes(this.previousStatus)) {
        return next(new Error("Cannot cancel an order already shipped or delivered."));
      }
    }

    // Payment method: COD
    if (this.paymentMethod === 'cod') {
      if (this.status === 'Cancelled') {
        this.paymentStatus = 'Cancelled';
      } else if (this.status === 'Returned') {
        this.paymentStatus = 'Refunded';
      } else if (this.status === 'Delivered') {
        this.paymentStatus = 'Paid';
      }
    }

    // Payment method: Razorpay
    if (this.paymentMethod === 'razorpay') {
      if (this.paymentStatus === 'Failed') {
        if (this.status === 'Delivered') {
          this.paymentStatus = 'Paid';
          this.paymentMethod = 'cod'; 
        }
      } else {
        if (this.status === 'Cancelled' || this.status === 'Returned') {
          this.paymentStatus = 'Refunded';
        } else if (this.status === 'Delivered') {
          this.paymentStatus = 'Paid';
        }
      }
    }

    // Payment method: Wallet
    if (this.paymentMethod === 'wallet') {
      if (this.status === 'Returned') {
        this.paymentStatus = 'Refunded';
      } else if (this.status === 'Delivered') {
        this.paymentStatus = 'Paid';
      }
    }

    next(); 
  } catch (error) {
    next(error); 
  }
});






module.exports = mongoose.model('Order', orderSchema);




