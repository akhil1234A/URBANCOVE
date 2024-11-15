
const API_BASE_URL = 'http://localhost:3000'

export const fetchProducts = async (page = 1, limit = 100) => {
  const response = await fetch(`${API_BASE_URL}/admin/products?isActive=true&page=${page}&limit=${limit}&isAdmin=false`);
  if (!response.ok) throw new Error('Failed to fetch products');
  
  return response.json();
};

export const fetchAdminProducts = async (token, page = 1, limit = 10) => {
  const response = await fetch(`${API_BASE_URL}/admin/products?page=${page}&limit=${limit}&isAdmin=true`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch admin products');
  return response.json();
};


export const updateProductStatusService = async (productId, isActive, token) => {
  const response = await fetch(`${API_BASE_URL}/admin/products/${productId}/delete`, {
    method: 'PUT',
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

export const editProductService = async (productId, productData, token) => {
  const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
    method: 'PUT',
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
