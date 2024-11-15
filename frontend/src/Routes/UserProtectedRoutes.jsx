import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const UserProtectedRoute = ({ element }) => {
  const isAuthenticated = localStorage.getItem('token'); // Checking if token exists in localStorage
  console.log(isAuthenticated);

  return isAuthenticated ? element : <Navigate to="/login" />;
};

export default UserProtectedRoute;
