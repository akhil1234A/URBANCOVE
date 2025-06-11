const Order = require("../../models/Order");
const Product = require("../../models/Product");
const Address = require("../../models/Address");
const Cart = require("../../models/Cart");
const Transaction = require('../../models/Transaction');
const razorpayInstance = require("../../utils/Razorpay");
const crypto = require('crypto');
const logger = require("../../utils/logger");

// User: Place an Order
const placeOrder = async (req, res) => {
  const { addressId, paymentMethod, cartItems, totalAmount } = req.body;
  const userId = req.user.id;
  const shippingCost = 40;

  try {
    if (paymentMethod === 'cod' && totalAmount > 1000) {
      return res.status(400).json({ message: "Order above Rs 1000 should not be allowed for COD" });
    }

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "No items in the order" });
    }

    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(400).json({ message: "Invalid delivery address" });
    }

    for (let item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          message: `Product ${item.productId} is out of stock or unavailable`,
        });
      }
    }

    for (let item of cartItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    const originalPrice = cartItems.reduce(
      (total, item) => total + item.originalPrice * item.quantity,
      0
    );

    const discountAmount = originalPrice - totalAmount + shippingCost;

    if (paymentMethod === 'wallet') {
      await Transaction.create({
        userId,
        amount: totalAmount,
        type: 'debit',
        description: 'Order payment using wallet',
      });
    }

    const newOrder = await Order.create({
      user: userId,
      items: cartItems,
      paymentMethod,
      paymentStatus: paymentMethod === 'wallet' ? 'Paid' : 'Pending',
      deliveryAddress: address,
      totalAmount,
      discountAmount,
      status: 'Pending',
    });

    await Cart.deleteMany({ userId });

    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ message: error.message });
  }
};

// User: View All Orders
const viewUserOrders = async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;

  try {
    const skip = (page - 1) * limit;

    const [orders, totalOrders] = await Promise.all([
      Order.find({ user: userId })
        .populate("items.productId", "productName price images")
        .populate("user", "_id name email")
        .sort({ placedAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ user: userId }),
    ]);

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    const totalPages = Math.ceil(totalOrders / limit);

    res.status(200).json({
      orders,
      currentPage: Number(page),
      totalPages,
      totalOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User: Cancel An Order
const cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  const { cancellationReason } = req.body; 
  const userId = req.user.id;

  try {
    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate("items.productId", "productName price")
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Pending") {
      return res.status(400).json({ message: "Order cannot be canceled, it is already processed" });
    }

    order.status = "Cancelled";
    if (cancellationReason) {
      order.cancellationReason = cancellationReason; 
    }
    await order.save();

    for (let item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    if (order.paymentMethod !== 'cod' && order.paymentStatus !== 'Failed') {
      await Transaction.create({
        userId,
        type: "credit",
        amount: order.totalAmount,
        description: `Refund for canceled order ${order.orderReference}`,
        date: new Date(),
      });
    }

    res.status(200).json({ message: "Order canceled successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User: View Specific Order
const viewOrder = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  try {
    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate("items.productId", "productName price images")
      .populate("user", "_id name email");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json({ order });
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ error: error.message });
  }
};


// User: Return an Order
const returnOrder = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  try {
    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Delivered") {
      return res.status(400).json({ message: "Only delivered orders can be returned." });
    }

    order.status = "Returned";
    await order.save();

    for (let item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    if (order.paymentStatus !== 'Refunded') {
      await Transaction.create({
        userId,
        type: "credit",
        amount: order.totalAmount,
        description: `Refund for returned order ${order.orderReference}`,
        date: new Date(),
      });
    }

    res.status(200).json({ message: "Order returned successfully", order });
  } catch (error) {
    console.error("Error processing return:", error);
    res.status(500).json({ message: "Failed to process the return." });
  }
};

// User: Create a Razor Pay Order
const createRazorpayOrder = async (req, res) => {
  const { orderId, totalAmount } = req.body;

  try {
    let order;
    if (orderId) {
      order = await Order.findById(orderId);
      if (!order || order.paymentStatus !== 'Failed') {
        return res.status(400).json({ message: 'Invalid or already paid order.' });
      }
    }

    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `order_rcptid_${new Date().getTime()}`,
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);
    res.status(201).json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ message: error.message });
  }
};

// User: Razor Pay Verification
const verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, cartItems, addressId, totalAmount, orderId } = req.body;
  const shippingCharge = 40;

  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    return res.status(400).json({ success: false, message: 'Payment verification failed' });
  }

  try {
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(400).json({ success: false, message: 'Order not found.' });
      }

      order.paymentStatus = 'Paid';
      await order.save();

      return res.status(200).json({ success: true, order });
    }

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'No items in the order' });
    }

    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(400).json({ message: 'Invalid delivery address' });
    }

    for (let item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          message: `Product ${item.productId} is out of stock or unavailable`,
        });
      }
    }

    for (let item of cartItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    const originalPrice = cartItems.reduce(
      (total, item) => total + item.originalPrice * item.quantity,
      0
    );

    const discountAmount = originalPrice + shippingCharge - totalAmount;

    const newOrder = await Order.create({
      user: req.user.id,
      items: cartItems,
      paymentMethod: 'razorpay',
      deliveryAddress: address,
      totalAmount,
      discountAmount,
      status: 'Pending',
      paymentStatus: 'Paid',
    });

    const userId = req.user.id;
    await Cart.deleteMany({ userId });
    res.status(200).json({ success: true, order: newOrder });
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ success: false, message: 'Failed to place order' });
  }
};

// Create Failed Order
const createFailedOrder = async (req, res) => {
  const { razorpayOrderId, cartItems, addressId, totalAmount } = req.body;
  const userId = req.user.id;
  const shippingCharge = 40;

  try {
    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(400).json({ message: 'Invalid delivery address' });
    }

    for (let item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          message: `Product ${item.productId} is out of stock or unavailable`,
        });
      }
    }

    for (let item of cartItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    const originalPrice = cartItems.reduce(
      (total, item) => total + item.originalPrice * item.quantity,
      0
    );

    const discountAmount = originalPrice + shippingCharge - totalAmount;

    const newOrder = await Order.create({
      user: req.user.id,
      items: cartItems,
      paymentMethod: 'razorpay',
      deliveryAddress: address,
      totalAmount,
      discountAmount,
      status: 'Pending',
      paymentStatus: 'Failed',
    });

    await Cart.deleteMany({ userId });

    res.status(201).json({ success: true, order: newOrder });
  } catch (error) {
    console.error("Failed to create failed order:", error);
    res.status(500).json({ success: false, message: 'Failed to log failed payment.' });
  }
};



module.exports = {
  placeOrder,
  cancelOrder,
  viewUserOrders,
  verifyPayment,
  createRazorpayOrder,
  createFailedOrder,
  returnOrder,
  viewOrder
};