import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/User/Navbar';
import Footer from '../components/User/Footer';
import Home from '../Pages/User/Home';
import Collection from '../Pages/User/Collection';
import Product from '../Pages/User/Product';
import UserLogin from '../Pages/User/UserLogin';
import ForgotPassword from '../Pages/User/ForgotPassword';
import OtpVerification from '../Pages/User/OtpVerification';
import UserSignup from '../Pages/User/UserSignup';
import { GoogleOAuthProvider } from '@react-oauth/google';
import PlaceOrder from '../Pages/User/PlaceOrder';
import UserAccount from '../Pages/User/UserAccount';
import ProfileDetails from '../components/User/ProfileDetails';
import AddressManagement from '../components/User/AddressManagement';
import OrderHistory from '../components/User/OrderHistory';
import ViewOrder from '../components/User/ViewOrder';
import Cart from '../Pages/User/Cart';
import OrderSuccess from '../Pages/User/OrderSuccess';
import UserProtectedRoutes from './UserProtectedRoutes';
import Wishlist from '../Pages/User/Wishlist';
import Wallet from '../Pages/User/Wallet';
import ChangePassword from '../Pages/User/ChangePassword';
import NotFound from '../Pages/NotFound';
import About from '../Pages/User/About';
import Contact from '../Pages/User/Contact';
import { userAxios } from '../utils/api';
import { ClipLoader } from 'react-spinners';

const UserLayout = () => {
  const [latestProducts, setLatestProducts] = useState([]);
  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [latestResponse, bestSellersResponse] = await Promise.all([
          userAxios.get('/products/latest'),
          userAxios.get('/products/best-sellers'),
        ]);

        setLatestProducts(latestResponse.data.products);
        setBestSellerProducts(bestSellersResponse.data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={'#36D7B7'} loading={loading} />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home latest={latestProducts} best={bestSellerProducts} />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/product/:productID" element={<Product />} />
        <Route path="/account" element={<UserProtectedRoutes element={<UserAccount />} />}>
          <Route index element={<ProfileDetails />} />
          <Route path="profile" element={<ProfileDetails />} />
          <Route path="addresses" element={<AddressManagement />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="orders/:orderId" element={<ViewOrder />} />
        </Route>
        <Route path="/cart" element={<UserProtectedRoutes element={<Cart />} />} />
        <Route path="/checkout" element={<UserProtectedRoutes element={<PlaceOrder />} />} />
        <Route path="/success" element={<UserProtectedRoutes element={<OrderSuccess />} />} />
        <Route path="/wishlist" element={<UserProtectedRoutes element={<Wishlist />} />} />
        <Route path="/wallet" element={<UserProtectedRoutes element={<Wallet />} />} />
        <Route
          path="/login"
          element={
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_ID}>
              <UserLogin />
            </GoogleOAuthProvider>
          }
        />
        <Route
          path="/signup"
          element={
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_ID}>
              <UserSignup />
            </GoogleOAuthProvider>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp-verify" element={<OtpVerification />} />
        <Route path="/reset-password/:token" element={<ChangePassword />} />
        <Route path="/*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
};

export default UserLayout;