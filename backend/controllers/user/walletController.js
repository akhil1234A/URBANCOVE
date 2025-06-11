const Transaction = require('../../models/Transaction')
const razorpay = require('../../utils/Razorpay')
const crypto = require('crypto');


// User: Get wallet balance
const getWalletBalance = async (req, res) => {
  try {
    const { page = 1 } = req.query; 
    const limit = 5;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ userId: req.user.id })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const totalTransactions = await Transaction.countDocuments({ userId: req.user.id });

    let balance = 0;
    const allTransactions = await Transaction.find({ userId: req.user.id });
    allTransactions.forEach((transaction) => {
      if (transaction.type === 'credit') {
        balance += transaction.amount;
      } else if (transaction.type === 'debit') {
        balance -= transaction.amount;
      }
    });

    res.status(200).json({
      transactions,
      balance,
      currentPage: Number(page),
      totalPages: Math.ceil(totalTransactions / limit),
    });
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    res.status(500).json({ message: 'Failed to retrieve wallet balance' });
  }
};

// 1. Initiate Payment
const initiateAddMoney = async (req, res) => {
  try {
    const { amount } = req.body; // Amount in INR (e.g., 500)

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const options = {
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

// 2. Verify Payment
const verifyAddMoney = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, amount } = req.body;

    // Validate signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Add transaction to the wallet
    const transaction = new Transaction({
      userId: req.user.id,
      amount,
      type: 'credit',
      description: 'Wallet recharge',
    });

    await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Payment successful and wallet updated',
      transaction,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Failed to verify payment' });
  }
};

module.exports = { getWalletBalance, initiateAddMoney, verifyAddMoney  }