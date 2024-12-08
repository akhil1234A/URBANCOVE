import { adminAxios, userAxios } from "../../utils/api";

// Home: Fetch Products
export const fetchProducts = async (page = 1, limit = 10, search = '') => {
  const response = await userAxios.get(`/admin/products`, {
    params: {
      isActive: true,
      page,
      limit,
      isAdmin: false,
      search,
    },
  });
  return response.data; 
};

// Admin: Fetch Products
export const fetchAdminProducts = async (token, page = 1, limit = 10) => {
  const response = await adminAxios.get(`/admin/products`, {
    params: {
      page,
      limit,
      isAdmin: true,
    },
  });
  return response.data; 
};

// Admin: Update Product Status
export const updateProductStatusService = async (productId, isActive) => {
  const response = await adminAxios.patch(`/admin/products/${productId}/delete`, {
    isActive,
  });
  return response.data;
};

// Admin: Add a Product
export const addProductService = async (productData) => {
  const response = await adminAxios.post(`/admin/products`, productData); 
  return response.data; 
};

// Admin: Edit a Product
export const editProductService = async (productId, productData) => {
  const response = await adminAxios.patch(`/admin/products/${productId}`, productData); 
  return response.data; 
};
