const Order = require("../models/Order");
const Product = require("../models/Product");
const Address = require("../models/Address");
const Cart = require("../models/Cart");
const Transaction = require('../models/Transaction')
const razorpayInstance = require("../utils/Razorpay");
const crypto = require('crypto');
const mongoose = require('mongoose');


// User: Place an Order
const placeOrder = async (req, res) => {
  const { addressId, paymentMethod, cartItems, totalAmount } = req.body;
  const userId = req.user.id;
  const shippingCost = 40;

  // Start a MongoDB session for handling transactions
  const session = await mongoose.startSession();

  try {
    // Start transaction
    session.startTransaction();

    if (paymentMethod === "cod" && totalAmount > 1000) {
      throw new Error("Order above Rs 1000 should not be allowed for COD");
    }

    if (!cartItems || cartItems.length === 0) {
      throw new Error("No items in the order");
    }

    // Fetch delivery address
    const address = await Address.findById(addressId).session(session);
    if (!address) {
      throw new Error("Invalid delivery address");
    }

    // Check stock availability for all products
    for (let item of cartItems) {
      const product = await Product.findById(item.productId).session(session);
      if (!product || product.stock < item.quantity) {
        throw new Error(`Product ${item.productId} is out of stock or unavailable`);
      }
    }

    // Deduct stock for all items
    for (let item of cartItems) {
      const result = await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { session, new: true }
      );

      if (result.stock < 0) {
        throw new Error(`Stock for product ${item.productId} ran out during processing`);
      }
    }

    // Calculate discount amount
    const originalPrice = cartItems.reduce(
      (total, item) => total + item.originalPrice * item.quantity,
      0
    );
    const discountAmount = originalPrice - totalAmount + shippingCost;

    // Handle wallet payment if applicable
    if (paymentMethod === "wallet") {
      const walletBalance = await Wallet.findOne({ userId }).session(session);
      if (!walletBalance || walletBalance.balance < totalAmount) {
        throw new Error("Insufficient wallet balance");
      }

      // Deduct from wallet
      walletBalance.balance -= totalAmount;
      await walletBalance.save({ session });

      // Record transaction
      await Transaction.create(
        [
          {
            userId,
            amount: totalAmount,
            type: "debit",
            description: "Order payment using wallet",
          },
        ],
        { session }
      );
    }

    // Create new order
    const newOrder = await Order.create(
      [
        {
          user: userId,
          items: cartItems,
          paymentMethod,
          paymentStatus: paymentMethod === "wallet" ? "Paid" : "Pending",
          deliveryAddress: address,
          totalAmount,
          discountAmount,
          status: "Pending",
        },
      ],
      { session }
    );

    // Clear user's cart
    await Cart.deleteMany({ userId }, { session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    // Roll back the transaction in case of any failure
    await session.abortTransaction();
    session.endSession();

    console.error("Error placing order:", error);
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
        .populate("items.productId", "productName price")
        .populate("user", "name email")
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
  const userId = req.user.id;

  try {
    const order = await Order.findOne({ _id: orderId, user: userId }).populate("items.productId", "productName price").populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Pending") {
      return res
        .status(400)
        .json({ message: "Order cannot be canceled, it is already processed" });
    }

    order.status = "Cancelled";
    await order.save();

   

    // Restore stock for canceled items
    for (let item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }



    if(order.paymentMethod != 'cod' && order.paymentStatus !='Failed'){
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

//User: Return an Order
const returnOrder = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  try {
    // Fetch the order
    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the order is eligible for return
    if (order.status !== "Delivered") {
      return res.status(400).json({ message: "Only delivered orders can be returned." });
    }

    // Update the order status to "Returned"
    order.status = "Returned";
    await order.save();

    // Restore stock for all items in the order
    for (let item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    console.log('paymentStatus',order.paymentStatus)

    // Process refund if payment method is not COD
    if (order.paymentStatus ==='Refunded') {
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


// User: Create a Razor Pay Order, Step 1 in User Flow 
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

    
    // Create Razorpay order
    const options = {
      amount: totalAmount * 100,  // Razorpay expects the amount in paise (1 INR = 100 paise)
      currency: "INR",
      receipt: `order_rcptid_${new Date().getTime()}`,
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);
    // console.log(razorpayOrder);
    res.status(201).json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

//User: Razory Pay Verification Step 2 in User Flow Front End 
const verifyPayment = async (req, res) => {
  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    cartItems,
    addressId,
    totalAmount,
    orderId,
  } = req.body;
  const shippingCharge = 40;

  // Verify Razorpay signature
  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (!safeCompare(expectedSignature, razorpaySignature)) {
    return res.status(400).json({ success: false, message: "Payment verification failed" });
  }

  try {
    // Start a session for concurrency handling
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Handle existing order
      if (orderId) {
        const order = await Order.findOneAndUpdate(
          { _id: orderId, paymentStatus: "Failed" },
          { paymentStatus: "Paid" },
          { new: true, session }
        );
        if (!order) {
          throw new Error("Order not found or already paid.");
        }

        await session.commitTransaction();
        session.endSession();
        return res.status(200).json({ success: true, order });
      }

      // Validate cart items
      if (!cartItems || cartItems.length === 0) {
        throw new Error("No items in the order.");
      }

      // Validate address
      const address = await Address.findById(addressId).session(session);
      if (!address) {
        throw new Error("Invalid delivery address.");
      }

      // Check and deduct stock atomically
      for (let item of cartItems) {
        const product = await Product.findOneAndUpdate(
          { _id: item.productId, stock: { $gte: item.quantity } }, // Ensure sufficient stock
          { $inc: { stock: -item.quantity } }, // Deduct stock
          { new: true, session }
        );
        if (!product) {
          throw new Error(`Product ${item.productId} is out of stock or unavailable.`);
        }
      }

      // Calculate amounts
      const originalPrice = cartItems.reduce(
        (total, item) => total + item.originalPrice * item.quantity,
        0
      );
      const discountAmount = originalPrice + shippingCharge - totalAmount;

      // Create new order
      const newOrder = await Order.create(
        [
          {
            user: req.user.id,
            items: cartItems,
            paymentMethod: "razorpay",
            deliveryAddress: address,
            totalAmount,
            discountAmount,
            status: "Pending",
            paymentStatus: "Paid",
          },
        ],
        { session }
      );

      // Clear user cart
      await Cart.deleteMany({ user: req.user.id }).session(session);

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({ success: true, order: newOrder[0] });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//User: Failed Orders in RazorPay
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

    await Cart.deleteMany({userId});



    res.status(201).json({ success: true, order: newOrder });
  } catch (error) {
    console.error("Failed to create failed order:", error);
    res.status(500).json({ success: false, message: 'Failed to log failed payment.' });
  }
};



// -  - - - - - - - - - - - - - -  - - - - - - - - - - - - - -  - - - - - - - - - - - - - -  - - - - - - - - - - - - - -  - - - - - - 
// Admin: View All Orders
const viewAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10; 
    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments();
    const orders = await Order.find()
      .skip(skip)
      .limit(limit)
      .populate("user", "name email")
      .populate("items.productId", "productName")
      .sort({ placedAt: -1 });

    res.status(200).json({
      orders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Admin: Update Order Status
const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body; 

  try {
    const order = await Order.findById(orderId).populate("user", "name email").populate("items.productId", "productName");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (
      status === "Cancelled" &&
      (order.status === "Shipped" || order.status === "Delivered")
    ) {
      return res.status(400).json({
        message: "Cannot cancel an order that is already shipped or delivered",
      });
    }

    
    order.status = status;

    // If canceled, restore stock
    if (status === "Cancelled") {
      for (let item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }
    }

    await order.save();

   
      if (order.status === 'Cancelled' && order.paymentStatus ==='Refunded') {
        await Transaction.create({
          userId: order.user,
          type: "credit",
          amount: order.totalAmount,
          description: `Refund for returned order ${order.orderReference}`,
          date: new Date(),
        });
      }      
    

    res
      .status(200)
      .json({ message: "Order status updated successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  placeOrder,
  cancelOrder,
  viewAllOrders,
  updateOrderStatus,
  viewUserOrders,
  verifyPayment,
  createRazorpayOrder,
  createFailedOrder,
  returnOrder
};
