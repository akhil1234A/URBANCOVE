import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/user/wishlist`;

const getAuthToken = () => {
  return localStorage.getItem('token');
};


// User: Fetch wishlist
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(BASE_URL, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      return response.data.products;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist');
    }
  }
);

// User: Add to wishlist
export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (productId, thunkAPI) => {
    try {
      const response = await axios.post(
        BASE_URL,
        { productId },
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        }
      );
      return response.data.message;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to add product to wishlist');
    }
  }
);

// User: Remove from wishlist
export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId, thunkAPI) => {
    try {
      await axios.delete(`${BASE_URL}/${productId}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      return productId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to remove product from wishlist');
    }
  }
);

// Slice
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearWishlistError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.productId._id !== action.payload);
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearWishlistError } = wishlistSlice.actions;
export default wishlistSlice.reducer;
