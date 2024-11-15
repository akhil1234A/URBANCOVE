import axios from 'axios';
import { toast } from 'react-toastify'; // Importing toast

const BASE_URL = 'http://localhost:3000/orders';

// Get tokens from localStorage
const getUserToken = () => localStorage.getItem('token');
const getAdminToken = () => localStorage.getItem('adminToken');

const orderService = {
  // Place a new order (User token)
  placeOrder: async (orderData) => {
    try {
      const userToken = getUserToken();
      const response = await axios.post(BASE_URL, orderData, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      // Show success toast
      toast.success("Order placed successfully!");
      return response.data;
    } catch (error) {
      // Show error toast
      toast.error("There was an error placing the order. Please try again.");
      throw error; // Re-throw the error for further handling
    }
  },

  // Cancel an order (User token)
  cancelOrder: async (orderId) => {
    try {
      const userToken = getUserToken();
      const response = await axios.put(`${BASE_URL}/${orderId}`, null, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      // Show success toast
      toast.success("Order cancelled successfully!");
      return response.data;
    } catch (error) {
      // Show error toast
      toast.error("Failed to cancel the order. Please try again.");
      throw error; // Re-throw the error for further handling
    }
  },

  // Fetch all orders (Admin token)
  viewAllOrders: async () => {
    try {
      const adminToken = getAdminToken();
      const response = await axios.get(`${BASE_URL}/admin/orders`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      return response.data;
    } catch (error) {
      // Show error toast
      toast.error("Failed to fetch orders. Please try again.");
      throw error; // Re-throw the error for further handling
    }
  },

  // Update order status (Admin token)
  updateOrderStatus: async (orderId, status) => {
    try {
      const adminToken = getAdminToken();
      const response = await axios.patch(
        `${BASE_URL}/admin/orders/${orderId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      // Show success toast
      toast.success("Order status updated successfully!");
      return response.data;
    } catch (error) {
      // Show error toast
      toast.error("Failed to update order status. Please try again.");
      throw error; // Re-throw the error for further handling
    }
  },

  viewUserOrders: async () => {
    try {
      const userToken = getUserToken(); 
      const response = await axios.get(`${BASE_URL}/user`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      return response.data; 
    } catch (error) {
      toast.error("Failed to fetch your orders. Please try again.");
      throw error; 
    }
  },

};

export default orderService;
