import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/admin';

export const loginAdmin = async (email, password) => {
  const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
  console.log(response);
  return response.data;
};
