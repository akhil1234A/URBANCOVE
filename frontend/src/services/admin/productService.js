
const API_BASE_URL = 'http://localhost:3000'

//Home: Fetch Products
export const fetchProducts = async (page = 1, limit = 100, search) => {
  const response = await fetch(`${API_BASE_URL}/admin/products?isActive=true&page=${page}&limit=${limit}&isAdmin=false&search=${search}`);
  if (!response.ok) throw new Error('Failed to fetch products');
  
  return response.json();
};

//Admin: Fetch Products
export const fetchAdminProducts = async (token, page = 1, limit = 10) => {
  const response = await fetch(`${API_BASE_URL}/admin/products?page=${page}&limit=${limit}&isAdmin=true`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch admin products');
  return response.json();
};

//Admin: Update a Product
export const updateProductStatusService = async (productId, isActive, token) => {
  const response = await fetch(`${API_BASE_URL}/admin/products/${productId}/delete`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isActive }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update product status');
  }
  return response.json();
};


//Admin: Add a Product
export const addProductService = async (productData, token) => {
  const response = await fetch(`${API_BASE_URL}/admin/products`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: productData,
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to add product');
  }
  
  return response.json();
};


//Admin: Edit a Product
export const editProductService = async (productId, productData, token) => {
  const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: productData,
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to edit product');
  }
  
  return response.json();
};
