import axios from 'axios';
import { isTokenExpired } from './jwtdecode';

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
        if (isTokenExpired(token)) {
            // Redirect to login if expired
            localStorage.removeItem("token");
            window.location.href = "/login";
        } else {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
    }
      return config;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        console.error("Token expired. Redirecting to login.");
        localStorage.removeItem("token");
        window.location.href = "/login";
    }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};


export const userAxios = createAxiosInstance('user');
export const adminAxios = createAxiosInstance('admin');
