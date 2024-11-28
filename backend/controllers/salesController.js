const Order = require('../models/Order');
const moment = require('moment');
const { jsPDF } = require('jspdf');
require('jspdf-autotable');
const XLSX = require('xlsx'); // For Excel generation

// Middleware to validate input
const validateInput = (req, res, next) => {
  const { startDate, endDate, period } = req.body;

  if (period && !['daily', 'weekly', 'monthly'].includes(period)) {
    return res.status(400).json({ message: 'Invalid period specified. Choose from daily, weekly, or monthly.' });
  }

  if ((startDate || endDate) && !(startDate && endDate)) {
    return res.status(400).json({ message: 'Both startDate and endDate must be provided.' });
  }

  next();
};

// Helper function to build match criteria
const buildMatchCriteria = (startDate, endDate, period) => {
  const matchCriteria = { status: 'Delivered' };

  if (period) {
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
  } else if (startDate && endDate) {
    matchCriteria.placedAt = {
      $gte: moment(startDate).startOf('day').toDate(),
      $lt: moment(endDate).endOf('day').toDate(),
    };
  }

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
      $project: {
        orderId: '$_id', // Include the order _id
        product: '$productDetails.productName',
        quantity: '$items.quantity',
        totalAmount: '$totalAmount',
        discountAmount: '$discountAmount',
        placedAt: '$placedAt', // Include placedAt field
      },
    },
    {
      $group: {
        _id: '$items.productId',
        product: { $first: '$product' },
        quantity: { $sum: '$quantity' },
        totalAmount: { $sum: '$totalAmount' },
        discountAmount: { $sum: '$discountAmount' },
        placedAt: { $push: '$placedAt' },
        orders: { $push: '$orderId' }, // Collect all order _id for each product
      },
    },
  ]);
};



// Controller to generate the sales report
const generateSalesReport = async (req, res) => {
  const { startDate, endDate, period } = req.body;

  try {
    const matchCriteria = buildMatchCriteria(startDate, endDate, period);
    const salesReport = await getSalesData(matchCriteria);

    if (!salesReport.length) {
      return res.status(200).json({ message: 'No sales data found for this period.' });
    }

    // Calculate totals
    const totalProductsSold = salesReport.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = salesReport.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalDiscount = salesReport.reduce((sum, item) => sum + item.discountAmount, 0);

    res.status(200).json({
      totalProductsSold,
      totalAmount: totalAmount.toFixed(2),
      totalDiscount: totalDiscount.toFixed(2),
      salesReport,
    });
  } catch (error) {
    console.error('Error generating sales report:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller to generate and download sales report as PDF
const generatePDF = async (req, res) => {
  const { startDate, endDate, period } = req.body;

  try {
    const matchCriteria = buildMatchCriteria(startDate, endDate, period);
    const salesData = await getSalesData(matchCriteria);

    if (!salesData.length) {
      return res.status(200).json({ message: 'No sales data found for this period.' });
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Sales Report', 14, 20);

    const tableColumns = ['Product Name', 'Quantity', 'Amount', 'Discount'];
    const tableRows = salesData.map((data) => [
      data.product,
      data.quantity,
      data.totalAmount.toFixed(2),
      data.discountAmount.toFixed(2),
    ]);

    doc.autoTable(tableColumns, tableRows, { startY: 30 });
    res.header('Content-Type', 'application/pdf');
    res.attachment('sales_report.pdf');
    res.send(doc.output('arraybuffer'));
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller to generate and download sales report as Excel
const generateExcel = async (req, res) => {
  const { startDate, endDate, period } = req.body;

  try {
    const matchCriteria = buildMatchCriteria(startDate, endDate, period);
    const salesData = await getSalesData(matchCriteria);

    if (!salesData.length) {
      return res.status(200).json({ message: 'No sales data found for this period.' });
    }

    const excelData = salesData.map((data) => ({
      'Product Name': data.product,
      Quantity: data.quantity,
      Amount: data.totalAmount.toFixed(2),
      Discount: data.discountAmount.toFixed(2),
    }));

    // Add summary row
    excelData.push({
      'Product Name': 'Total',
      Quantity: salesData.reduce((sum, item) => sum + item.quantity, 0),
      Amount: salesData.reduce((sum, item) => sum + item.totalAmount, 0).toFixed(2),
      Discount: salesData.reduce((sum, item) => sum + item.discountAmount, 0).toFixed(2),
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');
    res.send(excelBuffer);
  } catch (error) {
    console.error('Error generating Excel:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  validateInput,
  generateSalesReport,
  generatePDF,
  generateExcel,
};
