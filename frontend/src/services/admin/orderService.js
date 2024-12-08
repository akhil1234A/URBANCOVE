import { adminAxios, userAxios } from '../../utils/api';
import { toast } from 'react-toastify'; 

const BASE_URL = '/orders';





//User: Place an Order
const orderService = {
  
  placeOrder: async (orderData) => {
   
      
      const response = await userAxios.post(BASE_URL, orderData);
      // toast success("Order placed successfully!");
      return response.data;
    
  },

  // User: Cancel an order (User token)
  cancelOrder: async (orderId) => {
    try {
     
      const response = await userAxios.put(`${BASE_URL}/${orderId}`);

     
      toast.success("Order cancelled successfully!");
      return response.data;
    } catch (error) {
      
      toast.error("Failed to cancel the order. Please try again.");
      throw error; 
    }
  },

  // Admin: Fetch all orders (Admin token)
  viewAllOrders: async (page = 1, limit = 10) => {
    try {
      const response = await adminAxios.get(`${BASE_URL}/admin/orders`, {
        params: { page, limit }, 
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
      const response = await adminAxios.patch(
        `${BASE_URL}/admin/orders/${orderId}`,
        { status },
      );

      toast.success("Order status updated successfully!");
      return response.data;
    } catch (error) {
      
      toast.error("Failed to update order status. Please try again.");
      throw error; 
    }
  },

  //User: View User Orders
  viewUserOrders: async (page, limit) => {
    const response = await userAxios.get(`${BASE_URL}/user`, {
      params: { page, limit },
    });
    return response.data;
  },
};

export default orderService;
