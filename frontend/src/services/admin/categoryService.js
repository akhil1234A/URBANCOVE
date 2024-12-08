import { adminAxios } from "../../utils/api";

const API_URL = '/admin/categories';

//Admin: Get Categories
export const fetchCategories = async () => {
  try {
    const response = await adminAxios.get(API_URL);
    return response.data; 
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching categories');
  }
};

//Admin: Add a Category
export const addCategory = async (token,category) => {
  try {
    const response = await adminAxios.post(API_URL, category);
    return response.data.newCategory; 
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error adding category');
  }
};

//Admin: Update a Category
export const updateCategory = async (token, categoryId, category) => {
  try {
    const response = await adminAxios.put(`${API_URL}/${categoryId}`, category);
    return response.data; 
  } catch (error) {
  
    throw new Error(error.response?.data?.message || 'Error updating category');
  }
};

//Admin: Get All Sub Categories of a Category
export const fetchSubCategoriesByCategoryId = async (categoryId) => {
  try {
    const response = await adminAxios.get(`${API_URL}/${categoryId}/subcategories`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching sub categories of category');
  }
};


