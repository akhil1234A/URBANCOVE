const Order = require("../models/Order");
const Product = require("../models/Product");
const Address = require("../models/Address");
const Cart = require("../models/Cart");
const Transaction = require('../models/Transaction')
const razorpayInstance = require("../utils/Razorpay");
const crypto = require('crypto');


// User: Place an Order
const placeOrder = async (req, res) => {
  const { addressId, paymentMethod, cartItems, totalAmount } = req.body;
  const userId = req.user.id;
  // console.log("req body", req.body);
  const shippingCost = 40;

  try {

    if(paymentMethod === 'cod' && totalAmount > 1000){
      return res.status(400).json({message: "Order above Rs 1000 should not be allowed for COD"});
    }

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "No items in the order" });
    }

    // fetching address
    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(400).json({ message: "Invalid delivery address" });
    }

    // stock availability
    for (let item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          message: `Product ${item.productId} is out of stock or unavailable`,
        });
      }
    }
  
    // stock deduction
    for (let item of cartItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    // amount calculation
    const originalPrice = cartItems.reduce(
      (total, item) => total + item.originalPrice * item.quantity,
      0
    );

    const discountAmount = originalPrice - totalAmount + shippingCost;


    if (paymentMethod == 'cod') {
      const newOrder = await Order.create({
        user: userId,
        items: cartItems,
        paymentMethod,
        paymentStatus: "Pending",
        deliveryAddress: address,
        totalAmount,
        discountAmount,
        status: 'Pending',
      });

     
      await Cart.deleteMany({ userId });

      res.status(201).json({ message: 'Order placed successfully', order: newOrder });
    } else {
      
      res.status(400).json({ message: "Razorpay payment should be handled separately." });
    }
  } catch (error) {
    console.log(error);
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// User: View All Orders
const viewUserOrders = async (req, res) => {
  const userId = req.user.id;
  // console.log(userId);
  try {
    
    const orders = await Order.find({ user: userId }).populate(
      "items.productId",
      "productName price"
    ).populate("user","name email").sort({placedAt: -1});

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User: Cancel An Order
const cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  try {
    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Pending") {
      return res
        .status(400)
        .json({ message: "Order cannot be canceled, it is already processed" });
    }

    order.status = "Cancelled";
    const refund = order.totalAmount;
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
        amount: refund,
        description: `Refund for canceled order ${orderId}`,
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

    // Process refund if payment method is not COD
    if (order.paymentMethod !== "cod" && order.paymentStatus !=='Failed') {
      await Transaction.create({
        userId,
        type: "credit",
        amount: order.totalAmount,
        description: `Refund for returned order ${orderId}`,
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
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, cartItems, addressId, totalAmount, orderId } = req.body;
  const shippingCharge = 40;
  // console.log(req.body);
  // console.log(razorpayOrderId, razorpayPaymentId, razorpaySignature);
 
  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  
    // console.log('Signature verified successfully');
    
    try {

      if (orderId) {
        // Update an existing order
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
  
      // Stock availability check: ensure all products are available in the required quantity
      for (let item of cartItems) {
        const product = await Product.findById(item.productId);
        if (!product || product.stock < item.quantity) {
          return res.status(400).json({
            message: `Product ${item.productId} is out of stock or unavailable`,
          });
        }
      }
  
      // Stock deduction: update the stock for each product in the cart
      for (let item of cartItems) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }
  
      // Calculate the total amount
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
        paymentStatus: 'Paid'
      });
      const userId = req.user.id;
      await Cart.deleteMany({ userId});
      res.status(200).json({ success: true, order: newOrder });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: 'Failed to place order' });
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
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.productId", "productName").sort({placedAt: -1});
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update Order Status
const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body; 

  try {
    const order = await Order.findById(orderId);

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

    if (["Cancelled", "Returned"].includes(status)) {
      if (order.paymentMethod !== "cod" && order.paymentStatus !=='Failed') {
        await Transaction.create({
          userId: order.user,
          type: "credit",
          amount: order.totalAmount,
          description: `Refund for returned order ${orderId}`,
          date: new Date(),
        });
      }      
    }


    await order.save();
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
