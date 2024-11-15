import axios from 'axios';
import { toast } from 'react-toastify';

const BASE_URL = 'http://localhost:3000/user/cart';

const getToken = () => {
  return localStorage.getItem('token');
};

const cartService = {
  addToCart: async (productId, quantity) => {
    try {
      const response = await axios.post(
        BASE_URL,
        { productId, quantity },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      return response.data;
    } catch (error) {
      handleSimpleError(error);
    }
  },

  updateCartItemQuantity: async (productId, quantity) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/${productId}`,
        { quantity },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      return response.data;
    } catch (error) {
      handleSimpleError(error);
    }
  },

  removeFromCart: async (productId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/${productId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      return response.data;
    } catch (error) {
      handleSimpleError(error);
    }
  },

  getUserCart: async () => {
    try {
      const response = await axios.get(BASE_URL, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      return response.data;
    } catch (error) {
      handleSimpleError(error);
    }
  },
};

const handleSimpleError = (error) => {
  if (error.response && error.response.data && error.response.data.message) {
    toast.error(error.response.data.message);
  } else if (error.message) {
    toast.error('An error occurred. Please try again.');
  }
};

export default cartService;
