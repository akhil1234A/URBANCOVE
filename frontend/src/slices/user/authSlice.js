import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { signUpUser, verifyUserOtp, loginUser, resendUserOtp, googleAuth, updatePassword} from '../../services/user/userAuth';

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

export const googleLogin = createAsyncThunk('auth/googleLogin', async (_, { rejectWithValue }) => {
  try {
    return await googleAuth();
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Google login failed';
    return rejectWithValue({ message: errorMessage });
  }
});

export const updatePasswordThunk = createAsyncThunk('auth/updatePassword', async ({ token, passwordData }, { rejectWithValue }) => {
  try {
    return await updatePassword(token, passwordData);
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to update password';
    return rejectWithValue({ message: errorMessage });
  }
});



const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('user')) || null,
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
      state.error = null
      state.isLoading = false;
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
        localStorage.setItem('user',  JSON.stringify(payload.user));
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
        localStorage.setItem('user',  JSON.stringify(payload.user));
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

      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(googleLogin.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.user = payload.user;
        state.token = payload.token;
        localStorage.setItem('token', payload.token);
        localStorage.setItem('user', JSON.stringify(payload.user));
      })
      .addCase(googleLogin.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload?.message || 'Google login failed';
      })
      .addCase(updatePasswordThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updatePasswordThunk.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updatePasswordThunk.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload?.message || 'Failed to update password';
      });
  },
});

export const { logout, resetError } = authSlice.actions;
export default authSlice.reducer;
