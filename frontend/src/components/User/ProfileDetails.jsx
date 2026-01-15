import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { updatePasswordThunk } from '../../slices/user/authSlice';

const ProfileDetails = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  const [name] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
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
    <div className="max-w-3xl">
      {/* Section Header */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-900">
          Profile Details
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          View your personal information
        </p>
      </div>

      <form className="space-y-8">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={name}
            readOnly
            className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-3 text-gray-800 cursor-not-allowed"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-3 text-gray-800 cursor-not-allowed"
          />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>

          <div className="flex items-center gap-4">
            <input
              type="password"
              value={password}
              readOnly
              className="flex-1 rounded-md border border-gray-300 bg-gray-50 px-4 py-3 text-gray-800 cursor-not-allowed"
            />

            {!user?.googleId ? (
              <button
                type="button"
                onClick={handlePasswordModalToggle}
                className="rounded-md bg-[#7B1E1E] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#651818] transition"
              >
                Change
              </button>
            ) : (
              <span className="text-sm text-gray-500">
                Managed via Google
              </span>
            )}
          </div>
        </div>
      </form>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl bg-white px-6 py-6 shadow-xl">
            <h3 className="mb-1 text-lg font-semibold text-gray-900">
              Change Password
            </h3>
            <p className="mb-5 text-sm text-gray-500">
              Enter a new password below
            </p>

            <div className="space-y-4">
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7B1E1E]"
              />

              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7B1E1E]"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handlePasswordModalToggle}
                className="rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSave}
                className="rounded-md bg-[#7B1E1E] px-4 py-2 text-sm font-medium text-white hover:bg-[#651818]"
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
