import axios from 'axios';

export const loginAdmin = async (email, password) => {
  const response = await axios.post('http://localhost:3000/admin/login', { email, password });
  return response.data;
};
