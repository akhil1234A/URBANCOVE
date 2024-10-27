// store/store.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import adminReducer from '../slices/admin/adminSlice';

const persistConfig = {
  key: 'admin',
  storage,
  whitelist: ['token','isAuthenticated'], // Only persist the token field
};

const persistedReducer = persistReducer(persistConfig, adminReducer);

export const store = configureStore({
  reducer: { admin: persistedReducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
