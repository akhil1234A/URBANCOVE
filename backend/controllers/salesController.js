const Order = require('../models/Order');
const moment = require('moment');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/SubCategory');


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


//Admin: Dashboard Counters
const counters = async (req,res)=>{
  const users = await User.find({isActive:true}).countDocuments();
  const orders = await Order.find().countDocuments();
  const products = await Product.find({isActive:true}).countDocuments();
  const categories = await Category.find({isActive:true}).countDocuments();

  res.json({
    activeUsers: users,
    totalOrders: orders,
    activeProducts: products,
    activeCategories:categories
})
}


//Admin: Dashboard Chart
const getOrdersChart = async (req, res) => {
  try {
    const { period } = req.query; // Extract 'period' from query parameters

    const matchCriteria = {
      status: { $nin: ['Returned', 'Cancelled'] },
    };

    const dateRanges = {
      yearly: { start: moment().startOf('year'), end: moment().endOf('year') },
      monthly: { start: moment().startOf('month'), end: moment().endOf('month') },
      weekly: { start: moment().startOf('week'), end: moment().endOf('week') },
    };

    if (dateRanges[period]) {
      matchCriteria.placedAt = {
        $gte: dateRanges[period].start.toDate(),
        $lt: dateRanges[period].end.toDate(),
      };
    }

    // Select format based on period
    let groupId;
    if (period === 'yearly') {
      groupId = { $dateToString: { format: '%Y-%m', date: '$placedAt' } }; // Month and year
    } else if (period === 'monthly') {
      groupId = { $dateToString: { format: '%Y-%m-%d', date: '$placedAt' } }; // Day, month, year
    } else if (period === 'weekly') {
      // Group by year and ISO week number
      groupId = {
        year: { $year: '$placedAt' },
        isoWeek: { $isoWeek: '$placedAt' },
      };
    }

    const ordersChartData = await Order.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: groupId,
          totalSales: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.isoWeek': 1 } }, // Ensure proper sorting for weekly data
    ]);

    // Transform weekly data for consistency
    const transformedData = ordersChartData.map((item) => {
      if (period === 'weekly') {
        return {
          name: `Week ${item._id.isoWeek}, ${item._id.year}`,
          value: item.totalSales,
        };
      } else {
        return {
          name: item._id,
          value: item.totalSales,
        };
      }
    });

    res.status(200).json({
      success: true,
      data: transformedData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders chart data',
      error: error.message,
    });
  }
};


//Admin: Top Selling Products
const getTopSellingProducts = async (req, res) => {
  try {
    const topSellingProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalQuantity: { $sum: '$items.quantity' },
          totalSales: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      {
        $project: {
          productName: { $arrayElemAt: ['$productDetails.productName', 0] },
          totalQuantity: 1,
          totalSales: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: topSellingProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top-selling products',
      error: error.message,
    });
  }
};

//Admin: Top Selling Categories 
const getTopSellingCategories = async (req, res) => {
  try {
    const topSellingCategories = await Order.aggregate([
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
        $lookup: {
          from: 'subcategories',
          localField: 'productDetails.subCategory', // Link product's subCategory field
          foreignField: '_id',
          as: 'subCategoryDetails',
        },
      },
      { $unwind: '$subCategoryDetails' },
      {
        $lookup: {
          from: 'categories',
          localField: 'subCategoryDetails.category', // Link subcategory's category field
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      { $unwind: '$categoryDetails' },
      {
        $group: {
          _id: '$subCategoryDetails._id',
          subCategoryName: { $first: '$subCategoryDetails.subCategory' },
          categoryName: { $first: '$categoryDetails.category' },
          totalQuantity: { $sum: '$items.quantity' },
          totalSales: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        },
      },
      { $sort: { totalQuantity: -1 } }, // Sort by total quantity sold
      { $limit: 10 }, // Limit to top 10 categories
      {
        $project: {
          combinedName: {
            $concat: ['$subCategoryName', ' - ', '$categoryName'], // Format: "subcategory - category"
          },
          totalQuantity: 1,
          totalSales: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: topSellingCategories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top-selling categories',
      error: error.message,
    });
  }
};




module.exports = {
  validateInput,
  generateSalesReport,
  counters,
  getOrdersChart,
  getTopSellingProducts,
  getTopSellingCategories
};
