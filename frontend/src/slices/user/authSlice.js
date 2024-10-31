import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { signUpUser, verifyUserOtp, loginUser, resendUserOtp } from '../../services/user/userAuth';

export const signUp = createAsyncThunk('auth/signUp', async (userData) => {
  return signUpUser(userData);
});

export const verifyOtp = createAsyncThunk('auth/verifyOtp', async ({ email, otp }) => {
  return verifyUserOtp(email, otp);
});

export const login = createAsyncThunk('auth/login', async (credentials) => {
  return loginUser(credentials);
});

export const resendOtp = createAsyncThunk('auth/resendOtp', async (email) => {
  console.log("Sending OTP to email:", email);
  // return resendUserOtp(email);
  const response = await resendUserOtp(email);
  console.log("Resend OTP response:", response); // Log the response from the service
  return response;
});

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
      state.error = null;
    },
    resetError: (state) => {
      state.error = null;
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
        state.token = payload.token;
        localStorage.setItem('token', payload.token);
      })
      .addCase(signUp.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload?.message || 'An error occurred during sign up';
      })
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyOtp.fulfilled, (state, { payload }) => {
        state.isLoading = false;
      })
      .addCase(verifyOtp.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload?.message || 'OTP verification failed';
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.user = payload.user;
        state.token = payload.token;
        localStorage.setItem('token', payload.token);
      })
      .addCase(login.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload?.message || 'Login failed';
      })
      .addCase(resendOtp.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resendOtp.fulfilled, (state) => {
        state.isLoading = false;
        console.log("OTP successfully resent:", payload);
      })
      .addCase(resendOtp.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload?.message || 'Failed to resend OTP';
        console.error("Error while resending OTP:", payload); 
      });
  },
});

export const { logout, resetError } = authSlice.actions;
export default authSlice.reducer;
