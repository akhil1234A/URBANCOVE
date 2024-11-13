import React, { useState , useEffect} from 'react';
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
import UserSignup from '../Pages/User/UserSignUp';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsForUser, selectProducts } from '../slices/admin/productSlice';
import PlaceOrder from '../Pages/User/PlaceOrder';

import UserAccount from '../Pages/User/UserAccount';
import Cart from '../Pages/User/Cart';
import OrderSuccess from '../Pages/User/OrderSuccess';

const UserLayout = () => {

  const [searchVisible, setSearchVisible] = useState(false);

  const dispatch = useDispatch();

  const products = useSelector(selectProducts);

  

  useEffect(() => {
    dispatch(fetchProductsForUser(
      {page:1, limit:100}
    ));
  }, [dispatch]);


  const toggleSearchBar = () => {
    setSearchVisible((prev) => !prev);
  };

  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <Navbar toggleSearchBar={toggleSearchBar}/>
      {searchVisible && <SearchBar toggleSearchBar={toggleSearchBar} />}
      <Routes>
        <Route path="/" element={<Home  products={products}/>} />
        <Route path="/collection" element={<Collection  />} />
        <Route path="/product/:productID" element={<Product />} />
        <Route path="/account" element={<UserAccount />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<PlaceOrder />} />
        <Route path="/success" element={<OrderSuccess />} />
        
        {/* Wrapping only login and signup in GoogleOAuthProvider */}
        <Route path="/login" element={
          <GoogleOAuthProvider clientId="951211049648-sbiee4qcea4nknn77kaeu33bkcik31vm.apps.googleusercontent.com">
            <UserLogin />
          </GoogleOAuthProvider>
        } />
        <Route path="/signup" element={
          <GoogleOAuthProvider clientId="951211049648-sbiee4qcea4nknn77kaeu33bkcik31vm.apps.googleusercontent.com">
            <UserSignup />
          </GoogleOAuthProvider>
        } />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp-verify" element={<OtpVerification />} />
      </Routes>
      <Footer />
    </div>
  );
};

export default UserLayout;
