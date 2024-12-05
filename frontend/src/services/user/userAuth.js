
import axios from 'axios';
import {auth, googleProvider} from '../../firebase/firebase';
import {signInWithPopup} from 'firebase/auth'

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/user`;

//User: Sign Up 
export const signUpUser = (userData) => {
  return axios.post(`${API_BASE_URL}/signup`, userData).then(response => response.data);
};

//User: Verify OTP
export const verifyUserOtp = (email, otp) => {
  return axios.post(`${API_BASE_URL}/verify-otp`, { email, otp }).then(response => response.data);
};

//User: Login 
export const loginUser = (credentials) => {
  return axios.post(`${API_BASE_URL}/login`, credentials).then(response => response.data);
};

//User: Update Password
export const updatePassword = (token, passwordData) => {
  return axios.put(`${API_BASE_URL}/update-password`, passwordData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.data)
  .catch(error => {
    console.error('Error updating password:', error.response ? error.response.data : error.message);
    throw error;
  });
};



// export const resendUserOtp = (email) => {
//   return axios.post(`${API_BASE_URL}/resend-otp`, { email }).then(response => response.data);
// };

//User: Resend OTP
export const resendUserOtp = (email) => {
  // console.log("Attempting to resend OTP to email:", email); // Debugging
  return axios.post(`${API_BASE_URL}/resend-otp`, { email })
    .then(response => {
      // console.log("Resend OTP response received:", response.data); // Log the response data
      return response.data;
    })
    .catch(error => {
      console.error("Error resending OTP:", error.response ? error.response.data : error.message); 
      throw error;
    });
};

//User: Google Auth 
export const googleAuth = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userData = {
      name: user.displayName,
      email: user.email,
      googleID: user.uid,
    };

    const response = await axios.post(`${API_BASE_URL}/google-auth`, userData);
    return response.data; 
  } catch (error) {
    console.error("Error during Google Auth:", error);
    throw error;
  }
};