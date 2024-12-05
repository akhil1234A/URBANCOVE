import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUsers, toggleBlockUser } from '../../services/admin/userService';
import { toast } from 'react-toastify';


export const getUsers = createAsyncThunk(
  'users/getUsers',
  async ({ page = 1, limit = 5 }, { rejectWithValue }) => {
    try {
      const response = await fetchUsers(page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const toggleUserBlockStatus = createAsyncThunk(
  'users/toggleBlockStatus',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await toggleBlockUser(userId);
      toast.success(response.message);
      return { userId, isActive: response.isActive };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
   
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
   
      .addCase(toggleUserBlockStatus.fulfilled, (state, action) => {
        const user = state.users.find((u) => u._id === action.payload.userId);
        if (user) user.isActive = action.payload.isActive;
      })
      .addCase(toggleUserBlockStatus.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;
