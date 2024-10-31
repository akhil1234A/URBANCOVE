import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const OtpVerification = ({ userEmail }) => {
  const [otp, setOtp] = useState('');
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  // Custom hook for countdown
  const useCountdown = (initialTime) => {
    const [time, setTime] = useState(initialTime);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
      if (isActive && time > 0) {
        const countdown = setInterval(() => setTime((t) => t - 1), 1000);
        return () => clearInterval(countdown);
      } else if (time === 0) {
        setIsActive(false);
        setIsResendDisabled(false);
      }
    }, [isActive, time]);

    return { time, reset: () => { setTime(initialTime); setIsActive(true); }};
  };

  const { time: timer, reset: resetTimer } = useCountdown(30);

  const handleOtpChange = (e) => {
    const input = e.target.value;
    if (input.length <= 6) setOtp(input);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BASE_URL}/api/user/verify-otp`, { otp, email: userEmail });
      if (response.data.success) {
        toast.success('OTP verified successfully!');
        window.location.href = '/';
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to verify OTP. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsResendDisabled(true);
      resetTimer();
      const response = await axios.post(`${BASE_URL}/api/user/resend-otp`, { email: userEmail });
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
