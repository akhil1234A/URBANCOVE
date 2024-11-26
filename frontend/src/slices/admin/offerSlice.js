import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchOffers,
  fetchOfferById,
  createOffer,
  editOffer,
  softDeleteOffer,
} from '../../services/admin/offerService';


export const getOffers = createAsyncThunk(
  'offers/getOffers',
  async (isActive = true, { rejectWithValue }) => {
    try {
      return await fetchOffers(isActive);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch offers');
    }
  }
);

export const getOfferById = createAsyncThunk(
  'offers/getOfferById',
  async (offerId, { rejectWithValue }) => {
    try {
      return await fetchOfferById(offerId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch offer details');
    }
  }
);

export const addOffer = createAsyncThunk(
  'offers/addOffer',
  async (offerData, { rejectWithValue }) => {
    try {
      return await createOffer(offerData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create offer');
    }
  }
);

export const updateOffer = createAsyncThunk(
  'offers/updateOffer',
  async ({ offerId, offerData }, { rejectWithValue }) => {
    try {
      return await editOffer(offerId, offerData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update offer');
    }
  }
);

export const deactivateOffer = createAsyncThunk(
  'offers/deactivateOffer',
  async (offerId, { rejectWithValue }) => {
    try {
      return await softDeleteOffer(offerId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to deactivate offer');
    }
  }
);

// Slice
const offerSlice = createSlice({
  name: 'offers',
  initialState: {
    offers: [],
    offerDetails: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      
      .addCase(getOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.offers = action.payload.offers;
      })
      .addCase(getOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      
      .addCase(getOfferById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOfferById.fulfilled, (state, action) => {
        state.loading = false;
        state.offerDetails = action.payload.offer;
        console.log(action.payload.offer)
      })
      .addCase(getOfferById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      
      .addCase(addOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.offers.push(action.payload.offer);
      })
      .addCase(addOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      
      .addCase(updateOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOffer.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.offers.findIndex((offer) => offer._id === action.payload.offer._id);
        if (index !== -1) {
          state.offers[index] = action.payload.offer;
        }
      })
      .addCase(updateOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      
      .addCase(deactivateOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deactivateOffer.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.offers.findIndex((offer) => offer._id === action.payload.offer._id);
        if (index !== -1) {
          state.offers[index] = action.payload.offer; 
        }
      })      
      .addCase(deactivateOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default offerSlice.reducer;
