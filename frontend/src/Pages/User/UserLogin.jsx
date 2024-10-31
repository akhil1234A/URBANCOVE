import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { login, signUp } from '../../slices/user/authSlice';
import axios from 'axios';

const UserLogin = () => {
  const [currentState, setCurrentState] = useState('Login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token); // Get token from Redux state

  const onInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      let response;
      if (currentState === 'Sign Up') {
        response = await dispatch(signUp(formData)).unwrap(); // Dispatch signUp action
        if (response.success) {
          navigate('/verify-otp', { state: { email: formData.email } });
          toast.success('Sign-Up successful! Please verify your email with the OTP sent.');
        } else {
          toast.error(response.message);
        }
      } else {
        response = await dispatch(login(formData)).unwrap(); // Dispatch login action
        if (response.success) {
          localStorage.setItem('token', response.token);
          toast.success('Login successful!');
          navigate('/'); // Redirect to home page
        } else {
          toast.error(response.message);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'An error occurred');
    }
  };

  const handleGoogleLoginSuccess = async (googleResponse) => {
    try {
      const response = await axios.post('http://localhost:3000/user/google-login', {
        tokenId: googleResponse.credential,
      });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        dispatch(login(response.data)); // Optionally dispatch login action for Google
        toast.success('Google Sign-In successful!');
        navigate('/'); // Redirect to home page
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
      navigate('/'); // Navigate to home if user is logged in
    }
  }, [token, navigate]);

  return (
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
          <p onClick={() => { setCurrentState('Sign Up'); setFormData({ name: '', email: '', password: '' }); }} className="cursor-pointer hover:underline">
            Create account
          </p>
        ) : (
          <p onClick={() => { setCurrentState('Login'); setFormData({ name: '', email: '', password: '' }); }} className="cursor-pointer hover:underline">
            Login Here
          </p>
        )}
      </div>

      <button className='bg-black text-white font-light px-8 py-2 mt-4'>{currentState === 'Login' ? 'Sign In' : 'Sign Up'}</button>

      <div className="flex items-center w-full my-4">
        <hr className="flex-grow border-t border-gray-400" />
        <span className="mx-4 text-gray-600">OR</span>
        <hr className="flex-grow border-t border-gray-400" />
      </div>

      {/* <div className="mt-4">
        <GoogleOAuthProvider clientId="94439078697-pech7et4l2i00f0k3lfcs8c2tqmbjh5r.apps.googleusercontent.com">
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={() => toast.error('Google Sign-In failed')}
            useOneTap
          />
        </GoogleOAuthProvider>
      </div> */}
    </form>
  );
};

export default UserLogin;
