import { userAxios } from "../../utils/api";

const API_BASE_URL = `/user/address`; 

// User: Add a new address
export const addAddress = async (token, addressData) => {
  const response = await userAxios.post(`${API_BASE_URL}/`, addressData);
  return response.data.address; 
};

// User: Get all addresses for the user
export const getAddresses = async () => {
  const response = await userAxios.get(`${API_BASE_URL}/`);
  return response.data.addresses; 
};

// User: Update an existing address
export const updateAddress = async (token, addressId, addressData) => {
  const response = await userAxios.put(`${API_BASE_URL}/${addressId}`, addressData);
  return response.data.address; 
};

// User: Delete an address
export const deleteAddress = async (token, addressId) => {
  const response = await userAxios.delete(`${API_BASE_URL}/${addressId}`);
  return { _id: addressId };
};