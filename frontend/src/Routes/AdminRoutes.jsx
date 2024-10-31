import React, { useState, useEffect } from 'react';
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

  const [categories, setCategories] = useState([])

  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem('adminToken');
      // console.log('Admin Token:', token); 
      try {
        const response = await axios.get('http://localhost:3000/admin/categories', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Fetched Categories:', response.data); 
        setCategories(response.data); 
      } catch (error) {
        console.error("Error fetching categories:", error);
   
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          console.error("Response headers:", error.response.headers);
        } else {
          console.error("Error message:", error.message);
        }
      }
    };
    

    fetchCategories();
  }, []);

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
            <Route path="subcategories" element={<SubCategory categories={categories}/>} />
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
