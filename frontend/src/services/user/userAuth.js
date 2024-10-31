
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/user';


export const signUpUser = (userData) => {
  return axios.post(`${API_BASE_URL}/signup`, userData).then(response => response.data);
};


export const verifyUserOtp = (email, otp) => {
  return axios.post(`${API_BASE_URL}/verify-otp`, { email, otp }).then(response => response.data);
};


export const loginUser = (credentials) => {
  return axios.post(`${API_BASE_URL}/login`, credentials).then(response => response.data);
};


// export const resendUserOtp = (email) => {
//   return axios.post(`${API_BASE_URL}/resend-otp`, { email }).then(response => response.data);
// };
export const resendUserOtp = (email) => {
  console.log("Attempting to resend OTP to email:", email); // Debugging
  return axios.post(`${API_BASE_URL}/resend-otp`, { email })
    .then(response => {
      console.log("Resend OTP response received:", response.data); // Log the response data
      return response.data;
    })
    .catch(error => {
      console.error("Error resending OTP:", error.response ? error.response.data : error.message); // Log any errors
      throw error; // Rethrow the error to handle it in the slice
    });
};