import { userAxios } from '../../utils/api';
import { toast } from 'react-toastify';

const BASE_URL = `/user/cart`;


const cartService = {
  //User: Add to cart
  addToCart: async (productId, quantity) => {
    try {
      const response = await userAxios.post(
        BASE_URL,
        { productId, quantity },
      );
      return response.data;
    } catch (error) {
      handleSimpleError(error);
    }
  },

  //User: Update quantity of Cart Item 
  updateCartItemQuantity: async (productId, quantity) => {
    try {
      const response = await userAxios.put(
        `${BASE_URL}/${productId}`,
        { quantity },
      );
      return response.data;
    } catch (error) {
      handleSimpleError(error);
    }
  },

  //User: Remove from Cart
  removeFromCart: async (productId) => {
    try {
      const response = await userAxios.delete(`${BASE_URL}/${productId}`);
      return response.data;
    } catch (error) {
      handleSimpleError(error);
    }
  },

  //User: Get All Cart Items
  getUserCart: async () => {
    try {
      const response = await userAxios.get(BASE_URL);
      return response.data;
    } catch (error) {
      handleSimpleError(error);
    }
  },
};

//Helper Function 
const handleSimpleError = (error) => {
  if (error.response && error.response.data && error.response.data.message) {
    toast.error(error.response.data.message);
  } else if (error.message) {
    toast.error('An error occurred. Please try again.');
  }
};

export default cartService;
