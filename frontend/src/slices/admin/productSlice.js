import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import {fetchProducts, fetchAdminProducts, updateProductStatusService, addProductService, editProductService }from '../../services/admin/productService'

export const fetchProductsForUser = createAsyncThunk('products/fetchProducts', async ({page = 1, limit = 100, search, inStock, min, max, sort, categoryNames, subCategoryNames}) => {
  return await fetchProducts(page,limit,search, inStock, min, max, sort, categoryNames, subCategoryNames);
});

export const fetchProductsForAdmin = createAsyncThunk(
  'products/fetchAdminProducts',
  async ({ token, page = 1, limit = 10 }) => {
    return await fetchAdminProducts(token, page, limit);
  }
);

export const updateProductStatus = createAsyncThunk( 'products/updateProductStatus', async ({ productId, isActive, token }) => {
    const updatedProduct = await updateProductStatusService(productId, isActive, token);
    return { productId, isActive: updatedProduct.isActive };
  }
);

export const addProduct = createAsyncThunk( 
  'products/addProduct',
  async ({ productData, token }, { rejectWithValue }) => {
    try {
      return await addProductService(productData, token);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const editProduct = createAsyncThunk(
  'products/editProduct',
  async ({ productId, productData, token }, { rejectWithValue }) => {
    try {
      return await editProductService(productId, productData, token);
    } catch (error) {
      const message =
        error?.response?.data?.message || 
        error?.message ||                 
        "Something went wrong. Please try again.";

      return rejectWithValue(message);
    }
  }
);



const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    search: '',
    filters: {
      categories: [],
      subCategories: [],
    },
    loading: false,
    error: null,
  },
  reducers: { 
    setCurrentPage: (state, action) => {
    state.currentPage = action.payload;
  },
   setSearch: (state, action) => {
    state.search = action.payload;
  },
  setSort: (state, action) => {
    state.sort = action.payload;
  },
  setFilters: (state, action) => {
    state.filters = { ...state.filters, ...action.payload };
  },
},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsForUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductsForUser.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.totalItems = action.payload.totalItems;
      })
      .addCase(fetchProductsForUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchProductsForAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductsForAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.totalItems = action.payload.totalItems;
      })
      .addCase(fetchProductsForAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      builder
      .addCase(updateProductStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProductStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { productId, isActive } = action.payload;
        const product = state.items.find((item) => item._id === productId);
        if (product) product.isActive = isActive;
      })
      .addCase(updateProductStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(addProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    
      .addCase(editProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProduct = action.payload;
        const index = state.items.findIndex((item) => item._id === updatedProduct._id);
        if (index !== -1) state.items[index] = updatedProduct;
      })
      .addCase(editProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

const selectProductItems = state => state.products.items;
const selectProductFilters = state => state.products.filters;
const selectProductSort = state => state.products.sort;

export const selectProducts = createSelector(
  [selectProductItems, selectProductFilters, selectProductSort],
  (items, filters, sort) => {
    if (!filters || Object.keys(filters).length === 0) {
      // If no filters are set, return items as is (useful for admin)
      return items;
    }

    let filteredProducts = items;

    // Apply category filter
    if (filters.categories.length > 0) {
      filteredProducts = filteredProducts.filter(product => 
        filters.categories.includes(product.category.category)
      );
    }

    // Apply subcategory filter
    if (filters.subCategories.length > 0) {
      filteredProducts = filteredProducts.filter(product => 
        filters.subCategories.includes(product.subCategory.subCategory)
      );
    }
    return filteredProducts;
  }
);


export const selectLoading = (state) => state.products.loading;


export const selectProductById = (state, productID) =>
  state.products.items.find((product) => product._id === productID);


export const {setCurrentPage, setSearch, setFilters} = productsSlice.actions;
export default productsSlice.reducer;
