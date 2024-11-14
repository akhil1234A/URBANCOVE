import React, { useState } from 'react';
import { useSelector, useDispatch} from 'react-redux';
import {toast} from 'react-toastify'
import { updatePasswordThunk } from '../../slices/user/authSlice';

const ProfileDetails = () => {

  const dispatch = useDispatch();
  
  const {user, token} = useSelector((state)=>state.auth);

 
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('pass-key');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  

  const handlePasswordModalToggle = () => {
    setIsPasswordModalOpen(!isPasswordModalOpen);
  };

 
  const handlePasswordSave = () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Password fields can't be empty.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match. Please try again.");
      return;
    }

    console.log(newPassword)

    // Dispatch updatePassword action
    dispatch(updatePasswordThunk({ token, passwordData: { newPassword } }))
      .unwrap()
      .then(() => {
        setPassword('newPassword');
        handlePasswordModalToggle();
        setNewPassword('');
        setConfirmPassword('');
        toast.success('Password updated successfully!');
      })
      .catch((error) => {
        toast.error(error.message || 'Failed to update password');
      });
  };


  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Profile Details</h2>

      <form>
        <div className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="text-lg font-semibold text-gray-700">Your Name</label>
            <div className="flex items-center mt-2">
              <input
                type="text"
                id="name"
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={name}
                onChange={(e) => handleChange('name', e.target.value)}
                readOnly
              />
              
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="text-lg font-semibold text-gray-700">Email Address</label>
            <div className="flex items-center mt-2">
              <input
                type="email"
                id="email"
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => handleChange('email', e.target.value)}
                readOnly
              />
             
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="text-lg font-semibold text-gray-700">Password</label>
            <div className="flex items-center mt-2">
              <input
                type="password"
                id="password"
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                readOnly
              />
              <button
                type="button"
                className="ml-4 py-2 px-4 bg-blue-600 text-white rounded-md transition duration-200 ease-in-out hover:bg-blue-500"
                onClick={handlePasswordModalToggle}
              >
                Change
              </button>
            </div>
          </div>
        </div>
      </form>

      

      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Change Password</h3>
            <div className="space-y-4">
              <input
                type="password"
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={handlePasswordModalToggle}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDetails;
