const Order = require('../models/Order');
const moment = require('moment');
const { jsPDF } = require('jspdf');
require('jspdf-autotable');
const XLSX = require('xlsx'); 

// Middleware to validate input
const validateInput = (req, res, next) => {
  const { startDate, endDate, period } = req.body;

  if (period && !['daily', 'weekly', 'monthly','custom'].includes(period)) {
    return res.status(400).json({ message: 'Invalid period specified. Choose from daily, weekly, or monthly.' });
  }

  if ((startDate || endDate) && !(startDate && endDate)) {
    return res.status(400).json({ message: 'Both startDate and endDate must be provided.' });
  }

  next();
};

// Helper function to build match criteria
const buildMatchCriteria = (startDate, endDate, period) => {
  const matchCriteria = { status: { $nin: ['Returned', 'Cancelled'] } };

  // Handle custom date range first
  if (period === 'custom' && startDate && endDate) {
    const start = moment.utc(startDate).startOf('day'); // Start of custom day
    const end = moment.utc(endDate).endOf('day'); // End of custom day

    matchCriteria.placedAt = {
      $gte: start.toDate(),
      $lt: end.toDate(),
    };
  }
  // Handle predefined periods
  else if (period) {
    const periods = {
      daily: { start: moment().startOf('day'), end: moment().endOf('day') },
      weekly: { start: moment().startOf('week'), end: moment().endOf('week') },
      monthly: { start: moment().startOf('month'), end: moment().endOf('month') },
    };

    if (periods[period]) {
      matchCriteria.placedAt = {
        $gte: periods[period].start.toDate(),
        $lt: periods[period].end.toDate(),
      };
    }
  }

  // Return criteria
  return matchCriteria;
};



// Helper function to get aggregated sales data
const getSalesData = async (matchCriteria) => {
  return Order.aggregate([
    { $match: matchCriteria },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.productId',
        foreignField: '_id',
        as: 'productDetails',
      },
    },
    { $unwind: '$productDetails' },
    {
      $group: {
        _id: '$items.productId',
        product: { $first: '$productDetails.productName' },
        quantity: { $sum: '$items.quantity' },
        totalAmount: { $sum: '$totalAmount' },
        discountAmount: { $sum: '$discountAmount' },
      },
    },
    {
      $project: {
        product: 1,
        quantity: 1,
        totalAmount: { $round: ['$totalAmount', 2] },
        discountAmount: { $round: ['$discountAmount', 2] },
      },
    },
  ]);
};




// Admin: Sales Report 
const generateSalesReport = async (req, res) => {
  const { startDate, endDate, period } = req.body;


  try {
    // Get the match criteria
    const matchCriteria = buildMatchCriteria(startDate, endDate, period);
   
    // Fetch aggregated sales data
    const salesReport = await getSalesData(matchCriteria);
   
   
    // Fetch all orders within the specified period
    const allOrders = await Order.find(matchCriteria)
      .populate('items.productId', 'productName') 
      .lean(); 
   
    if (!salesReport.length && !allOrders.length) {
      return res.status(200).json({ message: 'No sales data found for this period.' });
    }

    // Calculate totals for delivered orders
    const totalProductsSold = salesReport.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = salesReport.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalDiscount = salesReport.reduce((sum, item) => sum + item.discountAmount, 0);

    

    res.status(200).json({
      salesSummary: {
        totalProductsSold,
        totalAmount: totalAmount.toFixed(2),
        totalDiscount: totalDiscount.toFixed(2),
      },
      allOrders, 
    });
  } catch (error) {
    console.error('Error generating sales report:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



module.exports = {
  validateInput,
  generateSalesReport
};
