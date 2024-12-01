const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
  if (this.paymentMethod === 'cod') { 
    if (this.status === 'Cancelled') { 
      this.paymentStatus = 'Cancelled'; 
    } 
    else if (this.status === 'Returned') 
    { this.paymentStatus = 'Refunded'; 

    } 
    else if (this.status === 'Delivered'){
      this.paymentStatus = 'Paid';
    }
  } 

  if(this.paymentMethod === 'razorpay'){
    if(this.status === 'Cancelled' || this.status === 'Returned'){
      this.paymentStatus = 'Refunded';
    }
  }
  next(); 
});

module.exports = mongoose.model('Order', orderSchema);




