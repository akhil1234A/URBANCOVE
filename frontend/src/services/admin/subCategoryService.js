import axios from 'axios';

const API_URL = 'http://localhost:3000/admin/categories/subcategories';

// Helper function for handling errors consistently
const handleError = (error) => {
  const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
  console.error('API Error:', errorMessage);
  throw new Error(errorMessage); // Re-throw to allow handling in the calling code
};

// Fetch all subcategories
export const fetchSubCategories = async (token) => {
  try {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Add a new subcategory
export const addSubCategory = async (data, token) => {
  try {
    const response = await axios.post(API_URL, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.newSubCategory;
  } catch (error) {
    handleError(error);
  }
};

// Update an existing subcategory
export const updateSubCategory = async (id, data, token) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.updatedSubCategory;
  } catch (error) {
    handleError(error);
  }
};

// Toggle the status of a subcategory
export const toggleSubCategoryStatus = async (id, isActive, token) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, { isActive }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
