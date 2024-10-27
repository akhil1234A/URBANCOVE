import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const OtpVerification = ({ userEmail }) => {
  const [otp, setOtp] = useState('');
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [timer, setTimer] = useState(30); // countdown timer in seconds

  // Start the timer whenever the component mounts or user resends OTP
  useEffect(() => {
    if (isResendDisabled) {
      const countdown = setInterval(() => {
        setTimer((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(countdown);
            setIsResendDisabled(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
  }, [isResendDisabled]);

  // Function to handle OTP input change
  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  // Submit OTP for verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/user/verify-otp', { otp, email: userEmail });
      if (response.data.success) {
        toast.success('OTP verified successfully!');
        // Redirect user after successful verification
        window.location.href = '/';
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to verify OTP. Please try again.');
    }
  };

  // Resend OTP function
  const handleResendOtp = async () => {
    try {
      setIsResendDisabled(true);
      setTimer(30); // reset timer to 30 seconds

      const response = await axios.post('http://localhost:3000/api/user/resend-otp', { email: userEmail });
      if (response.data.success) {
        toast.success('OTP resent successfully!');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to resend OTP. Please try again.');
      setIsResendDisabled(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
      <h2 className="text-2xl font-semibold">OTP Verification</h2>
      <p className="text-center text-gray-600">An OTP has been sent to your email. Please enter it below to verify your account.</p>

      <form onSubmit={handleVerifyOtp} className="flex flex-col items-center gap-4 w-full">
        <input
          type="text"
          value={otp}
          onChange={handleOtpChange}
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Enter OTP"
          required
        />
        <button
          type="submit"
          className="bg-black text-white font-light px-8 py-2 mt-4"
        >
          Verify OTP
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-gray-600">
          {isResendDisabled ? (
            `Resend OTP in ${timer} seconds`
          ) : (
            <button onClick={handleResendOtp} className="text-blue-600 hover:underline">
              Resend OTP
            </button>
          )}
        </p>
      </div>
    </div>
  );
};

export default OtpVerification;
