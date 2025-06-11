const Order = require("../../models/Order");
const Product = require("../../models/Product");
const Transaction = require('../../models/Transaction');
const logger = require("../../utils/logger");
const HttpStatus = require("../../constants/httpStatus");
const Messages = require("../../constants/messages");


/**
 * View all orders with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
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

    res.status(HttpStatus.OK).json({
      orders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders,
    });
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

/**
 * Update the status of an order
 * @param {*} req express object
 * @param {*} res express object
 * @returns 
 */
const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(orderId)
      .populate("user", "name email")
      .populate("items.productId", "productName");

    if (!order) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: Messages.ORDER_NOT_FOUND });
    }

    if (
      status === "Cancelled" &&
      (order.status === "Shipped" || order.status === "Delivered")
    ) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: Messages.CANNOT_CANCEL_SHIPPED_DELIVERED,
      });
    }

    order.status = status;

    if (status === "Cancelled") {
      for (let item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }
    }

    await order.save();

    if (order.status === 'Cancelled' && order.paymentStatus === 'Refunded') {
      await Transaction.create({
        userId: order.user,
        type: "credit",
        amount: order.totalAmount,
        description: `Refund for returned order ${order.orderReference}`,
        date: new Date(),
      });
    }

    res.status(HttpStatus.OK).json({ message: Messages.ORDER_STATUS_UPDATED, order });
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.SERVER_ERROR });
  }
};

module.exports = {
  viewAllOrders,
  updateOrderStatus,
};