import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderService from '../../services/admin/orderService';

export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      return await orderService.placeOrder(orderData);
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async ({ orderId, cancellationReason }, { rejectWithValue }) => {
    try {
      return await orderService.cancelOrder({ orderId, cancellationReason });
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const viewUserOrders = createAsyncThunk(
  'orders/viewUserOrders',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      return await orderService.viewUserOrders(page, limit);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const viewOrder = createAsyncThunk(
  'orders/viewOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      return await orderService.viewOrder(orderId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const viewAllOrders = createAsyncThunk(
  'orders/viewAllOrders',
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      return await orderService.viewAllOrders(page, limit);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      return await orderService.updateOrderStatus(orderId, status);
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const initialState = {
  orders: [],
  order: null,
  loading: false,
  error: null,
  successMessage: null,
  pagination: {
    page: 1,
    totalPages: 1,
    totalOrders: 0,
  },
};

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
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload.order);
        state.successMessage = 'Order placed successfully';
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        const orderIndex = state.orders.findIndex(
          (order) => order._id === action.payload.order._id
        );
        if (orderIndex !== -1) state.orders[orderIndex] = action.payload.order;
        state.order = action.payload.order;
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
        state.orders = action.payload.orders;
        state.pagination = {
          page: action.payload.page,
          totalPages: action.payload.totalPages,
          totalOrders: action.payload.totalOrders,
        };
      })
      .addCase(viewUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(viewOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(viewOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload.order;
      })
      .addCase(viewOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(viewAllOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(viewAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = {
          page: action.payload.page,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(viewAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const orderIndex = state.orders.findIndex(
          (order) => order._id === action.payload.order._id
        );
        if (orderIndex !== -1) state.orders[orderIndex] = action.payload.order;
        state.order = action.payload.order;
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