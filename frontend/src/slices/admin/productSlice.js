import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {fetchProducts, fetchAdminProducts, updateProductStatusService, addProductService, editProductService }from '../../services/admin/productService'

export const fetchProductsForUser = createAsyncThunk('products/fetchProducts', async () => {
  return await fetchProducts();
});

export const fetchProductsForAdmin = createAsyncThunk('products/fetchAdminProducts', async (token) => {
  return await fetchAdminProducts(token)
});

// export const fetchProductsForAdmin = createAsyncThunk(
//   'products/fetchAdminProducts',
//   async ({ token, page = 1, limit = 10 }) => {
//     return await fetchAdminProducts(token, page, limit);
//   }
// );

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

// Edit Product thunk
export const editProduct = createAsyncThunk(
  'products/editProduct',
  async ({ productId, productData, token }, { rejectWithValue }) => {
    try {
      return await editProductService(productId, productData, token);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


const productsSlice = createSlice({
  name: 'products',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsForUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductsForUser.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
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
        state.items = action.payload;
        // state.items = action.payload.products; 
        // state.totalPages = action.payload.totalPages;
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

      // Edit Product
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

export const selectProducts = (state) => state.products.items;
export const selectLoading = (state) => state.products.loading;


export const selectProductById = (state, productID) =>
  state.products.items.find((product) => product._id === productID);

export default productsSlice.reducer;
