import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { login } from '../../slices/user/authSlice';

const UserLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const response = await dispatch(login(formData)).unwrap();
      if (response.success) {
        toast.success('Login successful!');
        navigate('/');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    }
  };

  const handleGoogleLoginSuccess = async (googleResponse) => {
    // Google login handler here...
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">Login</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      <input
        name="email"
        onChange={onInputChange}
        value={formData.email}
        type="email"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Email"
        required
      />
      <input
        name="password"
        onChange={onInputChange}
        value={formData.password}
        type="password"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Password"
        required
      />

<     div className="w-full flex justify-between text-sm mt-[-8px]">
        <Link to="/forgot-password" className="cursor-pointer hover:underline">
          Forgot your password?
        </Link>
          <p onClick={() => {navigate('/signup')}} className="cursor-pointer hover:underline">
            Sign Up
          </p>
      </div>

      <button className="bg-black text-white font-light px-8 py-2 mt-4">Sign In</button>

      <div className="mt-4">
        {/* Uncomment when Google Auth is ready */}
        <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
          <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={() => toast.error('Google Sign-In failed')} />
        </GoogleOAuthProvider>
      </div>
    </form>
  );
};

export default UserLogin;
