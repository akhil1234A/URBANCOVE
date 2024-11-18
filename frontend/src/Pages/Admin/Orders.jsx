import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { viewAllOrders, cancelOrder, updateOrderStatus } from '../../slices/admin/orderSlice';
import { message } from 'antd';
import {assets} from '../../assets/admin'

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error, successMessage } = useSelector((state) => state.orders);

  console.log(orders);

  useEffect(() => {
    dispatch(viewAllOrders()); 
  }, [dispatch]);



  const handleStatusChange = (event, orderId) => {
    const newStatus = event.target.value;
    dispatch(updateOrderStatus({ orderId, status: newStatus }));
  };

  // Display success or error messages
  useEffect(() => {
    if (successMessage) {
      message.success(successMessage);
    }
    if (error) {
      message.error(error);
    }
  }, [successMessage, error]);

  return (
    <div>
      <h3>Order Management</h3>
      <div>
        {orders.map((order, index) => (
          <div 
            className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700" 
            key={index}
          >
            <div>
              {/* Order Image or Icon */}
              <img className="w-12" src={assets.parcel_icon} alt="Parcel Icon" />
            </div>
            <div>
              {/* Order Items */}
              <div>
                {order.items.map((item, idx) => {
                  return (
                    <p className="py-0.5" key={idx}>
                      {item.productId.productName} x {item.quantity} <span> {item.size} </span>
                      {idx < order.items.length - 1 && ', '}
                    </p>
                  );
                })}
              </div>
              <p className="mb-2 font-medium">{`${order.user.name} (${order.user.email})`}</p>
              {/* Address */}
              <div>
                <p>{order.deliveryAddress.street}</p>
                <p>{`${order.deliveryAddress.city}, ${order.deliveryAddress.state}, ${order.deliveryAddress.country}, ${order.deliveryAddress.postcode}`}</p>
              </div>
              <p>{order.deliveryAddress.phoneNumber}</p>
            </div>
            <div>
              {/* Order Details */}
              <p className="text-sm sm:text-[15px]">Items: {order.items.length}</p>
              <p className="mt-3">Method: {order.paymentMethod}</p>
              <p>Payment: {order.paymentStatus ? 'Done' : 'Pending'}</p>
              <p>Date: {new Date(order.placedAt).toLocaleDateString()}</p>
            </div>
            {/* Total Amount */}
            <p className="text-sm sm:text-[15px]">${order.totalAmount}</p>
            <div className="flex flex-col">
              {/* Status Update Dropdown */}
              <select 
                value={order.status} 
                onChange={(event) => handleStatusChange(event, order._id)} 
                className="p-2 font-semibold"
              >
                <option value="Pending">Pending</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Returned">Returned</option>
              </select>
             
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
