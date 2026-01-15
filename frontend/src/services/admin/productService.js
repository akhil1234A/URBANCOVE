import { adminAxios, userAxios } from "../../utils/api";

// Home: Fetch Products
export const fetchProducts = async (page = 1, limit = 10, search = '', inStock) => {
  const response = await userAxios.get(`/products`, {
    params: {
      page,
      limit,
      search,
      inStock
    },
  });
  return response.data; 
};

// Admin: Fetch Products
export const fetchAdminProducts = async (token, page = 1, limit = 10) => {
  const response = await adminAxios.get(`/products/admin`, {
    params: {
      page,
      limit,
    },
  });
  return response.data; 
};

// Admin: Update Product Status
export const updateProductStatusService = async (productId, isActive) => {
  try {
    const response = await adminAxios.patch(`/products/admin/${productId}/delete`, {
      isActive,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Error occurred');
    } else {
      throw new Error('Network error');
    }
  }
};


// Admin: Add a Product
export const addProductService = async (productData) => {
  const response = await adminAxios.post(`/products/admin`, productData); 
  return response.data; 
};

// Admin: Edit a Product
export const editProductService = async (productId, productData) => {
  const response = await adminAxios.patch(`/products/admin/${productId}`, productData); 
  return response.data; 
};
