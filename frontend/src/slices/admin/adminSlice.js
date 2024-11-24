import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginAdmin } from '../../services/admin/authService';


export const adminLogin = createAsyncThunk(
  'admin/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await loginAdmin(email, password);
      localStorage.setItem('adminToken', data.token);
      return data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : { message: 'Login failed' });
    }
  }
);

const initialState = {
  token: localStorage.getItem('adminToken') || null, 
  isAuthenticated: !!localStorage.getItem('adminToken'),
  error: null, 
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    logoutAdmin: (state) => {
      localStorage.removeItem('adminToken');
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      // toast.success('Logout successful');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        // toast.success('Login successful')
      })
      .addCase(adminLogin.rejected, (state, action) => {
        // toast.error(`Login Error: ${action.payload.message || "Login failed"}`);
        state.error = action.payload.message || "Login failed";
      });
  },
});

export const { logoutAdmin } = adminSlice.actions;
export default adminSlice.reducer;
