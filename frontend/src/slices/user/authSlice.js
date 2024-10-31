import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Utility function to handle API responses
const handleApiResponse = async (apiCall) => {
  try {
    const response = await apiCall();
    return response.data; // Return the data if the request is successful
  } catch (error) {
    return Promise.reject(error.response?.data || { message: 'An error occurred' });
  }
};

// Async thunks for user authentication
export const signUp = createAsyncThunk('auth/signUp', async (userData) => {
  return handleApiResponse(() => axios.post('http://localhost:3000/user/signup', userData));
});

export const verifyOtp = createAsyncThunk('auth/verifyOtp', async ({ email, otp }) => {
  return handleApiResponse(() => axios.post('http://localhost:3000/user/verify-otp', { email, otp }));
});

export const login = createAsyncThunk('auth/login', async (credentials) => {
  return handleApiResponse(() => axios.post('http://localhost:3000/user/login', credentials));
});

export const resendOtp = createAsyncThunk('auth/resendOtp', async (email) => {
  return handleApiResponse(() => axios.post('http://localhost:3000/user/resend-otp', { email }));
});

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token') || null,
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      state.error = null; // Clear error on logout
    },
    resetError: (state) => {
      state.error = null; // Reset error state
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(signUp.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.user = payload.user;
        state.token = payload.token; // Assuming your signup response includes a token
        localStorage.setItem('token', payload.token);
      })
      .addCase(signUp.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload.message; // Capture error message
      })
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyOtp.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        // Handle successful OTP verification, possibly save user/token
      })
      .addCase(verifyOtp.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload.message; // Capture error message
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.user = payload.user;
        state.token = payload.token;
        localStorage.setItem('token', payload.token);
        console.log(payload.token);
        console.log(payload.user);
        
      })
      .addCase(login.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload.message; // Capture error message
        console.log(payload.message)
      })
      .addCase(resendOtp.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resendOtp.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        // Handle successful OTP resend, maybe show a success message
      })
      .addCase(resendOtp.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload.message; // Capture error message
        console.log(payload.message)
      });
  },
});

// Export actions and reducer
export const { logout, resetError } = authSlice.actions;
export default authSlice.reducer;
