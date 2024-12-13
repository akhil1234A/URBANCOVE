import { useEffect, useState } from 'react';
import { userAxios } from '../../utils/api';
import './wallet.css';
import { toast } from "react-toastify"

const Wallet = () => {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addAmount, setAddAmount] = useState(0);

  const fetchWalletDetails = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await userAxios.get(`/user/wallet/balance?page=${page}`);

      const { balance, transactions, currentPage, totalPages } = response.data;
      setBalance(balance);
      setTransactions(transactions || []);
      setCurrentPage(currentPage);
      setTotalPages(totalPages);
    } catch (error) {
      setError('Failed to fetch wallet details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletDetails(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };


  const showToast = (type, message) => {
    const toastId = `${type}-${message}`;
    if (!toast.isActive(toastId)) {
      toast[type](message, { toastId });
    }
  };

  const handleAddMoney = async () => {
    if (!addAmount || isNaN(addAmount) || addAmount <= 0) {
      showToast('info', 'Please enter a valid amount.');      
      return;
    }

    try {
      const { data } = await userAxios.post('/user/wallet/initiate', { amount: addAmount });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
        amount: data.amount,
        currency: 'INR',
        name: 'URBANCOVE',
        description: 'Add Money to Wallet',
        order_id: data.orderId,
        handler: async (response) => {
          setIsModalOpen(false);
          try {
            const verifyData = {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              amount: addAmount,
            };

            const [result] = await Promise.all([
              userAxios.post('/user/wallet/verify', verifyData),
              fetchWalletDetails(currentPage),
            ]);
  
            if (result.data.success) {
              showToast('success', 'Wallet updated successfully!');
            }

          } catch (verifyError) {
          showToast('error', 'Payment verification failed. Please contact support.');

          }
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: () => {
            setIsModalOpen(false); 
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      showToast('error', 'Failed to initiate payment. Please try again.');
    } finally {
      setIsModalOpen(false); 
    }
  };

  const renderModal = () => (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-xl font-semibold mb-4">Add Money to Wallet</h2>
        <input
          type="number"
          placeholder="Enter amount"
          value={addAmount}
          onChange={(e) => setAddAmount(e.target.value)}
          className="border rounded px-3 py-2 w-full mb-4"
        />
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleAddMoney}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );

  const renderPagination = () => (
    <div className="flex justify-center space-x-4 mt-6">
      <button
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
      >
        Previous
      </button>
      <span className="px-4 py-2 text-gray-700">{`Page ${currentPage} of ${totalPages}`}</span>
      <button
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );

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
              <span className="font-medium text-gray-700">{transaction.type === 'credit' ? 'Credit' : 'Debit'}</span>
              <span className={`font-bold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                ₹{transaction.amount.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-gray-500">{transaction.description}</p>
            <p className="text-xs text-gray-400">{new Date(transaction.date).toLocaleString()}</p>
          </div>
        ))}
        {renderPagination()}
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

     <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add Money
      </button>
     
      {isModalOpen && renderModal()}

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800">Transaction History</h3>
        <div className="mt-4">{renderTransactions()}</div>
      </div>
    </div>
  );
};

export default Wallet;
