import axios from 'axios';
import { toast } from 'react-toastify'; // Importing toast

const BASE_URL = 'http://localhost:3000/orders';


const getUserToken = () => localStorage.getItem('token');
const getAdminToken = () => localStorage.getItem('adminToken');


//User: Place an Order
const orderService = {
  
  placeOrder: async (orderData) => {
   
      const userToken = getUserToken();
      const response = await axios.post(BASE_URL, orderData, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      // toast success("Order placed successfully!");
      return response.data;
    
  },

  // User: Cancel an order (User token)
  cancelOrder: async (orderId) => {
    try {
      const userToken = getUserToken();
      const response = await axios.put(`${BASE_URL}/${orderId}`, null, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

     
      toast.success("Order cancelled successfully!");
      return response.data;
    } catch (error) {
      
      toast.error("Failed to cancel the order. Please try again.");
      throw error; 
    }
  },

  // Admin: Fetch all orders (Admin token)
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
      toast.error("Failed to fetch orders. Please try again.");
      throw error; 
    }
  },

  // Admin: Update order status (Admin token)
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

      toast.success("Order status updated successfully!");
      return response.data;
    } catch (error) {
      
      toast.error("Failed to update order status. Please try again.");
      throw error; 
    }
  },

  //Admin: View User Orders
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
