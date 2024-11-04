import axios from 'axios';

const API_URL = 'http://localhost:3000/admin/categories';

// Function to fetch categories
export const fetchCategories = async (token) => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data; 
  } catch (error) {
    // Handle errors properly
    throw new Error(error.response?.data?.message || 'Error fetching categories');
  }
};

// Function to add a category
export const addCategory = async (token, category) => {
  try {
    const response = await axios.post(API_URL, category, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.newCategory; 
  } catch (error) {
    // Handle errors properly
    throw new Error(error.response?.data?.message || 'Error adding category');
  }
};

// Function to update a category
export const updateCategory = async (token, categoryId, category) => {
  try {
    const response = await axios.put(`${API_URL}/${categoryId}`, category, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data; 
  } catch (error) {
    // Handle errors properly
    throw new Error(error.response?.data?.message || 'Error updating category');
  }
};

export const fetchSubCategoriesByCategoryId = async (categoryId, token) => {
  try {
    const response = await axios.get(`${SUBCATEGORY_API_URL}/${categoryId}/subcategories`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};


// // Function to toggle category status
// export const toggleCategoryStatus = async (token, categoryId, currentStatus) => {
//   try {
//     const response = await axios.put(`${API_URL}/${categoryId}`, {
//       isActive: !currentStatus
//     }, {
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     });
//     return response.data; 
//   } catch (error) {
//     // Handle errors properly
//     throw new Error(error.response?.data?.message || 'Error toggling category status');
//   }
// };
