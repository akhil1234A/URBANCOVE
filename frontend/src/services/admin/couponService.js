import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/coupons`; 


const axiosInstance = axios.create({
  baseURL: API_URL,
});


axiosInstance.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken');
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Admin: Create a coupon
export const createCoupon = async (couponData) => {
  const response = await axiosInstance.post('/', couponData);
  return response.data;
};

// Admin: Edit a coupon
export const editCoupon = async (couponId, updatedData) => {
  const response = await axiosInstance.patch(`/${couponId}`, updatedData);
  return response.data;
};

// Admin: Delete a coupon (soft delete)
export const deleteCoupon = async (couponId) => {
  const response = await axiosInstance.delete(`/${couponId}`);
  return response.data;
};

// Admin: Get all coupons
export const getAllCoupons = async () => {
  const response = await axiosInstance.get('/');
  return response.data;
};
