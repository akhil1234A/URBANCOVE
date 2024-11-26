import axios from 'axios';
const API_BASE_URL = 'http://localhost:3000/user/address'; 

// User: Add a new address
export const addAddress = async (token, addressData) => {
  const response = await axios.post(`${API_BASE_URL}/`, addressData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data.address; 
};

// User: Get all addresses for the user
export const getAddresses = async (token) => {
  const response = await axios.get(`${API_BASE_URL}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.addresses; 
};

// User: Update an existing address
export const updateAddress = async (token, addressId, addressData) => {
  const response = await axios.put(`${API_BASE_URL}/${addressId}`, addressData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data.address; 
};

// User: Delete an address
export const deleteAddress = async (token, addressId) => {
  const response = await axios.delete(`${API_BASE_URL}/${addressId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return { _id: addressId };
};