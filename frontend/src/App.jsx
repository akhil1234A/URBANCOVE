import React, {useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { logoutAdmin, adminLogin} from './slices/admin/adminSlice';
import { fetchProducts, selectProducts} from './slices/admin/productSlice';



// Admin
import AdminLogin from './Pages/Admin/Login';
import AdminRoutes from './Routes/AdminRoutes';
import ProtectedRoute from './Routes/ProtectedRoutes';

import UserLayout from './Routes/UserLayout'

const App = () => {

  const dispatch = useDispatch();
  const products = useSelector(selectProducts);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    // console.log(token);

    if (!token) {
      dispatch(logoutAdmin());
    } 

    dispatch(fetchProducts());
  }, [dispatch]);



  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <Router>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <AdminRoutes />
            </ProtectedRoute>
            }
/>

          
          {/* User Routes */}
          <Route path="/*" element={<UserLayout products={products}/>} />
        </Routes>
      </Router>
    </div>
  );
};


export default App;
