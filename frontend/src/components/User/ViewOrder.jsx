import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userAxios } from '../../utils/api';
import { cancelOrder, viewOrder } from '../../slices/admin/orderSlice';
import { generateInvoice } from '../../utils/invoiceUtils';
import { PulseLoader } from 'react-spinners';
import CancelOrderModal from './CancelOrderModal';
import ReturnOrderModal from './ReturnOrderModal';
import { AiOutlineShoppingCart } from 'react-icons/ai';

const ViewOrder = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { order: orderDetails, loading, error } = useSelector((state) => state.orders);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);

  useEffect(() => {
    if (orderId) {
      dispatch(viewOrder(orderId));
    }
  }, [dispatch, orderId]);

  const handleCancelOrder = () => {
    setCancelModalOpen(true);
  };

  const confirmCancelOrder = async () => {
      setCancelModalOpen(false);
      dispatch(viewOrder(orderId));
    
  };

  const handleReturnOrder = () => {
    setReturnModalOpen(true);
  };

  const confirmReturnOrder = async () => {
    try {
      await userAxios.post(`/orders/${orderId}/return`);
      toast.success('Order returned successfully!');
      dispatch(viewOrder(orderId));
      setReturnModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process the return.');
    }
  };

  const handleRetryPayment = async () => {
    try {
      const response = await userAxios.post(`/orders/razorpay`, {
        orderId,
        addressId: orderDetails.deliveryAddress._id,
        cartItems: orderDetails.items,
        totalAmount: Math.round(orderDetails.totalAmount),
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
              orderId,
            };

            const verifyResponse = await userAxios.post(`/orders/verify`, verifyData);
            if (verifyResponse.data.success) {
              toast.success('Payment verified successfully!');
              dispatch(viewOrder(orderId));
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

  const handleDownload = async () => {
    try {
      const doc = await generateInvoice(orderDetails);
      doc.save(`invoice-${orderDetails.orderReference}.pdf`);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <PulseLoader color="#4A90E2" size={10} />
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="flex flex-col items-center justify-center text-gray-500 py-12">
        <AiOutlineShoppingCart className="text-6xl mb-4" />
        <p className="text-xl">{error || 'Order not found'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Order Details</h2>
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Order Summary</h3>
          <div className="space-y-2">
            <p className="text-gray-600">
              <strong>Order ID:</strong> {orderDetails.orderReference}
            </p>
            <p className="text-gray-600">
              <strong>Placed On:</strong> {formatDate(orderDetails.placedAt)}
            </p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(
                orderDetails.status
              )}`}
            >
              <strong>Status:</strong> {orderDetails.status}
            </span>
            {orderDetails.cancellationReason && (
              <p className="text-gray-600">
                <strong>Cancellation Reason:</strong> {orderDetails.cancellationReason}
              </p>
            )}
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Items</h3>
          <div className="space-y-4">
            {orderDetails.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 py-2">
                <img
                  src={item.productId?.images?.[0] || '/placeholder-image.jpg'}
                  alt={item.productId?.productName || 'Product'}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div className="flex-1">
                  <p className="text-gray-700 font-medium">
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
        </div>
        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Delivery Address</h3>
          <div className="space-y-1">
            <p className="text-gray-600">{orderDetails.deliveryAddress.street}</p>
            <p className="text-gray-600">
              {orderDetails.deliveryAddress.city}, {orderDetails.deliveryAddress.state},{' '}
              {orderDetails.deliveryAddress.postcode}, {orderDetails.deliveryAddress.country}
            </p>
            <p className="text-gray-600">Phone: {orderDetails.deliveryAddress.phoneNumber}</p>
          </div>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Payment Details</h3>
          <div className="space-y-2">
            <p className="text-gray-600">
              <strong>Method:</strong> {orderDetails.paymentMethod}
            </p>
            <p className="text-gray-600">
              <strong>Status:</strong> {orderDetails.paymentStatus}
            </p>
            {orderDetails.discountAmount > 0 && (
              <p className="text-gray-600">
                <strong>Discount:</strong> ₹{orderDetails.discountAmount}
              </p>
            )}
            <p className="text-gray-700 font-semibold">
              <strong>Total:</strong> ₹{orderDetails.totalAmount}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {orderDetails.status === 'Pending' && (
            <button
              onClick={handleCancelOrder}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 transition"
            >
              Cancel Order
            </button>
          )}
          {orderDetails.paymentStatus === 'Failed' && orderDetails.status !== 'Cancelled' && (
            <button
              onClick={handleRetryPayment}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-500 transition"
            >
              Retry Payment
            </button>
          )}
          {orderDetails.status === 'Delivered' && (
            <button
              onClick={handleReturnOrder}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-500 transition"
            >
              Return
            </button>
          )}
          {orderDetails.status !== 'Cancelled' && (
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 transition"
            >
              Download Invoice
            </button>
          )}
        </div>
      </div>
      <CancelOrderModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={confirmCancelOrder}
        orderId={orderId}
      />
      <ReturnOrderModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        onConfirm={confirmReturnOrder}
      />
    </div>
  );
};

export default ViewOrder;