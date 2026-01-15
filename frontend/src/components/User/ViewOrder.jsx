import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userAxios } from '../../utils/api';
import { viewOrder } from '../../slices/admin/orderSlice';
import { generateInvoice } from '../../utils/invoiceUtils';
import { PulseLoader } from 'react-spinners';
import CancelOrderModal from './CancelOrderModal';
import ReturnOrderModal from './ReturnOrderModal';
import { AiOutlineShoppingCart } from 'react-icons/ai';

const ViewOrder = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { order: orderDetails, loading, error } = useSelector(
    (state) => state.orders
  );

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);

  useEffect(() => {
    if (orderId) dispatch(viewOrder(orderId));
  }, [dispatch, orderId]);

  const handleDownload = async () => {
    try {
      const doc = await generateInvoice(orderDetails);
      doc.save(`invoice-${orderDetails.orderReference}.pdf`);
      toast.success('Invoice downloaded successfully!');
    } catch {
      toast.error('Failed to download invoice.');
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

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

  if (error || !orderDetails) {
    return (
      <div className="flex flex-col items-center py-16 text-gray-500">
        <AiOutlineShoppingCart className="mb-4 text-6xl" />
        <p className="text-lg">{error || 'Order not found'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-10 border-b border-gray-200 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-3 text-sm text-gray-500 hover:underline"
        >
          ← Back to orders
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Order #{orderDetails.orderReference}
            </h2>
            <p className="text-sm text-gray-500">
              Placed on {formatDate(orderDetails.placedAt)}
            </p>
          </div>

          <span
            className={`rounded-full px-4 py-1 text-sm font-medium ${getStatusStyle(
              orderDetails.status
            )}`}
          >
            {orderDetails.status}
          </span>
        </div>
      </div>

      {/* Items */}
      <section className="mb-10">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Items</h3>

        <div className="divide-y divide-gray-200 rounded-xl border border-gray-200">
          {orderDetails.items.map((item, index) => (
            <div key={index} className="flex gap-4 p-4">
              <img
                src={item.productId?.images?.[0] || '/placeholder.jpg'}
                alt=""
                className="h-20 w-20 rounded-md object-cover"
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
      </section>

      {/* Address + Payment */}
      <section className="mb-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 p-5">
          <h4 className="mb-3 text-sm font-semibold text-gray-900">
            Delivery Address
          </h4>
          <p className="text-sm text-gray-600">
            {orderDetails.deliveryAddress.street}
          </p>
          <p className="text-sm text-gray-600">
            {orderDetails.deliveryAddress.city},{' '}
            {orderDetails.deliveryAddress.state} –{' '}
            {orderDetails.deliveryAddress.postcode}
          </p>
          <p className="text-sm text-gray-600">
            {orderDetails.deliveryAddress.country}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Phone: {orderDetails.deliveryAddress.phoneNumber}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 p-5">
          <h4 className="mb-3 text-sm font-semibold text-gray-900">
            Payment Summary
          </h4>
          <p className="text-sm text-gray-600">
            Method: {orderDetails.paymentMethod}
          </p>
          <p className="text-sm text-gray-600">
            Status: {orderDetails.paymentStatus}
          </p>
          {orderDetails.discountAmount > 0 && (
            <p className="text-sm text-gray-600">
              Discount: ₹{orderDetails.discountAmount}
            </p>
          )}
          <p className="mt-2 text-lg font-semibold text-gray-900">
            Total: ₹{orderDetails.totalAmount}
          </p>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={handleDownload}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Download Invoice
        </button>

        {orderDetails.status === 'Pending' && (
          <button
            onClick={() => setCancelModalOpen(true)}
            className="text-sm text-red-600 hover:underline"
          >
            Cancel Order
          </button>
        )}

        {orderDetails.status === 'Delivered' && (
          <button
            onClick={() => setReturnModalOpen(true)}
            className="text-sm text-gray-700 hover:underline"
          >
            Return Order
          </button>
        )}
      </div>

      {/* Modals */}
      <CancelOrderModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={() => dispatch(viewOrder(orderId))}
        orderId={orderId}
      />

      <ReturnOrderModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        onConfirm={() => dispatch(viewOrder(orderId))}
      />
    </div>
  );
};

export default ViewOrder;
