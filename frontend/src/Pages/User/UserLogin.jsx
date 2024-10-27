import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';

const UserLogin = () => {
  const [currentState, setCurrentState] = useState('Login');
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const onInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const endpoint = currentState === 'Sign Up' ? '/api/user/register' : '/api/user/login';
      const response = await axios.post(`http://localhost:3000${endpoint}`, formData);

      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        toast.success(`${currentState} successful!`);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'An error occurred');
    }
  };

  const handleGoogleLoginSuccess = async (googleResponse) => {
    try {
      const response = await axios.post('http://localhost:3000/api/user/google-login', {
        tokenId: googleResponse.credential,
      });
      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        toast.success('Google Sign-In successful!');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Google Sign-In failed');
    }
  };

  useEffect(() => {
    if (token) {
      window.location.href = '/';
    }
  }, [token]);

  return (
    <GoogleOAuthProvider clientId="94439078697-pech7et4l2i00f0k3lfcs8c2tqmbjh5r.apps.googleusercontent.com">
      <form onSubmit={onSubmitHandler} className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
        <div className="inline-flex items-center gap-2 mb-2 mt-10">
          <p className="prata-regular text-3xl">{currentState}</p>
          <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
        </div>

        {currentState === 'Sign Up' && (
          <input
            name="name"
            onChange={onInputChange}
            value={formData.name}
            type="text"
            className="w-full px-3 py-2 border border-gray-800"
            placeholder="Name"
            required
          />
        )}
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
       <div className="w-full flex justify-between text-sm mt-[-8px]">
          <Link to="/forgot-password" className="cursor-pointer hover:underline">
            Forgot your password?
          </Link>
          {currentState === 'Login' ? (
            <p onClick={() => setCurrentState('Sign Up')} className="cursor-pointer hover:underline">
              Create account
            </p>
          ) : (
            <p onClick={() => setCurrentState('Login')} className="cursor-pointer hover:underline">
              Login Here
            </p>
          )}
        </div>

        <div className="flex items-center w-full my-4">
          <hr className="flex-grow border-t border-gray-400" />
          <span className="mx-4 text-gray-600">OR</span>
          <hr className="flex-grow border-t border-gray-400" />
        </div>

        <div className="mt-4">
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={() => toast.error('Google Sign-In failed')}
            useOneTap
          />
        </div>
      </form>
      
    </GoogleOAuthProvider>
  );
};

export default UserLogin;
