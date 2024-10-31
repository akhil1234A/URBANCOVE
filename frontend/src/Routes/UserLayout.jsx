import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/User/Navbar';
import Footer from '../Components/User/Footer';
import SearchBar from '../Components/User/SearchBar';
import Home from '../Pages/User/Home';
import Collection from '../Pages/User/Collection';
import Product from '../Pages/User/Product';
import UserLogin from '../Pages/User/UserLogin';
import ForgotPassword from '../Pages/User/ForgotPassword';
import OtpVerification from '../Pages/User/OtpVerification';
import UserSignup from '../Pages/User/UserSignUp';

const UserLayout = ({ products }) => {
  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <Navbar />
      <SearchBar />
      <Routes>
        <Route path="/" element={<Home products={products} />} />
        <Route path="/collection" element={<Collection products={products} />} />
        <Route path="/product/:productID" element={<Product />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/signup" element={<UserSignup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp-verify" element={<OtpVerification />} />
      </Routes>
      <Footer />
    </div>
  );
};

export default UserLayout;
