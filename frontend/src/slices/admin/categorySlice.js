import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as categoryService from '../../services/admin/categoryService'


export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (token, { rejectWithValue }) => {
    try {
      const response = await categoryService.fetchCategories(token);
      return response; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


export const addCategory = createAsyncThunk(
  'categories/addCategory',
  async ({ token, category }, { rejectWithValue }) => {
    try {
      const response = await categoryService.addCategory(token, category);
      return response; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ token, categoryId, category }, { rejectWithValue }) => {
    try {
      const response = await categoryService.updateCategory(token, categoryId, category);
      return response; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const toggleCategoryStatus = createAsyncThunk(
  'categories/toggleCategoryStatus',
  async ({ token, categoryId, currentStatus }, { rejectWithValue }) => {
    try {
      const response = await categoryService.toggleCategoryStatus(token, categoryId, currentStatus);
      return response; 
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchSubCategoriesByCategory = createAsyncThunk(
  'subcategories/fetchByCategory',
  async ({ categoryId, token }) => {
    return await categoryService.fetchSubCategoriesByCategoryId(categoryId, token);
  }
);


const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {  
    categories: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null; 
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload; 
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; 
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload); 
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.error = action.payload; 
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(cat => cat._id === action.payload._id);
        if (index !== -1) {
          state.categories[index] = action.payload; 
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.error = action.payload; 
      })
      .addCase(toggleCategoryStatus.fulfilled, (state, action) => {
        const index = state.categories.findIndex(cat => cat._id === action.payload._id);
        if (index !== -1) {
          state.categories[index] = action.payload; 
        }
      })
      .addCase(toggleCategoryStatus.rejected, (state, action) => {
        state.error = action.payload; 
      })

      .addCase(fetchSubCategoriesByCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubCategoriesByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSubCategoriesByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default categoriesSlice.reducer;