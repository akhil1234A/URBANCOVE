// src/components/ViewOrder.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ViewOrder = () => {
  const navigate = useNavigate();

  // Dummy order data
  const order = {
    id: 12345,
    date: '2024-11-13',
    status: 'Processing',
    items: [
      { name: 'Wireless Bluetooth Headphones', price: 59.99, quantity: 2 },
      { name: 'Portable Charger 10000mAh', price: 25.00, quantity: 1 },
      { name: 'USB-C to Lightning Cable', price: 12.99, quantity: 3 },
    ],
    total: 135.96,  // Based on the sum of items and any additional charges
  };

  const handleCancelOrder = () => {
    alert(`Order #${order.id} has been cancelled.`);
    navigate('/orders'); // Redirect to order history after cancellation
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Order Details</h2>

      <div className="space-y-4">
        {/* Order Information */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Order #{order.id}</h3>
            <p className="text-gray-500">Date: {order.date}</p>
            <p className={`font-semibold ${order.status === 'Processing' ? 'text-yellow-500' : 'text-gray-500'}`}>
              Status: {order.status}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="mt-4">
          <h4 className="text-gray-700 font-medium">Items in this order:</h4>
          <ul className="list-disc list-inside ml-4 mt-2 text-gray-600">
            {order.items.map((item, index) => (
              <li key={index}>
                {item.name} - ${item.price.toFixed(2)} x {item.quantity}
              </li>
            ))}
          </ul>
        </div>

        {/* Order Summary */}
        <div className="mt-4 border-t border-gray-300 pt-4">
          <h4 className="text-gray-700 font-medium">Order Summary:</h4>
          <div className="mt-2 flex justify-between text-gray-800">
            <span>Subtotal:</span>
            <span>${order.items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</span>
          </div>
          <div className="mt-2 flex justify-between text-gray-800">
            <span>Shipping:</span>
            <span>$5.00</span>
          </div>
          <div className="mt-2 flex justify-between text-gray-800 font-semibold">
            <span>Total:</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Order Actions */}
        <div className="mt-6 flex space-x-4">
          {order.status === 'Processing' && (
            <button
              onClick={handleCancelOrder}
              className="px-4 py-2 bg-red-600 text-white rounded-md transition duration-200 hover:bg-red-500"
            >
              Cancel Order
            </button>
          )}
          <button
            onClick={() => alert('Tracking information will be displayed here.')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md transition duration-200 hover:bg-blue-500"
          >
            Track Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewOrder;
