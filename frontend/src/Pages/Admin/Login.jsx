import { useState, useEffect} from 'react';
import {adminLogin} from '../../slices/admin/adminSlice'
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast} from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 


const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, error, token} = useSelector((state) => state.admin);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('adminToken', token);
      navigate('/admin/'); 
      toast.success("Login successful!");
    }
    if (error) {
      toast.error(error);
    }
  }, [isAuthenticated, error, navigate, token]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(adminLogin({ email, password })); 
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex bg-white shadow-lg rounded-lg overflow-hidden w-[1000px] h-[450px]">
        <div className="flex flex-col justify-center items-center p-8 w-1/2 bg-yellow-400">
          <div className="text-[48px] font-bold">
            <a href="/" className="font-permanent-marker flex">
              <span className="text-[#4E2525]">Urban</span>
              <span className="text-red-600">Cove</span>
            </a>
          </div>
          <p className="mt-4 text-lg text-gray-600 text-center">
            Find Your Perfect Fit. Log in to explore the latest casual styles.
          </p>
        </div>
        <div className="p-8 w-1/2">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                placeholder="Enter your email"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                placeholder="Enter your password"
              />
            </div>
            <button type="submit" className="w-full bg-yellow-400 text-gray-800 py-2 rounded-md hover:bg-yellow-300">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};


export default AdminLogin;
