const Transaction = require('../models/Transaction')


// User: Get wallet balance
const getWalletBalance = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });

    // Calculate balance
    let balance = 0;
    transactions.forEach(transaction => {
      if (transaction.type === 'credit') {
        balance += transaction.amount;
      } else if (transaction.type === 'debit') {
        balance -= transaction.amount;
      }
    });

    res.status(200).json({ transactions, balance });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve wallet balance' });
  }
};

module.exports = { getWalletBalance }