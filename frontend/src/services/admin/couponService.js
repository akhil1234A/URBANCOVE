import axios from 'axios';

const API_URL = 'http://localhost:3000/coupons'; 

// Set up Axios instance with default headers
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Add an interceptor to include the `adminToken` from localStorage
axiosInstance.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken');
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Create a coupon
export const createCoupon = async (couponData) => {
  const response = await axiosInstance.post('/', couponData);
  return response.data;
};

// Edit a coupon
export const editCoupon = async (couponId, updatedData) => {
  const response = await axiosInstance.patch(`/${couponId}`, updatedData);
  return response.data;
};

// Delete a coupon (soft delete)
export const deleteCoupon = async (couponId) => {
  const response = await axiosInstance.delete(`/${couponId}`);
  return response.data;
};

// Get all coupons
export const getAllCoupons = async () => {
  const response = await axiosInstance.get('/');
  return response.data;
};
