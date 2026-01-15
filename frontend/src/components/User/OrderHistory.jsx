import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { viewUserOrders } from '../../slices/admin/orderSlice';
import { AiOutlineShoppingCart } from 'react-icons/ai';
import { toast } from 'react-toastify';
import { generateInvoice } from '../../utils/invoiceUtils';
import { userAxios } from '../../utils/api';
import CancelOrderModal from './CancelOrderModal';
import ReturnOrderModal from './ReturnOrderModal';
import { PulseLoader } from 'react-spinners';

const OrderHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading, pagination } = useSelector((state) => state.orders);

  const [currentPage, setCurrentPage] = useState(1);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    dispatch(viewUserOrders({ page: currentPage, limit: 5 }));
  }, [currentPage, dispatch]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  const handleCancelOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setCancelModalOpen(true);
  };

  const confirmCancelOrder = () => {
    setCancelModalOpen(false);
    setSelectedOrderId(null);
    dispatch(viewUserOrders({ page: currentPage, limit: 5 }));
  };

  const handleReturnOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setReturnModalOpen(true);
  };

  const confirmReturnOrder = async () => {
    try {
      await userAxios.post(`/orders/${selectedOrderId}/return`);
      toast.success('Order returned successfully!');
      dispatch(viewUserOrders({ page: currentPage, limit: 5 }));
    } catch {
      toast.error('Failed to process the return.');
    }
    setReturnModalOpen(false);
    setSelectedOrderId(null);
  };

  const handleDownload = async (order) => {
    try {
      const doc = await generateInvoice(order);
      doc.save(`invoice-${order.orderReference}.pdf`);
      toast.success('Invoice downloaded successfully!');
    } catch {
      toast.error('Failed to download invoice.');
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Shipped: 'bg-blue-100 text-blue-800',
      Delivered: 'bg-green-100 text-green-800',
      Cancelled: 'bg-red-100 text-red-800',
      Returned: 'bg-purple-100 text-purple-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <PulseLoader color="#7B1E1E" size={8} />
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <AiOutlineShoppingCart className="mb-4 text-6xl" />
        <p className="text-lg">No orders found</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-900">Order History</h2>
        <p className="mt-1 text-sm text-gray-500">
          View and manage your past orders
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="rounded-xl border border-gray-200 bg-white p-6"
          >
            {/* Order header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Order #{order.orderReference}
                </h3>
                <p className="text-xs text-gray-500">
                  Placed on {new Date(order.placedAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-200">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4 py-4">
                  <img
                    src={item.productId?.images?.[0] || '/placeholder.jpg'}
                    alt=""
                    className="h-16 w-16 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {item.productId?.productName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Size: {item.size} · Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-lg font-semibold text-gray-900">
                Total: ₹{order.totalAmount}
              </p>

              <div className="flex flex-wrap gap-3 text-sm">
                <button
                  onClick={() => navigate(`/account/orders/${order._id}`)}
                  className="rounded-md bg-[#7B1E1E] px-4 py-2 text-white hover:bg-[#651818]"
                >
                  View Details
                </button>

                {order.status === 'Pending' && (
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    className="text-red-600 hover:underline"
                  >
                    Cancel
                  </button>
                )}

                {order.status === 'Delivered' && (
                  <button
                    onClick={() => handleReturnOrder(order._id)}
                    className="text-gray-700 hover:underline"
                  >
                    Return
                  </button>
                )}

                {order.status !== 'Cancelled' && (
                  <button
                    onClick={() => handleDownload(order)}
                    className="text-gray-700 hover:underline"
                  >
                    Download Invoice
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-10 flex items-center justify-center gap-4 text-sm">
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          className="rounded-md border px-4 py-2 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-gray-600">
          Page {currentPage} of {pagination.totalPages}
        </span>
        <button
          disabled={currentPage === pagination.totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          className="rounded-md border px-4 py-2 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <CancelOrderModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={confirmCancelOrder}
        orderId={selectedOrderId}
      />

      <ReturnOrderModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        onConfirm={confirmReturnOrder}
      />
    </div>
  );
};

export default OrderHistory;
