import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/user/forgot-password`, { email });
      if (response.data.success) {
        toast.success('Password reset email sent successfully. Please check your inbox.');
      } else {
        toast.error(response.data.message || 'Failed to send reset email.');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'An error occurred while trying to send the reset email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
      <h2 className="text-2xl mb-4">Forgot Password</h2>
      <p className="text-sm text-gray-600 mb-6 text-center">
        Enter your email address below, and we’ll send you a link to reset your password.
      </p>

      <input
        type="email"
        name="email"
        value={email}
        onChange={onEmailChange}
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="Email"
        required
      />

      <button
        type="submit"
        className="bg-black text-white font-light px-8 py-2 mt-4"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Sending...' : 'Send Reset Link'}
      </button>
    </form>
  );
};

export default ForgotPassword;
