import { useEffect, useState } from 'react';
import axios from 'axios';
import './wallet.css';

const Wallet = () => {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWalletDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch balance and transactions from the same API endpoint
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/user/wallet/balance`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        // Destructure balance and transactions from the response
        const { balance, transactions } = response.data;
        
        setBalance(balance);
        setTransactions(transactions || []);
      } catch (error) {
        setError('Failed to fetch wallet details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchWalletDetails();
  }, []);

  const renderBalance = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center">
          <div className="spinner-border animate-spin rounded-full border-4 border-blue-400 border-t-transparent w-8 h-8" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return <p className="text-red-500">{error}</p>;
    }

    if (balance === null) {
      return <p className="text-gray-500">No transactions yet. Your balance will appear here.</p>;
    }

    return <h1 className="text-xl font-semibold text-green-600">₹{balance.toFixed(2)}</h1>;
  };

  const renderTransactions = () => {
    if (loading) {
      return <p>Loading transactions...</p>;
    }

    if (transactions.length === 0) {
      return <p className="text-gray-500">No transactions found.</p>;
    }

    return (
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction._id} className="p-4 border border-gray-300 rounded-lg shadow-sm bg-white">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700">{transaction.type === 'credit' ? 'Refund' : 'Debit'}</span>
              <span className={`font-bold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                ₹{transaction.amount.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-gray-500">{transaction.description}</p>
            <p className="text-xs text-gray-400">{new Date(transaction.date).toLocaleString()}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Wallet</h2>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800">Balance</h3>
        <div className="mt-2">{renderBalance()}</div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800">Transaction History</h3>
        <div className="mt-4">{renderTransactions()}</div>
      </div>
    </div>
  );
};

export default Wallet;
