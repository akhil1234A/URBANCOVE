import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  createCoupon,
  editCoupon,
  deleteCoupon,
  getAllCoupons,
} from '../../services/admin/couponService';




export const fetchCoupons = createAsyncThunk('coupons/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const data = await getAllCoupons();
    return data;
  } catch (error) {
    return rejectWithValue(error.response.data.message || 'Failed to fetch coupons');
  }
});


export const addCoupon = createAsyncThunk('coupons/add', async (couponData, { rejectWithValue }) => {
  try {
    const data = await createCoupon(couponData);
    return data;
  } catch (error) {
    return rejectWithValue(error.response.data.message || 'Failed to create coupon');
  }
});


export const updateCoupon = createAsyncThunk(
  'coupons/update',
  async ({ couponId, updatedData }, { rejectWithValue }) => {
    try {
      const data = await editCoupon(couponId, updatedData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to update coupon');
    }
  }
);


export const deactivateCoupon = createAsyncThunk(
  'coupons/delete',
  async (couponId, { rejectWithValue }) => {
    try {
      const data = await deleteCoupon(couponId);
      return { couponId, ...data };
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to delete coupon');
    }
  }
);


const couponSlice = createSlice({
  name: 'coupons',
  initialState: {
    coupons: [],
    isLoading: false,
    error: null,
    selectedCoupon: null,
  },
  reducers: {
    fetchCouponById: (state, action) => {
      const couponId = action.payload;
      const coupon = state.coupons.find((coupon) => coupon._id === couponId);
      if (coupon) {
        state.selectedCoupon = coupon; // Store the coupon in selectedCoupon
      } else {
        state.error = `Coupon with ID ${couponId} not found`;
      }
    },
    clearSelectedCoupon: (state) => {
      state.selectedCoupon = null; 
    },
  },
  extraReducers: (builder) => {
    builder
     
      .addCase(fetchCoupons.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.coupons = action.payload;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

     
      .addCase(addCoupon.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addCoupon.fulfilled, (state, action) => {
        state.isLoading = false;
        state.coupons.push(action.payload);
      })
      .addCase(addCoupon.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      
      .addCase(updateCoupon.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.coupons.findIndex((coupon) => coupon._id === action.payload._id);
        if (index >= 0) {
          state.coupons[index] = action.payload;
        }
      })
      .addCase(updateCoupon.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      
      .addCase(deactivateCoupon.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deactivateCoupon.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedCoupon = action.payload.coupon
        const index = state.coupons.findIndex((coupon) => coupon._id === updatedCoupon._id);
        if (index >= 0) {
          state.coupons[index] = updatedCoupon;
        }
      })
      .addCase(deactivateCoupon.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { fetchCouponById, clearSelectedCoupon } = couponSlice.actions;
export default couponSlice.reducer;
