import React, {useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { logoutAdmin, adminLogin} from './slices/admin/adminSlice';
import { fetchProducts, selectProducts} from './slices/admin/productSlice';

// User Pages
import UserLogin from './Pages/User/UserLogin';
import Home from './Pages/User/Home';
import Collection from './Pages/User/Collection';
import Product from './Pages/User/Product';
import ForgotPassword from './Pages/User/ForgotPassword';
import OtpVerification from './Pages/User/OtpVerification';

// User Components
import Navbar from './Components/User/Navbar'; 
import Footer from './Components/User/Footer'; 
import SearchBar from './Components/User/SearchBar';

// Admin
import AdminLogin from './Pages/Admin/Login';
import AdminRoutes from './Routes/AdminRoutes';
import ProtectedRoute from './Routes/ProtectedRoutes';

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

// Separate layout for User routes
const UserLayout = ({ products }) => {
  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <Navbar />
      <SearchBar />
      <Routes>
        <Route path="/" element={<Home products={products}/>} />
        <Route path="/collection" element={<Collection products={products}/>} />
        <Route path="/product/:productID" element={<Product />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp-verify" element={<OtpVerification />} />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
