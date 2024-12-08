import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { viewAllOrders, cancelOrder, updateOrderStatus } from '../../slices/admin/orderSlice';
import { message } from 'antd';
import {assets} from '../../assets/admin'

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error, pagination } = useSelector((state) => state.orders);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(viewAllOrders({ page: currentPage, limit: 10 }));
  }, [dispatch, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  const getAllowedStatuses = (currentStatus) => {
    const allowedTransitions = {
      Pending: ["Pending", "Cancelled", "Shipped"],
      Shipped: ["Shipped", "Delivered"],
      Delivered: ["Delivered"],
      Cancelled: ["Cancelled"],
      Returned: ["Returned"], 
    };
    return allowedTransitions[currentStatus] || [];
  };

  const handleStatusChange = (event, orderId) => {
    const newStatus = event.target.value;

    // Find the current order
    const currentOrder = orders.find((order) => order._id === orderId);
    if (!currentOrder) {
      message.error("Order not found.");
      return;
    }

    const currentStatus = currentOrder.status;
    const allowedStatuses = getAllowedStatuses(currentStatus);

    if (!allowedStatuses.includes(newStatus)) {
      message.error(
        `Invalid status change from "${currentStatus}" to "${newStatus}".`
      );
      return;
    }

    // Dispatch the action if the transition is valid
    dispatch(updateOrderStatus({ orderId, status: newStatus }));
  };


 

  return (
    <div>
      <h1 className='text-2xl font-bold mb-4'>Order Management</h1>
      <div>
      {orders.map((order, index) => (
  <div 
    className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700" 
    key={index}
  >
    {/* Parcel Icon with Truncated Order Reference */}
    <div>
      <img className="w-12" src={assets.parcel_icon} alt="Parcel Icon" />
      <p 
        className="mt-2 text-gray-500 text-xs sm:text-sm truncate" 
        title={`Order ID: ${order.orderReference}`} // Full ID on hover
      >
        <strong>Order ID:</strong>
        <br />
        {order.orderReference.slice(-6)}
      </p>

    </div>

    {/* Order Items and User Details */}
    <div>
      <div>
        {order.items.map((item, idx) => (
          <p className="py-0.5" key={idx}>
            {item.productId.productName} x {item.quantity} <span> {item.size} </span>
            {idx < order.items.length - 1 && ', '}
          </p>
        ))}
      </div>
      <p className="text-sm sm:text-[15px]">{`${order.user.name} (${order.user.email})`}</p>
      
      {/* Delivery Address */}
      <div>
        <p>{order.deliveryAddress.street}</p>
        <p>{`${order.deliveryAddress.city}, ${order.deliveryAddress.state}, ${order.deliveryAddress.country}, ${order.deliveryAddress.postcode}`}</p>
      </div>
      <p>{order.deliveryAddress.phoneNumber}</p>
    </div>

    {/* Payment and Order Details */}
    <div>
      <p className="text-sm sm:text-[15px]">Items: {order.items.length}</p>
      <p className="mt-3">Method: {order.paymentMethod}</p>
      <p>Payment: {order.paymentStatus}</p>
      <p>Date: {new Date(order.placedAt).toLocaleDateString()}</p>
    </div>

    {/* Total Amount */}
    <p className="text-sm sm:text-[15px]">₹{order.totalAmount}</p>

    {/* Status Update Dropdown */}
    <div className="flex flex-col">
      <select
        value={order.status}
        onChange={(event) => handleStatusChange(event, order._id)}
        className="p-2 font-semibold"
      >
        {getAllowedStatuses(order.status).map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>
  </div>
      ))}


      </div>
      {/* Pagination */}
      <div className="pagination flex justify-center mt-4 space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`py-2 px-4 bg-gray-200 rounded-lg ${
            currentPage === 1 ? "cursor-not-allowed text-gray-400" : "hover:bg-gray-300"
          }`}
        >
          Previous
        </button>
        {Array.from({ length: pagination.totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={`py-2 px-4 rounded-lg ${
              currentPage === index + 1
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === pagination.totalPages}
          className={`py-2 px-4 bg-gray-200 rounded-lg ${
            currentPage === pagination.totalPages
              ? "cursor-not-allowed text-gray-400"
              : "hover:bg-gray-300"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Orders;
