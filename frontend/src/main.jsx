import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; 
import './index.css';
import { Provider } from 'react-redux';
import { store, persistor } from './store/store'; // Adjust the import path to your store file
import { PersistGate } from 'redux-persist/integration/react';

const rootElement = document.getElementById('root');

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>
);
