import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginAdmin } from '../../services/admin/authService';

export const adminLogin = createAsyncThunk(
  'admin/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await loginAdmin(email, password);
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: { token: null, isAuthenticated: false, error: null },
  reducers: {
    logoutAdmin: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.error = action.payload.message;
      });
  },
});

export const { logoutAdmin } = adminSlice.actions;
export default adminSlice.reducer;
