
import { userAxios } from '../../utils/api';
import {auth, googleProvider} from '../../firebase/firebase';
import {signInWithPopup} from 'firebase/auth'

const API_BASE_URL = `/user`;

//User: Sign Up 
export const signUpUser = (userData) => {
  return userAxios.post(`${API_BASE_URL}/signup`, userData).then(response => response.data);
};

//User: Verify OTP
export const verifyUserOtp = (email, otp) => {
  return userAxios.post(`${API_BASE_URL}/verify-otp`, { email, otp }).then(response => response.data);
};

//User: Login 
export const loginUser = (credentials) => {
  return userAxios.post(`${API_BASE_URL}/login`, credentials).then(response => response.data);
};

//User: Update Password
export const updatePassword = (token, passwordData) => {
  return userAxios.put(`${API_BASE_URL}/update-password`, passwordData)
  .then(response => response.data)
  .catch(error => {
    console.error('Error updating password:', error.response ? error.response.data : error.message);
    throw error;
  });
};



//User: Resend OTP
export const resendUserOtp = (email) => {
  return userAxios.post(`${API_BASE_URL}/resend-otp`, { email })
    .then(response => {
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

    const response = await userAxios.post(`${API_BASE_URL}/google-auth`, userData);
    return response.data; 
  } catch (error) {
    console.error("Error during Google Auth:", error);
    throw error;
  }
};