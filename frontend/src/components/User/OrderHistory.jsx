import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { cancelOrder, viewUserOrders } from '../../slices/admin/orderSlice';
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
    if (selectedOrderId) {
      try {
        await userAxios.post(`/orders/${selectedOrderId}/return`);
        toast.success('Order returned successfully!');
        dispatch(viewUserOrders({ page: currentPage, limit: 5 }));
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to process the return.');
      }
      setReturnModalOpen(false);
      setSelectedOrderId(null);
    }
  };

  const handleRetryPayment = async (order) => {
    try {
      const response = await userAxios.post(`/orders/razorpay`, {
        orderId: order._id,
        addressId: order.deliveryAddress._id,
        cartItems: order.items,
        totalAmount: Math.round(order.totalAmount),
      });

      const { razorpayOrderId, amount, currency } = response.data;
      const razorpayOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            const verifyData = {
              razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: order._id,
            };

            const verifyResponse = await userAxios.post(`/orders/verify`, verifyData);
            if (verifyResponse.data.success) {
              toast.success('Payment verified successfully!');
              dispatch(viewUserOrders({ page: currentPage, limit: 5 }));
            } else {
              toast.error('Payment verification failed.');
            }
          } catch (error) {
            toast.error('Payment verification failed.');
          }
        },
        theme: { color: '#3399cc' },
      };

      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.open();
    } catch (error) {
      toast.error('Failed to initialize retry payment.');
    }
  };

  const handleDownload = async (order) => {
    try {
      const doc = await generateInvoice(order);
      doc.save(`invoice-${order.orderReference}.pdf`);
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download invoice.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
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

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-3">Order History</h2>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <PulseLoader color="#4A90E2" size={10} />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-gray-500 py-12">
          <AiOutlineShoppingCart className="text-6xl mb-4" />
          <p className="text-xl">No orders found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Order #{order.orderReference}
                  </h3>
                  <p className="text-sm text-gray-500">Placed on: {formatDate(order.placedAt)}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>
              <div className="mb-4">
                <h4 className="text-md font-medium text-gray-700 mb-2">Items:</h4>
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 py-2 border-b last:border-b-0"
                  >
                    <img
                      src={item.productId?.images?.[0] || '/placeholder-image.jpg'}
                      alt={item.productId?.productName || 'Product'}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {item.productId?.productName || 'Product'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Size: {item.size} | Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-500">Price: ₹{item.price}</p>
                    </div>
                    <p className="text-gray-700 font-semibold">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <h4 className="text-md font-medium text-gray-700 mb-2">Delivery Address:</h4>
                <p className="text-gray-600">
                  {order.deliveryAddress?.street}, {order.deliveryAddress?.city},{' '}
                  {order.deliveryAddress?.state}, {order.deliveryAddress?.postcode},{' '}
                  {order.deliveryAddress?.country}
                </p>
                <p className="text-gray-600">Phone: {order.deliveryAddress?.phoneNumber}</p>
              </div>
              <div className="mb-4">
                <h4 className="text-md font-medium text-gray-700 mb-2">Payment Details:</h4>
                <p className="text-gray-600 capitalize">
                  Method: {order.paymentMethod || 'Not specified'}
                </p>
                <p className="text-gray-600">Status: {order.paymentStatus}</p>
                {order.discountAmount > 0 && (
                  <p className="text-gray-600">Discount: ₹{order.discountAmount}</p>
                )}
              </div>
              {order.cancellationReason && (
                <div className="mb-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">Cancellation Reason:</h4>
                  <p className="text-gray-600">{order.cancellationReason}</p>
                </div>
              )}
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold text-gray-800">Total: ₹{order.totalAmount}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate(`/account/orders/${order._id}`)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-500 transition"
                  >
                    View Details
                  </button>
                  {order.status === 'Pending' && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-500 transition"
                    >
                      Cancel Order
                    </button>
                  )}
                  {order.paymentStatus === 'Failed' && order.status !== 'Cancelled' && (
                    <button
                      onClick={() => handleRetryPayment(order)}
                      className="px-4 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-500 transition"
                    >
                      Retry Payment
                    </button>
                  )}
                  {order.status === 'Delivered' && (
                    <button
                      onClick={() => handleReturnOrder(order._id)}
                      className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-500 transition"
                    >
                      Return
                    </button>
                  )}
                  {order.status !== 'Cancelled' && (
                    <button
                      onClick={() => handleDownload(order)}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-500 transition"
                    >
                      Download Invoice
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div className="flex justify-center items-center mt-6 space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                currentPage === 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Page {currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                currentPage === pagination.totalPages
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
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