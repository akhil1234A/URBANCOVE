import { useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { cancelOrder, viewUserOrders} from '../../slices/admin/orderSlice';
import { AiOutlineShoppingCart, AiOutlineClockCircle } from 'react-icons/ai'; 
import { toast } from 'react-toastify'; 
import { generateInvoice } from "../../utils/invoiceUtils";

const OrderHistory = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);

  // Fetch orders on component mount
  useEffect(() => {
    dispatch(viewUserOrders());
  }, [dispatch]);

  // Handle canceling an order
  const handleCancelOrder = (orderId) => {
    dispatch(cancelOrder(orderId));
  };

  // Retry payment for failed orders
  const handleRetryPayment = async (order) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("User is not authenticated. Please log in.");
        return;
      }
  
      const response = await axios.post(
        'http://localhost:3000/orders/razorpay',
        {
          orderId: order._id, 
          addressId: order.deliveryAddress._id,
          cartItems: order.items,
          totalAmount: order.totalAmount,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
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
  
            const verifyResponse = await axios.post(
              'http://localhost:3000/orders/verify',
              verifyData,
              { headers: { Authorization: `Bearer ${token}` } }
            );
  
            if (verifyResponse.data.success) {
              toast.success("Payment verified successfully!");
              dispatch(viewUserOrders()); // Refresh orders after success
            } else {
              toast.error("Payment verification failed.");
            }
          } catch (error) {
            console.error("Payment verification failed:", error);
            toast.error("Payment verification failed.");
          }
        },
        theme: { color: "#3399cc" },
      };
  
      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.open();
    } catch (error) {
      console.error("Failed to initialize retry payment:", error);
      toast.error("Failed to initialize retry payment. Please try again.");
    }
  };
  
  // Handle return for delivered orders
  const handleReturnOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("User is not authenticated. Please log in.");
        return;
      }
  
      const response = await axios.post(
        `http://localhost:3000/orders/${orderId}/return`,
        {}, // No body content required for return API
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      if (response.status === 200) {
        toast.success("Order returned successfully!");
        dispatch(viewUserOrders()); // Refresh orders after return
      }
    } catch (error) {
      console.error("Failed to return order:", error);
      toast.error(error.response?.data?.message || "Failed to process the return.");
    }
  };
  

  // Format the order date into a more readable format (optional)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Processing':
        return 'text-yellow-500';
      case 'Shipped':
        return 'text-blue-500';
      case 'Delivered':
        return 'text-green-500';
      case 'Cancelled':
        return 'text-red-500';
      case 'Failed':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  const handleDownload = async (order) => {
    try {
      const doc = await generateInvoice(order);
      const fileName = `invoice-${order._id}.pdf`;
      doc.save(fileName);
      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download invoice. Please try again.");
      console.error("Download error:", error);
    }
  };
   

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 rounded-lg shadow-md">
    <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-3">Order History</h2>
    <div className="space-y-6">
      {loading ? (
        <p className="flex items-center justify-center text-gray-500">
          <AiOutlineClockCircle className="animate-spin mr-2 text-2xl" />
          Loading orders...
        </p>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-gray-500">
          <AiOutlineShoppingCart className="text-6xl mb-2" />
          <p className="text-lg">No orders found</p>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="p-5 border border-gray-300 rounded-lg bg-white shadow-sm">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Order #{order._id}</h3>
                <p className="text-sm text-gray-500">Date: {formatDate(order.placedAt)}</p>
              </div>
              <p className={`font-semibold text-lg ${getStatusStyle(order.status)}`}>{order.status}</p>
            </div>
  
            {/* Order Items */}
            <div className="mb-4">
              <h4 className="text-gray-700 font-medium text-md">Items:</h4>
              <ul className="list-disc list-inside ml-4 mt-2 text-gray-600 space-y-1">
                {order.items?.map((item, index) => (
                  <li key={index}>
                    <span className="font-medium">{item.productId.productName}</span> - ₹{item.price} x {item.quantity}
                  </li>
                ))}
              </ul>
            </div>
  
            {/* Delivery Address */}
            <div className="mb-4">
              <h4 className="text-gray-700 font-medium text-md">Delivery Address:</h4>
              <p className="text-gray-600">
                {order.deliveryAddress?.street}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state}{' '}
                {order.deliveryAddress?.postcode}
              </p>
              <p className="text-gray-600">{order.deliveryAddress?.country}</p>
              <p className="text-gray-600">Phone: {order.deliveryAddress?.phoneNumber}</p>
            </div>
  
            {/* Payment Method */}
            <div className="mb-4">
              <h4 className="text-gray-700 font-medium text-md">Payment Method:</h4>
              <p className="text-gray-600 capitalize">{order.paymentMethod || "Not specified"}</p>
            </div>
  
            {/* Discount */}
            {order?.discountAmount > 0 && (
              <p className="text-gray-800 font-bold mb-4">Discount Applied: ₹{order.discountAmount}</p>
            )}
  
            {/* Footer Section */}
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold text-gray-800">Total: ₹{order?.totalAmount}</p>
              <div className="space-x-3">
                {/* Cancel Order Button */}
                {order.status === 'Pending' && (
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md transition hover:bg-red-500"
                  >
                    Cancel Order
                  </button>
                )}
                {/* Retry Payment Button */}
                {order.paymentStatus === 'Failed' && order.status !== 'Cancelled' && (
                  <button
                    onClick={() => handleRetryPayment(order)}
                    className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md transition hover:bg-orange-500"
                  >
                    Retry Payment
                  </button>
                )}
                {/* Return Button */}
                {order.status === 'Delivered' && (
                  <button
                    onClick={() => handleReturnOrder(order._id)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md transition hover:bg-blue-500"
                  >
                    Return
                  </button>
                )}
                {order.status !== 'Cancelled' && (
                  <button
                    onClick={() => handleDownload(order)}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md transition hover:bg-green-500"
                  >
                    Download Invoice
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
  
  );
};

export default OrderHistory;
