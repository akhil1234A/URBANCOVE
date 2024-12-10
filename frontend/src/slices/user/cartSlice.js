import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartService from '../../services/user/cartService';


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
      
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems.push(action.payload.cartItem); 
        state.total += action.payload.cartItem.price * action.payload.cartItem.quantity; 
        state.total = state.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
     
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.loading = false;
        const updatedItem = action.payload.cartItem;
        const index = state.cartItems.findIndex(item => item.productId === updatedItem.productId);
        if (index >= 0) {
          const oldItem = state.cartItems[index];
          state.cartItems[index].quantity = updatedItem.quantity;

          state.total += (updatedItem.quantity - oldItem.quantity) * updatedItem.price;
          state.total = state.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        }
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        const removedItem = state.cartItems.find(item => item.productId === action.meta.arg);
        if (removedItem) {
          state.total -= removedItem.price * removedItem.quantity; // Update total
          state.cartItems = state.cartItems.filter(item => item.productId !== action.meta.arg);
        }
        state.total = state.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    
      .addCase(getUserCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload.cartItems; // Assuming `cartItems` is returned
        state.total = action.payload.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0); // Update total after fetching
        state.total = state.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      })
      .addCase(getUserCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCartTotal, clearCartError } = cartSlice.actions;
export default cartSlice.reducer;
