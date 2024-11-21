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
  paymentMethod: { type: String, enum: ['cod', 'stripe', 'razorpay'], required: true },
  deliveryAddress: { type: Object, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled', 'Returned'], default: 'Pending' },
  placedAt: { type: Date, default: Date.now },
  returnedAt: { type: Date }, 
  razorpayOrderId: {type: String}
});

module.exports = mongoose.model('Order', orderSchema);




