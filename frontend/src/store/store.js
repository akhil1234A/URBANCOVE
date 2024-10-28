import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import adminReducer from '../slices/admin/adminSlice';
import userReducer from '../slices/admin/userSlice';

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
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
