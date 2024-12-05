const Transaction = require('../models/Transaction')


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


module.exports = { getWalletBalance }