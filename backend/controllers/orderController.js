const Order = require('../models/Order');
const Product = require('../models/Product');
const Address = require('../models/Address');

// Controller for Users to place an order
const placeOrder = async (req, res) => {
  const { addressId, paymentMethod, cartItems } = req.body;
  const userId = req.user.id; 

  

  try {
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'No items in the order' });
    }

    // Fetch the delivery address using addressId
    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(400).json({ message: 'Invalid delivery address' });
    }

    // Check stock availability for each item
    for (let item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ message: `Product ${item.productId} is out of stock or unavailable` });
      }
    }

    // Deduct stock for each product
    for (let item of cartItems) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    // Create a new order with the full address
    const newOrder = await Order.create({
      user: userId,
      items: cartItems,
      paymentMethod,
      deliveryAddress: address, // Save the full address object in the order
      totalAmount,
      status: 'Pending',
    });
    
    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: error.message });
  }
};


// Controller for Users to view all their orders
const viewUserOrders = async (req, res) => {
  const userId = req.user.id;  
  console.log(userId);
  try {
    // Find all orders placed by the user
    const orders = await Order.find({ user: userId }).populate('items.productId', 'productName price'); 

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }

    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Controller for Users to cancel an order
const cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id; 

  try {
    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'Pending') {
      return res.status(400).json({ message: 'Order cannot be canceled, it is already processed' });
    }

    order.status = 'Cancelled';
    await order.save();

    // Restore stock for canceled items
    for (let item of order.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
    }

    res.status(200).json({ message: 'Order canceled successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller for Admin to view all orders
const viewAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').populate('items.productId','productName'); 
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller for Admin to update order status (including cancellation)
const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body; // New status (e.g., Shipped, Delivered, Cancelled)

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (status === 'Cancelled' && (order.status === 'Shipped' || order.status === 'Delivered')) {
      return res.status(400).json({ message: 'Cannot cancel an order that is already shipped or delivered' });
    }

    // Update order status
    order.status = status;

    // If canceled, restore stock
    if (status === 'Cancelled') {
      for (let item of order.items) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
      }
    }

    await order.save();
    res.status(200).json({ message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  placeOrder,
  cancelOrder,
  viewAllOrders,
  updateOrderStatus,
  viewUserOrders
};
