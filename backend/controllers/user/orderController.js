const Order = require("../../models/Order");
const Product = require("../../models/Product");
const Address = require("../../models/Address");
const Cart = require("../../models/Cart");
const Transaction = require('../../models/Transaction');
const razorpayInstance = require("../../utils/Razorpay");
const crypto = require('crypto');
const logger = require("../../utils/logger");
const httpStatus = require("../../constants/httpStatus");
const Messages = require("../../constants/messages");
const cartService = require("../../services/cart.service");

/**
 * User: Place an Order
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const placeOrder = async (req, res) => {
  const { addressId, paymentMethod } = req.body;
  const userId = req.user.id;
  const shippingCost = 40;

  try {
    const cart = await cartService.getCart(userId);

    const cartItems = await cartService.calculateLivePrice(cart);

    if (!cartItems || cartItems.length === 0) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: "No items in the order" });
    }


    const { cartPriceTotal, total } = cartService.calculateTotal(cartItems);
    const discountAmount = cartService.getCouponAmount(cartItems);
    const totalAmount = cartPriceTotal + shippingCost - discountAmount;


    if (paymentMethod === 'cod' && totalAmount > 1000) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: "Order above Rs 1000 should not be allowed for COD" });
    }


    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(httpStatus.NOT_FOUND).json({ message: Messages.ADDRESS_NOT_FOUND });
    }

    for (let item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(httpStatus.NOT_FOUND).json({
          message: `Product ${item.productId} is out of stock or unavailable`,
        });
      }
    }

    for (let item of cartItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }



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

    res.status(httpStatus.CREATED).json({ message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    logger.error(error.message);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

/**
 * User: View All Orders
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
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
      return res.status(httpStatus.NOT_FOUND).json({ message: "No orders found for this user" });
    }

    const totalPages = Math.ceil(totalOrders / limit);

    res.status(httpStatus.OK).json({
      orders,
      currentPage: Number(page),
      totalPages,
      totalOrders,
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

/**
 * User: Cancel An Order
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  const { cancellationReason } = req.body;
  const userId = req.user.id;

  try {
    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate("items.productId", "productName price")
      .populate("user", "name email");

    if (!order) {
      return res.status(httpStatus.NOT_FOUND).json({ message: Messages.ORDER_NOT_FOUND });
    }

    if (order.status !== "Pending") {
      return res.status(httpStatus.BAD_REQUEST).json({ message: "Order cannot be canceled, it is already processed" });
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

    res.status(httpStatus.OK).json({ message: "Order canceled successfully", order });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

/**
 * User: View Specific Order
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const viewOrder = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  try {
    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate("items.productId", "productName price images")
      .populate("user", "_id name email");

    if (!order) {
      return res.status(httpStatus.NOT_FOUND).json({ error: Messages.ORDER_NOT_FOUND });
    }

    res.status(httpStatus.OK).json({ order });
  } catch (error) {
    logger.error(error.message);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};


/**
 * User: Return an Order
 * @param {*} req
 * @param {*} res
 * @returns
 */
const returnOrder = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  try {
    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(httpStatus.NOT_FOUND).json({ message: Messages.ORDER_NOT_FOUND });
    }

    if (order.status !== "Delivered") {
      return res.status(httpStatus.BAD_REQUEST).json({ message: "Only delivered orders can be returned." });
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

    res.status(httpStatus.OK).json({ message: "Order returned successfully", order });
  } catch (error) {
    console.error("Error processing return:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to process the return." });
  }
};

/**
 * User: Create a Razor Pay Order
 * @param {*} req
 * @param {*} res
 * @returns
 */
const createRazorpayOrder = async (req, res) => {
  const { orderId } = req.body;
  const cart = await cartService.getCart(req.user.id);
  const cartItems = await cartService.calculateLivePrice(cart);
  const shippingCost = 40;

  if (!cartItems || cartItems.length === 0) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: "No items in the order" });
  }

  const { cartPriceTotal, total } = cartService.calculateTotal(cartItems);
  const discountAmount = cartService.getCouponAmount(cartItems);
  const totalAmount = cartPriceTotal + shippingCost - discountAmount;

  try {
    let order;
    if (orderId) {
      order = await Order.findById(orderId);
      if (!order || order.paymentStatus !== 'Failed') {
        return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid or already paid order.' });
      }
    }

    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `order_rcptid_${new Date().getTime()}`,
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);
    res.status(httpStatus.CREATED).json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    logger.error(error.message);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

/**
 * User: Verify Razorpay Payment
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, addressId, orderId } = req.body;
  const shippingCharge = 40;
  const userId = req.user.id;
  const cart = await cartService.getCart(userId);


  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'Payment verification failed' });
  }

  try {
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: Messages.ORDER_NOT_FOUND });
      }

      order.paymentStatus = 'Paid';
      await order.save();

      return res.status(httpStatus.OK).json({ success: true, order });
    }

    const cartItems = await cartService.calculateLivePrice(cart);
    const { cartPriceTotal, total } = cartService.calculateTotal(cartItems);
    const discountAmount = cartService.getCouponAmount(cartItems);
    const totalAmount = cartPriceTotal + shippingCharge - discountAmount;

    if (!cartItems || cartItems.length === 0) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'No items in the order' });
    }

    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid delivery address' });
    }

    for (let item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(httpStatus.BAD_REQUEST).json({
          message: `Product ${item.productId} is out of stock or unavailable`,
        });
      }
    }

    for (let item of cartItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }


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
    res.status(httpStatus.OK).json({ success: true, order: newOrder });
  } catch (error) {
    logger.error(error.message);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to place order' });
  }
};

/**
 * User: Create a Failed Order
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const createFailedOrder = async (req, res) => {
  const { razorpayOrderId, addressId  } = req.body;
  const userId = req.user.id;
  const shippingCharge = 40;

  try {
    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid delivery address' });
    }
    const cart = await cartService.getCart(userId);
    const cartItems = await cartService.calculateLivePrice(cart);
    const { cartPriceTotal, total } = cartService.calculateTotal(cartItems);
    const discountAmount = cartService.getCouponAmount(cartItems);
    const totalAmount = cartPriceTotal + shippingCharge - discountAmount;

    for (let item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(httpStatus.BAD_REQUEST).json({
          message: `Product ${item.productId} is out of stock or unavailable`,
        });
      }
    }

    for (let item of cartItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }


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

    res.status(httpStatus.CREATED).json({ success: true, order: newOrder });
  } catch (error) {
    console.error("Failed to create failed order:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to log failed payment.' });
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