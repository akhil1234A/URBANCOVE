import { Navigate } from 'react-router-dom';


const UserProtectedRoute = ({ element }) => {
  const isAuthenticated = localStorage.getItem('token'); 
  

  return isAuthenticated ? element : <Navigate to="/login" />;
};

export default UserProtectedRoute;
