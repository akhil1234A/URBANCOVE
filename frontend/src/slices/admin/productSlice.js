import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {fetchProducts, fetchAdminProducts, updateProductStatusService}from '../../services/admin/productService'

export const fetchProductsForUser = createAsyncThunk('products/fetchProducts', async () => {
  return await fetchProducts();
});

export const fetchProductsForAdmin = createAsyncThunk('products/fetchAdminProducts', async (token) => {
  return await fetchAdminProducts(token)
});

export const updateProductStatus = createAsyncThunk( 'products/updateProductStatus', async ({ productId, isActive, token }) => {
    const updatedProduct = await updateProductStatusService(productId, isActive, token);
    return { productId, isActive: updatedProduct.isActive };
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
      });
  },
});

export const selectProducts = (state) => state.products.items;
export const selectLoading = (state) => state.products.loading;


export const selectProductById = (state, productID) =>
  state.products.items.find((product) => product._id === productID);

export default productsSlice.reducer;
