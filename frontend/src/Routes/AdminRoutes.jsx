import React from 'react';
import { Route, Routes } from 'react-router-dom';
import axios from 'axios';

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
            <Route path="/" element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="categories" element={<Categories />} />
            <Route path="subcategories" element={<SubCategory />} />
            <Route path="products/add" element={<AddProduct />} />
            <Route path="products/view" element={<ViewProducts />} />
            <Route path='products/:id/edit' element={<EditProduct />} />
            {/* <Route path='test' element={<Test/>} />
            <Route path='/test/admin/product/:id' element={<Product/>} /> */}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminRoutes;
