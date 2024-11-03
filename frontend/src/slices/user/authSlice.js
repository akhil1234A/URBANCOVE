import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { signUpUser, verifyUserOtp, loginUser, resendUserOtp, signInWithGoogle } from '../../services/user/userAuth';

export const signUp = createAsyncThunk('auth/signUp', async (userData, { rejectWithValue }) => {
  try {
    return await signUpUser(userData);
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An error occurred during sign up';
    return rejectWithValue({ message: errorMessage });
  }
});


export const verifyOtp = createAsyncThunk('auth/verifyOtp', async ({ email, otp }, { rejectWithValue }) => {
  try {
    return await verifyUserOtp(email, otp);
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'OTP verification failed';
    return rejectWithValue({ message: errorMessage });
  }
});



export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    return await loginUser(credentials);
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An unknown error occurred';
    return rejectWithValue({ message: errorMessage });
  }
});

export const resendOtp = createAsyncThunk('auth/resendOtp', async (email, { rejectWithValue }) => {
  console.log("Sending OTP to email:", email);
  try {
    const response = await resendUserOtp(email);
    console.log("Resend OTP response:", response); 
    return response;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to resend OTP';
    console.error("Error while resending OTP:", errorMessage);
    return rejectWithValue({ message: errorMessage });
  }
});


export const loginWithGoogle = createAsyncThunk('auth/loginWithGoogle', async (_, { rejectWithValue }) => {
  try {
    const response = await signInWithGoogle();
    return response;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Google login failed';
    console.error("Error during Google login:", errorMessage);
    return rejectWithValue({ message: errorMessage });
  }
});


const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: localStorage.getItem('user') || null,
    token: localStorage.getItem('token') || null,
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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
        localStorage.setItem('token', payload.token);
        localStorage.setItem('user', payload.user);
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
        localStorage.setItem('user', payload.user);
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
      })
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginWithGoogle.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.user = payload.user || payload;
        state.token = payload.token || null;
        if (state.token) localStorage.setItem('token', state.token);
      })
      .addCase(loginWithGoogle.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload?.message || 'Google login failed';
      });
  },
});

export const { logout, resetError } = authSlice.actions;
export default authSlice.reducer;
