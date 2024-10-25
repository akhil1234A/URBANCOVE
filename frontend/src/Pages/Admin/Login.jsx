import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const AdminLogin = () => {
  // State to manage email, password, and error message
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous error messages

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password }), // Adjust if needed based on your backend
      });

      if (!response.ok) {
        throw new Error('Login failed. Please check your credentials.');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token); // Save the token for further use
      
      // Redirect to the dashboard using useNavigate
      navigate('/admin/dashboard'); // Redirect to the dashboard
    } catch (error) {
      setError(error.message); // Set error message to display
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex bg-white shadow-lg rounded-lg overflow-hidden w-[1000px] h-[450px]">
          {/* Left Side: Logo and Caption */}
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

          {/* Right Side: Login Form */}
          <div className="p-8 w-1/2">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">Login</h2>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>} {/* Error message display */}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700" htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} // Update state on input change
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700" htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} // Update state on input change
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-yellow-400 text-gray-800 py-2 rounded-md hover:bg-yellow-300"
              >
                Login {/* Changed from "Sign Up" to "Login" */}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
