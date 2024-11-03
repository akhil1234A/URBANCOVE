import React, { useState } from 'react';
import { useNavigate, Link} from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { signUp, loginWithGoogle} from '../../slices/user/authSlice';
import { GoogleLogin } from '@react-oauth/google';

const UserSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const response = await dispatch(signUp(formData)).unwrap();
      
      // Check if response contains the necessary success flag.
      if (response.success) {
        toast.success('Sign-Up successful! Please verify your email.');
        
        // Navigating to OTP verification with email in state
        navigate('/otp-verify', { state: { email: formData.email } });
      } else {
        // Displaying backend error message if available
        toast.error(response.message || 'Sign-up failed. Please try again.');
      }
    } catch (error) {
      // Capturing other errors not handled by Redux or backend response
      toast.error(error.message || 'An error occurred during sign-up.');
    }
  };

  const handleGoogleLoginSuccess = async (googleResponse) => {
    try {
      // Extract the credential token from the response
      const credential = googleResponse.credential;
      
      // Dispatch the loginWithGoogle action
      const response = await dispatch(loginWithGoogle(credential)).unwrap();
      if (response.success) {
        toast.success('Google login successful!');
        navigate('/');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.message || 'Google login failed');
    }
  };
  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">Sign Up</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      <input
        name="name"
        onChange={onInputChange}
        value={formData.name}
        type="text"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Name"
        required
      />
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
          <p onClick={() => {navigate('/login')}} className="cursor-pointer hover:underline">
            Login Here
          </p>
      </div>

      <button className="bg-black text-white font-light px-8 py-2 mt-4">Sign Up</button>

      <div className="flex items-center w-full my-4">
        <hr className="flex-grow border-t border-gray-400" />
        <span className="mx-4 text-gray-600">OR</span>
        <hr className="flex-grow border-t border-gray-400" />
      </div>

      <div className="mt-4">
        {/* Uncomment when Google Auth is ready */}
        <GoogleLogin 
          onSuccess={handleGoogleLoginSuccess}
          onError={() => toast.error('Google Sign-In failed')}
        />
      </div>

    </form>
  );
};

export default UserSignup;
