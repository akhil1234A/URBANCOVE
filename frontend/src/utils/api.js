import axios from 'axios';


const getToken = (role = 'user') => {
  if (role === 'admin') {
    return localStorage.getItem('adminToken');
  }
  return localStorage.getItem('token');
};


const createAxiosInstance = (role = 'user') => {
  const API_URL = `${import.meta.env.VITE_API_BASE_URL}`;  
  
  const axiosInstance = axios.create({
    baseURL: API_URL,
  });

 
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = getToken(role);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};


export const userAxios = createAxiosInstance('user');
export const adminAxios = createAxiosInstance('admin');
