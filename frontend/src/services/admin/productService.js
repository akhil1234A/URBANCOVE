
const API_BASE_URL = ' http://localhost:3000'

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