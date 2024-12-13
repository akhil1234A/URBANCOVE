import { useState , useEffect} from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/User/Navbar';
import Footer from '../components/User/Footer';
import SearchBar from '../Components/User/SearchBar';
import Home from '../Pages/User/Home';
import Collection from '../Pages/User/Collection';
import Product from '../Pages/User/Product';
import UserLogin from '../Pages/User/UserLogin';
import ForgotPassword from '../Pages/User/ForgotPassword';
import OtpVerification from '../Pages/User/OtpVerification';
import UserSignup from '../Pages/User/UserSignup';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsForUser, selectProducts } from '../slices/admin/productSlice';
import PlaceOrder from '../Pages/User/PlaceOrder';

import UserAccount from '../Pages/User/UserAccount';
import Cart from '../Pages/User/Cart';
import OrderSuccess from '../Pages/User/OrderSuccess';
import UserProtectedRoutes from './UserProtectedRoutes';
import Wishlist from '../Pages/User/Wishlist';
import Wallet from '../Pages/User/Wallet';
import ChangePassword from '../Pages/User/ChangePassword';
import NotFound from '../Pages/NotFound';
import About from '../Pages/User/About';
import Contact from '../Pages/User/Contact';

const UserLayout = () => {

  const [searchVisible, setSearchVisible] = useState(false);

  const dispatch = useDispatch();

  const products = useSelector(selectProducts);

  const search = useSelector((state) => state.products.search);

  useEffect(() => {
    dispatch(fetchProductsForUser(
      {page:1, limit:100, search}
    ));
  }, [dispatch,search]);


  const toggleSearchBar = () => {
    setSearchVisible((prev) => !prev);
  };

  return (
    <>
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <Navbar toggleSearchBar={toggleSearchBar}/>
      {searchVisible && <SearchBar toggleSearchBar={toggleSearchBar} />}
      <Routes>
      
        <Route path="/" element={<Home  products={products}/>} />
        <Route path="/*" element={<NotFound />} />
        <Route path="/collection" element={<Collection  />} />
        <Route path="/about" element={<About/>} />
        <Route path="/contact" element={<Contact/>} />
        <Route path="/product/:productID" element={<Product />} />

        <Route path="/account" element={<UserProtectedRoutes element={<UserAccount />} />} />
        <Route path="/cart" element={<UserProtectedRoutes element={<Cart />} />} />
        <Route path="/checkout" element={<UserProtectedRoutes element={<PlaceOrder />} />} />
        <Route path="/success" element={<UserProtectedRoutes element={<OrderSuccess />} />} />
        <Route path="/wishlist" element={<UserProtectedRoutes element={<Wishlist/>} />} /> 
        <Route path="/wallet" element={<UserProtectedRoutes element={<Wallet/>} />} /> 
        
        
        <Route path="/login" element={
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_ID}>
            <UserLogin />
          </GoogleOAuthProvider>
        } />
        <Route path="/signup" element={
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_ID}>
            <UserSignup />
          </GoogleOAuthProvider>
        } />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp-verify" element={<OtpVerification />} />
        <Route path="/reset-password/:token" element={<ChangePassword />} />
      </Routes>
      <Footer />
    </div>
    </>
    
  );
};

export default UserLayout;
