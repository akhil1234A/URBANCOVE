import { useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { cancelOrder, viewUserOrders} from '../../slices/admin/orderSlice';
import { AiOutlineShoppingCart, AiOutlineClockCircle } from 'react-icons/ai'; 
import { toast } from 'react-toastify'; 

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

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Order History</h2>
      <div className="space-y-4">
        {loading ? (
          <p className="flex items-center justify-center text-gray-500">
            <AiOutlineClockCircle className="animate-spin mr-2" />
            Loading orders...
          </p>
        ) : orders.length === 0 ? (
          <div className="flex items-center justify-center text-gray-500">
            <AiOutlineShoppingCart className="mr-2 text-4xl" />
            No orders found
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="p-4 border border-gray-300 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Order #{order._id}</h3>
                  <p className="text-gray-500">Date: {formatDate(order.placedAt)}</p>
                </div>
                <p className={`font-semibold ${getStatusStyle(order.status)}`}>{order.status}</p>
              </div>

              {/* Order Items */}
              <div className="mt-4">
                <h4 className="text-gray-700 font-medium">Items:</h4>
                <ul className="list-disc list-inside ml-4 mt-2 text-gray-600">
                  {order.items?.map((item, index) => (
                    <li key={index}>
                      {item.productId.productName} - ₹{item.price} x {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Delivery Address */}
              <div className="mt-4">
                <h4 className="text-gray-700 font-medium">Delivery Address:</h4>
                <p className="text-gray-600">
                  {order.deliveryAddress?.street}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state}{' '}
                  {order.deliveryAddress?.postcode}
                </p>
                <p className="text-gray-600">{order.deliveryAddress?.country}</p>
                <p className="text-gray-600">Phone: {order.deliveryAddress?.phoneNumber}</p>
              </div>
              {order?.discountAmount > 0 && (
                <p className="text-gray-800 font-bold">Discount Applied: ₹{order.discountAmount}</p>
              )}

              {/* Order Actions */}
              <div className="mt-4 flex justify-between items-center">
                <p className="text-gray-800 font-semibold">Total: ₹{order?.totalAmount}</p>
                <div className="space-x-4">
                  {/* Cancel Order Button */}
                  {order.status === 'Pending' && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-md transition duration-200 hover:bg-red-500"
                    >
                      Cancel Order
                    </button>
                  )}
                  {/* Retry Payment Button */}
                  {order.paymentStatus === 'Failed' && (
                    <button
                      onClick={() => handleRetryPayment(order)}
                      className="px-3 py-1 bg-orange-600 text-white rounded-md transition duration-200 hover:bg-orange-500"
                    >
                      Retry Payment
                    </button>
                  )}
                  {/* Return Button */}
                  {order.status === 'Delivered' && (
                    <button
                      onClick={() => handleReturnOrder(order._id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md transition duration-200 hover:bg-blue-500"
                    >
                      Return
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
