import React, { useState } from 'react';
import { useNavigate, Link} from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { signUp, googleLogin} from '../../slices/user/authSlice';
import {FaGoogle} from 'react-icons/fa'


const UserSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

 

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value) return 'Name is required';
        if (value.length < 3) return 'Name must be at least 3 characters';
        break;
      case 'email':
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!value) return 'Email is required';
        if (!emailPattern.test(value)) return 'Invalid email format';
        break;
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        break;
      default:
        return '';
    }
  };

  const onInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const validateForm = () => {
    const { name, email, password } = formData;
    let isValid = true;

    // Validate each field and show error if invalid
    ['name', 'email', 'password'].forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        toast.error(error);
        isValid = false;
      }
    });
    return isValid;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
   

    if (!validateForm()) return;

    

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

  const handleGoogleSignIn = async () => {
    try {
      const response = await dispatch(googleLogin()).unwrap();
      if (response.success) {
        toast.success('Login successful!');
        navigate('/');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred during Google login');
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
        
      />
      <input
        name="email"
        onChange={onInputChange}
        value={formData.email}
        type="email"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Email"
        
      />
      <input
        name="password"
        onChange={onInputChange}
        value={formData.password}
        type="password"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Password"
        
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
        <div className="flex gap-2 items-center justify-center w-fit px-3 h-12 border-2 border-black rounded cursor-pointer" onClick={handleGoogleSignIn}>
              <FaGoogle className="text-black text-xl" />
              Continue With Google
        </div>
          
      
      </div>

    </form>
  );
};

export default UserSignup;
