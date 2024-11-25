import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cancelOrder, viewUserOrders } from '../../slices/admin/orderSlice';
import { AiOutlineShoppingCart, AiOutlineClockCircle } from 'react-icons/ai'; // Icons for no orders and processing status
import { MdError } from 'react-icons/md'; // Icon for errors

const OrderHistory = () => {
  const dispatch = useDispatch();
  const { orders, loading, error, successMessage } = useSelector((state) => state.orders);
  console.log(orders);

  // Fetch orders on component mount
  useEffect(() => {
    dispatch(viewUserOrders());
  }, [dispatch]);

  // Handle canceling an order
  const handleCancelOrder = (orderId) => {
    dispatch(cancelOrder(orderId));
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
      default:
        return 'text-gray-500';
    }
  };

  // Helper function to safely access error and success message
  const getMessage = (message) => {
    if (typeof message === 'object' && message !== null) {
      return message.message || JSON.stringify(message); // Fallback to stringify if it's an object
    }
    return message;
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Order History</h2>

      {/* Display success message */}
      {successMessage && (
        <div className="text-green-500 mb-4">{getMessage(successMessage)}</div>
      )}

      {/* Display error message */}
      {error && (
        <div className="flex items-center text-red-500 mb-4">
          <MdError className="mr-2" />
          {getMessage(error)}
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <p className="flex items-center justify-center text-gray-500">
            <AiOutlineClockCircle className="animate-spin mr-2" />
            Loading orders...
          </p>
        ) : (
          orders.length === 0 ? (
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
                  <p className={`font-semibold ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </p>
                </div>

                {/* Order Items */}
                <div className="mt-4">
                  <h4 className="text-gray-700 font-medium">Items:</h4>
                  <ul className="list-disc list-inside ml-4 mt-2 text-gray-600">
                    {order.items && order.items.map((item, index) => (
                      <li key={index}>
                        {item.productId.productName} - ${item.price} x {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Delivery Address */}
                <div className="mt-4">
                  <h4 className="text-gray-700 font-medium">Delivery Address:</h4>
                  <p className="text-gray-600">{order.deliveryAddress?.street}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.postcode}</p>
                  <p className="text-gray-600">{order.deliveryAddress?.country}</p>
                  <p className="text-gray-600">Phone: {order.deliveryAddress?.phoneNumber}</p>
                </div>

                {/* Order Total and Actions */}
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-gray-800 font-semibold">Total: ${order?.totalAmount}</p>
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
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
