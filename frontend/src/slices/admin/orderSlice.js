import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderService from '../../services/admin/orderService';

// Thunks for async actions
export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      return await orderService.placeOrder(orderData);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      return await orderService.cancelOrder(orderId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const viewUserOrders = createAsyncThunk(
  'orders/viewUserOrders',
  async (_, { rejectWithValue }) => {
    try {
      return await orderService.viewUserOrders();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


export const viewAllOrders = createAsyncThunk(
  'orders/viewAllOrders',
  async (_, { rejectWithValue }) => {
    try {
      return await orderService.viewAllOrders();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      return await orderService.updateOrderStatus(orderId, status);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial state
const initialState = {
  orders: [],
  order: null,
  loading: false,
  error: null,
  successMessage: null,
};

// Order slice
const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Place order
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
        state.successMessage = 'Order placed successfully';
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        const orderIndex = state.orders.findIndex(
          (order) => order._id === action.payload.order._id
        );
        if (orderIndex !== -1) state.orders[orderIndex] = action.payload.order;
        state.successMessage = 'Order canceled successfully';
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(viewUserOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(viewUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders; // Store the orders fetched from the service
      })
      .addCase(viewUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // View all orders
      .addCase(viewAllOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(viewAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
      })
      .addCase(viewAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const orderIndex = state.orders.findIndex(
          (order) => order._id === action.payload.order._id
        );
        if (orderIndex !== -1) state.orders[orderIndex] = action.payload.order;
        state.successMessage = 'Order status updated successfully';
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrderError, clearSuccessMessage } = orderSlice.actions;
export default orderSlice.reducer;
