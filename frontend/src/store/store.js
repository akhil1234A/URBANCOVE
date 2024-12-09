import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import adminReducer from '../slices/admin/adminSlice';
import userReducer from '../slices/admin/userSlice';
import productReducer from '../slices/admin/productSlice';
import authReducer from '../slices/user/authSlice';
import categoriesReducer from '../slices/admin/categorySlice';
import subCategoriesReducer from '../slices/admin/subCategorySlice';
import addressReducer from '../slices/user/addressSlice';
import cartReducer from '../slices/user/cartSlice';
import orderReducer from '../slices/admin/orderSlice';
import offerReducer from '../slices/admin/offerSlice';
import couponReducer from '../slices/admin/couponSlice';
import wishlistReducer from '../slices/user/wishlistSlice';

const persistConfig = {
  key: 'admin',
  storage,
  whitelist: ['admin'], // Only persist the admin reducer state
};

const persistedAdminReducer = persistReducer(persistConfig, adminReducer);

export const store = configureStore({
  reducer: {
    admin: persistedAdminReducer,
    users: userReducer,
    products: productReducer,
    auth: authReducer,
    categories: categoriesReducer,
    subCategories: subCategoriesReducer,
    address: addressReducer,
    cart: cartReducer,
    orders: orderReducer,
    offers: offerReducer,
    coupons: couponReducer,
    wishlist: wishlistReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
});

export const persistor = persistStore(store);
