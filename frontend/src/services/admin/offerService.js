import axios from 'axios';

const BASE_URL = 'http://localhost:3000/admin/offers'; 


// Fetch all offers
export const fetchOffers = async (isActive = true) => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.get(BASE_URL, {
    headers: { Authorization: `Bearer ${token}` },
    params: { isActive },
  });
  return response.data;
};

// Fetch single offer details
export const fetchOfferById = async (offerId) => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.get(`${BASE_URL}/${offerId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Create a new offer
export const createOffer = async (offerData) => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.post(BASE_URL, offerData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Edit an existing offer
export const editOffer = async (offerId, offerData) => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.put(`${BASE_URL}/${offerId}`, offerData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Soft delete an offer
export const softDeleteOffer = async (offerId) => {
  const token = localStorage.getItem('adminToken');
  const response = await axios.patch(`${BASE_URL}/${offerId}`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
