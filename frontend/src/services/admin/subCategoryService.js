import { adminAxios } from "../../utils/api";

const API_URL = `/admin/categories/subcategories`;

// Helper for Error Handling
const handleError = (error) => {
  const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
  console.error('API Error:', errorMessage);
  throw new Error(errorMessage); // Re-throw to allow handling in the calling code
};

// Admin: Fetch all subcategories
export const fetchSubCategories = async () => {
  try {
    const response = await adminAxios.get(API_URL);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Admin: Add a new subcategory
export const addSubCategory = async (data) => {
  try {
    const response = await adminAxios.post(API_URL, data);
    return response.data.newSubCategory;
  } catch (error) {
    handleError(error);
  }
};

// Admin: Update an existing subcategory
export const updateSubCategory = async (id, data) => {
  try {
    const response = await adminAxios.put(`${API_URL}/${id}`, data);
    return response.data.updatedSubCategory;
  } catch (error) {
    handleError(error);
  }
};

// Admin: Toggle the status of a subcategory
export const toggleSubCategoryStatus = async (id, isActive) => {
  try {
    const response = await adminAxios.put(`${API_URL}/${id}`, { isActive });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
