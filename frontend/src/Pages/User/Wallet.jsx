import { useEffect, useState } from 'react';
import { userAxios } from '../../utils/api';
import { toast } from 'react-toastify';

const Wallet = () => {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addAmount, setAddAmount] = useState('');

  const fetchWalletDetails = async (page = 1, fetchBalance = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await userAxios.get(
        `/user/wallet/balance?page=${page}`
      );

      const { balance, transactions, currentPage, totalPages } = response.data;

      if (fetchBalance) setBalance(balance);

      setTransactions(transactions || []);
      setCurrentPage(currentPage);
      setTotalPages(totalPages);
    } catch {
      setError('Failed to fetch wallet details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletDetails(1, true);
  }, []);

  useEffect(() => {
    fetchWalletDetails(currentPage, false);
  }, [currentPage]);

  const handleAddMoney = async () => {
    if (!addAmount || isNaN(addAmount) || addAmount <= 0) {
      toast.info('Please enter a valid amount');
      return;
    }

    try {
      const { data } = await userAxios.post('/user/wallet/initiate', {
        amount: addAmount,
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: 'INR',
        name: 'URBANCOVE',
        description: 'Add Money to Wallet',
        order_id: data.orderId,
        handler: async (response) => {
          try {
            await userAxios.post('/user/wallet/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              amount: addAmount,
            });

            toast.success('Wallet updated successfully!');
            fetchWalletDetails(currentPage, true);
          } catch {
            toast.error('Payment verification failed');
          }
        },
        theme: { color: '#7B1E1E' },
      };

      new window.Razorpay(options).open();
      setIsModalOpen(false);
    } catch {
      toast.error('Failed to initiate payment');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Heading (same style as Cart / Wishlist) */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Wallet</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your wallet balance and transactions
        </p>
      </div>

      {/* Balance Card */}
      <div className="mb-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-gray-500">Current Balance</p>

          {loading && balance === null ? (
            <p className="mt-4 text-gray-400">Loading...</p>
          ) : error ? (
            <p className="mt-4 text-red-600">{error}</p>
          ) : (
            <p className="mt-4 text-4xl font-semibold text-gray-900">
              ₹{balance?.toFixed(2) || '0.00'}
            </p>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 inline-flex items-center rounded-lg bg-[#7B1E1E] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#651818] transition"
          >
            Add Money
          </button>
        </div>
      </div>

      {/* Transactions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Transaction History
        </h2>

        {transactions.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-500">
            No transactions found.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {transactions.map((tx) => (
              <div
                key={tx._id}
                className="flex items-center justify-between px-6 py-4 border-b last:border-b-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {tx.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(tx.date).toLocaleString()}
                  </p>
                </div>

                <p
                  className={`text-sm font-semibold ${tx.type === 'credit'
                      ? 'text-green-600'
                      : 'text-red-600'
                    }`}
                >
                  {tx.type === 'credit' ? '+' : '-'}₹
                  {tx.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-6">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50 hover:bg-gray-100"
            >
              Previous
            </button>

            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50 hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Add Money Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Add Money
            </h3>

            <input
              type="number"
              placeholder="Enter amount"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-[#7B1E1E] focus:outline-none"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMoney}
                className="rounded-lg bg-[#7B1E1E] px-4 py-2 text-sm text-white hover:bg-[#651818]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
