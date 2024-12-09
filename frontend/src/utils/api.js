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
      // Skip token logic for login or public APIs
      const isLoginRequest =
        role === 'admin'
          ? config.url === '/admin/login'
          : config.url === '/login';

      if (!isLoginRequest) {
        const token = getToken(role);
        if (token) {
          if (isTokenExpired(token)) {
            console.warn("Token expired. Redirecting to login.");
            localStorage.removeItem(role === 'admin' ? 'adminToken' : 'token');
            window.location.href = role === 'admin' ? '/admin/login' : '/login';
          } else {
            config.headers["Authorization"] = `Bearer ${token}`;
          }
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        console.error("Token expired or unauthorized. Redirecting to login.");
        localStorage.removeItem(role === 'admin' ? 'adminToken' : 'token');
        window.location.href = role === 'admin' ? '/admin/login' : '/login';
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export const userAxios = createAxiosInstance('user');
export const adminAxios = createAxiosInstance('admin');
