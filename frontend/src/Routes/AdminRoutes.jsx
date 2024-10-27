import React from 'react';
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

const AdminRoutes = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Fixed Navbar */}
      <Navbar />
      <div className="flex">
        {/* Fixed Sidebar */}
        <Sidebar />
        
        {/* Main content area */}
        <div
          className="flex-grow p-6 text-gray-600 text-base"
          style={{
            marginLeft: '250px',  // Adjust this based on your Sidebar width
            paddingTop: '100px',    // Adjust this based on your Navbar height
          }}
        >
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="categories" element={<Categories />} />
            <Route path="subcategories" element={<SubCategory />} />
            <Route path="products/add" element={<AddProduct />} />
            <Route path="products/view" element={<ViewProducts />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminRoutes;
