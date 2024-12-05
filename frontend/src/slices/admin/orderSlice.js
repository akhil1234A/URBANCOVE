import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderService from '../../services/admin/orderService';


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
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await orderService.viewUserOrders(page, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);



export const viewAllOrders = createAsyncThunk(
  "orders/viewAllOrders",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      return await orderService.viewAllOrders(page, limit);
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


const initialState = {
  orders: [],
  order: null,
  loading: false,
  error: null,
  successMessage: null,
  pagination: {
    currentPage: 1,
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
        state.orders.push(action.payload);
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
            currentPage: action.payload.currentPage,
            totalPages: action.payload.totalPages,
            totalOrders: action.payload.totalOrders,
        };
    })    
      .addCase(viewUserOrders.rejected, (state, action) => {
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
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          totalOrders: action.payload.totalOrders,
        };      })
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
