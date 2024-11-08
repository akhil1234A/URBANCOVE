
const API_BASE_URL = 'http://localhost:3000'

export const fetchProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/products?isActive=true`);
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
};

export const fetchAdminProducts = async (token) => {
  const response = await fetch(`${API_BASE_URL}/admin/products`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch admin products');
  return response.json();
};

// export const fetchAdminProducts = async (token, page = 1, limit = 10) => {
//   const response = await fetch(`${API_BASE_URL}/admin/products?page=${page}&limit=${limit}`, {
//     method: 'GET',
//     headers: { 'Authorization': `Bearer ${token}` },
//   });

//   // Check for response status and throw error if not OK
//   if (!response.ok) throw new Error('Failed to fetch admin products');

//   // Parse the JSON response
//   const data = await response.json();

//   // Ensure that the returned data is an array
//   if (!Array.isArray(data)) {
//     throw new Error('Expected an array of products');
//   }

//   return data;
// };


export const updateProductStatusService = async (productId, isActive, token) => {
  const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
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
