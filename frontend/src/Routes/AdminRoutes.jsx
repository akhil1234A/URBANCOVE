
import { Route, Routes } from 'react-router-dom';


// components
import Navbar from '../components/Admin/Navbar';
import Sidebar from '../components/Admin/Sidebar';

// pages
import AdminDashboard from '../Pages/Admin/AdminDashboard';
import Users from '../Pages/Admin/Users';
import Categories from '../Pages/Admin/Categories';
import SubCategory from '../Pages/Admin/SubCategory';
import AddProduct from '../Pages/Admin/AddProduct';
import ViewProducts from '../Pages/Admin/ViewProducts';
import EditProduct from '../Pages/Admin/EditProduct';
import Orders from '../Pages/Admin/Orders'
import CouponManagement from '../Pages/Admin/CouponManagement';
import OfferManagement from '../Pages/Admin/OfferManagement'
import CreateOfferPage from '../Pages/Admin/CreateOfferPage';
import EditOfferPage from '../Pages/Admin/EditOfferPage';
import CreateCoupon from '../Pages/Admin/CreateCoupon';
import EditCoupon from '../Pages/Admin/EditCoupon';
import SalesReport from '../Pages/Admin/SalesReport'

// import Test from './Test';
// import Product from './Product';

const AdminRoutes = () => {

 

  return (
    <div className="bg-gray-50 min-h-screen">

      <Navbar />
      <div className="flex">

        <Sidebar />
        

        <div
          className="flex-grow p-6 text-gray-600 text-base"
          style={{
            marginLeft: '250px',  
            paddingTop: '100px',  
          }}
        >
          <Routes>
            <Route path="/*" element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="categories" element={<Categories />} />
            <Route path="subcategories" element={<SubCategory />} />
            <Route path="products/add" element={<AddProduct />} />
            <Route path="products/view" element={<ViewProducts />} />
            <Route path='products/:id/edit' element={<EditProduct />} />
            <Route path='orders' element={<Orders />} />
            <Route path='offers' element={<OfferManagement />} />
            <Route path="offers/create-offer" element={<CreateOfferPage />} />
            <Route path="offers/edit-offer/:id" element={<EditOfferPage />} />
            <Route path='coupons' element={<CouponManagement />} />
            <Route path='coupons/create' element={<CreateCoupon/>} />
            <Route path='coupons/edit/:id' element={<EditCoupon/>} />
            <Route path='sales-report' element={<SalesReport/>} />
            {/* <Route path='test' element={<Test/>} />            <Route path='/test/admin/product/:id' element={<Product/>} /> */}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminRoutes;
