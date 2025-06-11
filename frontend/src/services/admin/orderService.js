import { adminAxios, userAxios } from '../../utils/api';
import { toast } from 'react-toastify';

const BASE_URL = '/orders';

const orderService = {
  placeOrder: async (orderData) => {
      const response = await userAxios.post(BASE_URL, orderData);
      return response.data;
  },

  cancelOrder: async ({ orderId, cancellationReason }) => {
      const response = await userAxios.post(`${BASE_URL}/${orderId}/cancel`, { cancellationReason });
      return response.data;
  },

  viewUserOrders: async (page, limit) => {
    try {
      const response = await userAxios.get(`${BASE_URL}/user`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch orders. Please try again.');
      throw error;
    }
  },

  viewOrder: async (orderId) => {
    try {
      const response = await userAxios.get(`${BASE_URL}/${orderId}`);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch order details. Please try again.');
      throw error;
    }
  },

  viewAllOrders: async (page = 1, limit = 10) => {
    try {
      const response = await adminAxios.get(`${BASE_URL}/admin/orders`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch orders. Please try again.');
      throw error;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await adminAxios.patch(`${BASE_URL}/admin/orders/${orderId}`, { status });
      toast.success('Order status updated successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to update order status. Please try again.');
      throw error;
    }
  },
};

export default orderService;