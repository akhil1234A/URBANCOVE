import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { cancelOrder } from '../../slices/admin/orderSlice';

const CancelOrderModal = ({ isOpen, onClose, onConfirm, orderId }) => {
  const dispatch = useDispatch();
  const [cancellationReason, setCancellationReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const reasons = [
    'Changed my mind',
    'Ordered by mistake',
    'Found a better price elsewhere',
    'Delivery time too long',
    'Other',
  ];

  const handleConfirm = async () => {
    if (!cancellationReason) {
      toast.error('Please select a cancellation reason.');
      return;
    }

    const reasonToSend = cancellationReason === 'Other' ? customReason : cancellationReason;
    if (cancellationReason === 'Other' && !customReason) {
      toast.error('Please provide a custom reason.');
      return;
    }

    try {
      await dispatch(cancelOrder({ orderId, cancellationReason: reasonToSend })).unwrap();
      toast.success('Order canceled successfully!');
      onConfirm();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to cancel order.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Cancel Order</h3>
        <p className="text-gray-600 mb-4">Please select a reason for cancellation:</p>
        <select
          value={cancellationReason}
          onChange={(e) => setCancellationReason(e.target.value)}
          className="w-full p-2 border rounded-md mb-4"
        >
          <option value="">Select a reason</option>
          {reasons.map((reason, index) => (
            <option key={index} value={reason}>{reason}</option>
          ))}
        </select>
        {cancellationReason === 'Other' && (
          <textarea
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Please specify the reason"
            className="w-full p-2 border rounded-md mb-4"
            rows={4}
          />
        )}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
          >
            Close
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;