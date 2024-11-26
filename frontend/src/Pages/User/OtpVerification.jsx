import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { verifyOtp, resendOtp } from '../../slices/user/authSlice';

const OtpVerification = () => {
  const [otp, setOtp] = useState('');
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const { state } = useLocation();
  const userEmail = state?.email;
  const initialExpiry = state?.otpExpiry || Date.now() + 1 * 60 * 1000; // Default to 1 min if not provided
  const [timer, setTimer] = useState(Math.max(0, Math.floor((initialExpiry - Date.now()) / 1000)));
  const dispatch = useDispatch();

  useEffect(() => {
    let countdown;
    if (isResendDisabled && timer > 0) {
      countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      setIsResendDisabled(false);
      clearInterval(countdown);
    }
    return () => clearInterval(countdown);
  }, [isResendDisabled, timer]);

  const handleOtpChange = (e) => {
    setOtp(e.target.value.slice(0, 6));
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await dispatch(verifyOtp({ email: userEmail, otp })).unwrap();
      if (response.success) {
        toast.success('OTP verified successfully!');
        window.location.href = '/';
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to verify OTP.');
    }
  };

  // const handleResendOtp = async () => {
  //   console.log("Resend OTP button clicked"); 
  //   try {
  //     setIsResendDisabled(true);
  //     const newExpiry = Date.now() + 1 * 60 * 1000; // Reset to 1 minute from now
  //     setTimer(60);
  //     await dispatch(resendOtp({ email: userEmail })).unwrap();
  //     toast.success('OTP resent successfully!');
  //   } catch (error) {
  //     toast.error('Failed to resend OTP.');
  //     setIsResendDisabled(false);
  //   }
  // };

  const handleResendOtp = async () => {
    console.log("Resend OTP button clicked"); 
    try {
        setIsResendDisabled(true);
        const newExpiry = Date.now() + 1 * 60 * 1000; // Reset to 1 minute from now
        setTimer(60);
        await dispatch(resendOtp(userEmail)).unwrap(); // Pass userEmail directly
        toast.success('OTP resent successfully!');
    } catch (error) {
        toast.error('Failed to resend OTP.');
        setIsResendDisabled(false);
    }
};

 

  return (
    <div className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
      <h2 className="text-2xl font-semibold">OTP Verification</h2>
      <p className="text-center text-gray-600">Enter the OTP sent to your email to verify your account.</p>
      
      <form onSubmit={handleVerifyOtp} className="flex flex-col items-center gap-4 w-full">
        <input
          type="text"
          value={otp}
          onChange={handleOtpChange}
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Enter OTP"
          required
        />
        <button type="submit" className="bg-black text-white font-light px-8 py-2 mt-4">Verify OTP</button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-gray-600">
          {isResendDisabled ? (
            `Resend OTP in ${timer} seconds`
          ) : (
            <button onClick={handleResendOtp} className="text-blue-600 hover:underline">Resend OTP</button>
          )}
        </p>
      </div>
    </div>
  );
};

export default OtpVerification;
