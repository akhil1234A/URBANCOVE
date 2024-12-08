import { adminAxios } from "../../utils/api";

const BASE_URL = '/admin/offers'; 


// Admin: Fetch all offers
export const fetchOffers = async (isActive = true) => {
  const response = await adminAxios.get(BASE_URL, {
    params: { isActive },
  });
  return response.data;
};

// Admin: Fetch single offer details
export const fetchOfferById = async (offerId) => {
  const response = await adminAxios.get(`${BASE_URL}/${offerId}`);
  return response.data;
};

// Admin: Create a new offer
export const createOffer = async (offerData) => {
  const response = await adminAxios.post(BASE_URL, offerData);
  return response.data;
};

// Admin: Edit an existing offer
export const editOffer = async (offerId, offerData) => {
  const response = await adminAxios.put(`${BASE_URL}/${offerId}`, offerData);
  return response.data;
};

// Admin: Soft delete an offer
export const softDeleteOffer = async (offerId) => {
  const response = await adminAxios.patch(`${BASE_URL}/${offerId}`);
  return response.data;
};
