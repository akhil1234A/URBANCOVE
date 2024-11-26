import { useNavigate } from 'react-router-dom';
import { FaCheckCircle } from "react-icons/fa";

const OrderSuccess = ({ orderNumber, estimatedDeliveryDate }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-10 px-4 bg-gray-50">
      <div className="max-w-lg w-full bg-white p-8 rounded-lg shadow-lg text-center">
        {/* Centered Icon */}
        <div className="flex justify-center mb-4">
          <FaCheckCircle size={80} className="text-green-500" />
        </div>

        {/* Title and Subtitle */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Thank You for Your Order!</h1>
        <p className="text-gray-600 mb-6 text-lg">
          Your order has been successfully placed.
        </p>
        
        {/* Optional Order Details */}
        {orderNumber && (
          <p className="text-gray-500 text-sm mb-4">
            Order Number: <span className="font-semibold">{orderNumber}</span>
          </p>
        )}
        {estimatedDeliveryDate && (
          <p className="text-gray-500 text-sm mb-8">
            Estimated Delivery: <span className="font-semibold">{estimatedDeliveryDate}</span>
          </p>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate("/account")}
            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition w-full font-medium text-lg"
          >
            View Order Details
          </button>
          <button
            onClick={() => navigate("/")}
            className="bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300 transition w-full font-medium text-lg"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
