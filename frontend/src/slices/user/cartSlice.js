import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartService from '../../services/user/cartService';

// Async Thunks for Cart Operations
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartService.addToCart(productId, quantity);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateCartItemQuantity',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      return await cartService.updateCartItemQuantity(productId, quantity);
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, { rejectWithValue }) => {
    try {
      return await cartService.removeFromCart(productId);
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const getUserCart = createAsyncThunk(
  'cart/getUserCart',
  async (_, { rejectWithValue }) => {
    try {
      return await cartService.getUserCart();
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cartItems: [],
    total:0,
    loading: false,
    error: null,
  },
  reducers: {
    setCartTotal: (state) => {
      const total = state.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      state.total = total;
    },
    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems.push(action.payload.cartItem); // Assuming `cartItem` is returned
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Cart Item Quantity
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.loading = false;
        const updatedItem = action.payload.cartItem;
        const index = state.cartItems.findIndex(item => item.productId === updatedItem.productId);
        if (index >= 0) {
          state.cartItems[index].quantity = updatedItem.quantity;
        }
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = state.cartItems.filter(item => item.productId !== action.meta.arg);
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get User Cart
      .addCase(getUserCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload.cartItems; // Assuming `cartItems` is returned
      })
      .addCase(getUserCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCartTotal, clearCartError } = cartSlice.actions;
export default cartSlice.reducer;
