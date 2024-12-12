// subcategorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchSubCategories,
  addSubCategory,
  updateSubCategory,
  toggleSubCategoryStatus,
} from '../../services/admin/subCategoryService';

export const fetchSubCategoriesThunk = createAsyncThunk(
  'subCategories/fetchAll',
  async (token, { rejectWithValue }) => {
    try {
      return await fetchSubCategories(token);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addSubCategoryThunk = createAsyncThunk(
  'subCategories/add',
  async ({ data, token }, { rejectWithValue }) => {
    try {
      return await addSubCategory(data, token);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateSubCategoryThunk = createAsyncThunk(
  'subCategories/update',
  async ({ id, data, token }, { rejectWithValue }) => {
    try {
      const result = await updateSubCategory(id, data, token);
      return result; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const toggleSubCategoryStatusThunk = createAsyncThunk(
  'subCategories/toggleStatus',
  async ({ id, isActive, token }, { rejectWithValue }) => {
    try {
      return await toggleSubCategoryStatus(id, isActive, token);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const subcategorySlice = createSlice({
  name: 'subCategories',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(fetchSubCategoriesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubCategoriesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchSubCategoriesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch subcategories';
      })
      
     
      .addCase(addSubCategoryThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(addSubCategoryThunk.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(addSubCategoryThunk.rejected, (state, action) => {
        state.error = action.payload || 'Failed to add subcategory';
      })
      
      
      .addCase(updateSubCategoryThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(updateSubCategoryThunk.fulfilled, (state, action) => {
        const index = state.list.findIndex(sub => sub._id === action.payload._id);
        if (index >= 0) state.list[index] = action.payload;
      })
      .addCase(updateSubCategoryThunk.rejected, (state, action) => {
        state.error = action.payload || 'Failed to update subcategory';
      })
      
      
      .addCase(toggleSubCategoryStatusThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleSubCategoryStatusThunk.fulfilled, (state, action) => {
        const updatedSubCategory = action.payload.updatedSubCategory;
        const index = state.list.findIndex(sub => sub._id === updatedSubCategory._id);
        
        if (index >= 0) {
          // Update the isActive status in the state
          state.list[index].isActive = updatedSubCategory.isActive;
        }
      })
      .addCase(toggleSubCategoryStatusThunk.rejected, (state, action) => {
        state.error = action.payload || 'Failed to toggle subcategory status';
      });
  },
});

export const { clearError } = subcategorySlice.actions;
export default subcategorySlice.reducer;
