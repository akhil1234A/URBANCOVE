// src/components/OrderHistory.js
import React, { useState } from 'react';

const OrderHistory = () => {
  const [orders, setOrders] = useState([
    {
      id: 1,
      date: '2024-10-15',
      items: [
        { name: 'Laptop', price: 1000 },
        { name: 'Wireless Mouse', price: 50 },
      ],
      total: 1050,
      status: 'Shipped',
    },
    {
      id: 2,
      date: '2024-11-01',
      items: [{ name: 'Smartphone', price: 800 }],
      total: 800,
      status: 'Processing',
    },
  ]);

  const handleCancelOrder = (orderId) => {
    // Simulate order cancellation by updating order status
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: 'Cancelled' } : order
      )
    );
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

  return (
    <div className="p-6 max-w-3xl mx-auto ">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Order History</h2>
      
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="p-4 border border-gray-300 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Order #{order.id}</h3>
                <p className="text-gray-500">Date: {order.date}</p>
              </div>
              <p className={`font-semibold ${getStatusStyle(order.status)}`}>
                {order.status}
              </p>
            </div>
            
            {/* Order Items */}
            <div className="mt-4">
              <h4 className="text-gray-700 font-medium">Items:</h4>
              <ul className="list-disc list-inside ml-4 mt-2 text-gray-600">
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.name} - ${item.price}
                  </li>
                ))}
              </ul>
            </div>

            {/* Order Total and Actions */}
            <div className="mt-4 flex justify-between items-center">
              <p className="text-gray-800 font-semibold">Total: ${order.total}</p>
              <div className="space-x-4">
                {/* Cancel Order Button */}
                {order.status === 'Processing' && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md transition duration-200 hover:bg-red-500"
                  >
                    Cancel Order
                  </button>
                )}
                {/* Track Order Button */}
                <button
                   onClick={() => onTrackOrder(order.id)}
                   className="px-3 py-1 bg-blue-600 text-white rounded-md transition duration-200 hover:bg-blue-500"
                >
                  Track Order
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
