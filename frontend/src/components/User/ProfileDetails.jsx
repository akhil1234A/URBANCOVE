import React, { useState } from 'react';

const ProfileDetails = () => {
  const [isEditing, setIsEditing] = useState(false); // For toggling edit mode
  const [name, setName] = useState('Richard Doe');
  const [email, setEmail] = useState('richard@gmail.com');
  const [password, setPassword] = useState('Pass Key');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChange = (field, value) => {
    if (field === 'name') setName(value);
    if (field === 'email') setEmail(value);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handlePasswordModalToggle = () => {
    setIsPasswordModalOpen(!isPasswordModalOpen);
  };

  const handlePasswordSave = () => {
    if (newPassword === confirmPassword) {
      setPassword(newPassword);
      handlePasswordModalToggle();
      setNewPassword('');
      setConfirmPassword('');
    } else {
      alert("Passwords don't match. Please try again.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-md rounded-lg">
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
                readOnly={!isEditing}
              />
              <button
                type="button"
                className="ml-4 py-2 px-4 bg-blue-600 text-white rounded-md transition duration-200 ease-in-out hover:bg-blue-500"
                onClick={handleEditToggle}
              >
                {isEditing ? 'Save' : 'Change'}
              </button>
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
                readOnly={!isEditing}
              />
              <button
                type="button"
                className="ml-4 py-2 px-4 bg-blue-600 text-white rounded-md transition duration-200 ease-in-out hover:bg-blue-500"
                onClick={handleEditToggle}
              >
                {isEditing ? 'Save' : 'Change'}
              </button>
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

      {!isEditing && (
        <button
          className="mt-6 w-full py-3 px-4 bg-green-600 text-white rounded-lg font-semibold transition duration-200 ease-in-out hover:bg-green-500"
          onClick={handleEditToggle}
        >
          Edit Profile
        </button>
      )}

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
