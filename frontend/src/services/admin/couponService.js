import { adminAxios } from "../../utils/api";


// Admin: Create a coupon
export const createCoupon = async (couponData) => {
  const response = await adminAxios.post('/coupons', couponData);
  return response.data;
};

// Admin: Edit a coupon
export const editCoupon = async (couponId, updatedData) => {
  const response = await adminAxios.patch(`/coupons/${couponId}`, updatedData);
  return response.data;
};

// Admin: Delete a coupon (soft delete)
export const deleteCoupon = async (couponId) => {
  const response = await adminAxios.delete(`/coupons/${couponId}`);
  return response.data;
};

// Admin: Get all coupons
export const getAllCoupons = async () => {
  const response = await adminAxios.get('/coupons/');
  return response.data;
};
