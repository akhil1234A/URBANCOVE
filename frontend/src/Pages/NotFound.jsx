import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome } from 'react-icons/fa'; // Importing the Home icon from React Icons

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center">
        <div className="text-blue-600 text-8xl mb-4">
          <FaHome /> {/* Display an icon to enhance visuals */}
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-xl md:text-2xl text-gray-600 mb-6">
          Oops! Page Not Found
        </h2>
        <p className="text-center text-gray-500 mb-8 px-4 md:px-0 max-w-md">
          The page you’re looking for doesn’t exist. It may have been moved or
          deleted.
        </p>
        <button
          onClick={() => navigate('/')}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg shadow-lg transition duration-300"
        >
          <FaHome className="mr-2" /> Return to Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
