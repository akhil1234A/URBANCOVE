import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import adminReducer from '../slices/admin/adminSlice';
import userReducer from '../slices/admin/userSlice';
import productReducer from '../slices/admin/productSlice'
import authReducer from '../slices/user/authSlice'
import categoriesReucer from '../slices/admin/categorySlice'

const persistConfig = {
  key: 'root', 
  storage,
  whitelist: ['admin'], 
};

const persistedAdminReducer = persistReducer(persistConfig, adminReducer);

export const store = configureStore({
  reducer: {
    admin: persistedAdminReducer,
    users: userReducer, 
    products: productReducer,
    auth: authReducer,
    categories: categoriesReucer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
