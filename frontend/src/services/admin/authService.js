import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/admin`;

//Admin: Login 
export const loginAdmin = async (email, password) => {
  const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
  return response.data;
};
