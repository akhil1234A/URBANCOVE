import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as addressService from '../../services/user/addressService'; 


export const fetchAddresses = createAsyncThunk(
  'addresses/fetchAddresses',
  async (token, { rejectWithValue }) => {
    try {
      const response = await addressService.getAddresses(token);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const addNewAddress = createAsyncThunk(
  'addresses/addNewAddress',
  async ({ token, addressData }, { rejectWithValue }) => {
    try {
      const response = await addressService.addAddress(token, addressData);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateExistingAddress = createAsyncThunk(
  'addresses/updateExistingAddress',
  async ({ token, addressId, addressData }, { rejectWithValue }) => {
    try {
      const response = await addressService.updateAddress(token, addressId, addressData);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteUserAddress = createAsyncThunk(
  'addresses/deleteUserAddress',
  async ({ token, addressId }, { rejectWithValue }) => {
    try {
      const response = await addressService.deleteAddress(token, addressId);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);


const addressSlice = createSlice({
  name: 'address',
  initialState: {
    addresses: [], 
    loading: false,
    error: null,
  },
  reducers: {
    setAddresses: (state, action) => {
      state.addresses = action.payload;
    },
    addAddress: (state, action) => {
      state.addresses.push(action.payload);
    },
    updateAddress: (state, action) => {
      const updatedAddress = action.payload;
      const index = state.addresses.findIndex((address) => address._id === updatedAddress._id);
      if (index !== -1) {
        state.addresses[index] = updatedAddress;
      }
    },
    setDefault: (state, action) => {
      state.addresses = state.addresses.map((address) =>
        address._id === action.payload._id
          ? { ...address, isDefault: true }
          : { ...address, isDefault: false }
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload 
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error fetching addresses';
      })
      .addCase(addNewAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses.push(action.payload); 
      })
      .addCase(addNewAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Error adding address';
      })
      .addCase(updateExistingAddress.fulfilled, (state, action) => {
        const updatedAddress = action.payload;
        const index = state.addresses.findIndex((address) => address._id === updatedAddress._id);
        if (index !== -1) {
          state.addresses[index] = updatedAddress;
        }
      })
      .addCase(updateExistingAddress.rejected, (state, action) => {
        state.error = action.payload || 'Error updating address';
      })
      .addCase(deleteUserAddress.fulfilled, (state, action) => {
        const deletedAddressId = action.payload._id;
        state.addresses = state.addresses.filter(address => address._id !== deletedAddressId);
      })
      .addCase(deleteUserAddress.rejected, (state, action) => {
        state.error = action.payload || 'Error deleting address';
      });
  },
});

export const { setAddresses, addAddress, updateAddress, setDefault } = addressSlice.actions;
export default addressSlice.reducer;
