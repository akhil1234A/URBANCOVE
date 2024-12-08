import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAxios } from '../../utils/api';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';

const ChangePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();
 



  const validatePassword = (password) => password.length >= 8;

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!validatePassword(password)) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await userAxios.post(`/user/reset-password/${token}`, {
        newPassword: password,
    });
    

      if (response.data.success) {
        toast.success('Password changed successfully. Please log in with your new password.');
        navigate('/login');
      } else {
        toast.error(response.data.message || 'Failed to reset password.');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'An error occurred while resetting the password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <h2 className="text-2xl mb-4">Change Password</h2>
      <p className="text-sm text-gray-600 mb-6 text-center">
        Enter your new password below to reset your account password.
      </p>

      <input
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="New Password"
        aria-label="New password"
        required
      />

      <input
        type="password"
        name="confirmPassword"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Confirm New Password"
        aria-label="Confirm new password"
        required
      />

      <button
        type="submit"
        className="bg-black text-white font-light px-8 py-2 mt-4"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Changing...' : 'Change Password'}
      </button>
    </form>
  );
};

export default ChangePassword;
