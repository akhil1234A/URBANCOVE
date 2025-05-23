import { useState, useEffect} from "react";
import { userAxios } from "../../utils/api";
import Title from "../../components/User/Title";
import { assets } from "../../assets/assets";
import { useDispatch, useSelector } from "react-redux";
import { fetchAddresses, addNewAddress, setDefault } from "../../slices/user/addressSlice";
import { placeOrder } from '../../slices/admin/orderSlice';
import CartTotal from "../../components/User/CartTotal";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import CouponList from "../../components/User/CouponList";
import { getUserCart } from "../../slices/user/cartSlice";
import { ClipLoader } from "react-spinners";

const PlaceOrder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { addresses, loading, error } = useSelector((state) => state.address);
  const { cartItems, total} = useSelector((state) => state.cart);
  const [finalTotal,setFinalTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState('');

  const [method, setMethod] = useState("cod");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
    phoneNumber: "",
    postcode: ""
  });

  const [addressErrors, setAddressErrors] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
    phoneNumber: "",
    postcode: "",
  });
  
  const [walletBalance, setWalletBalance] = useState(0);

useEffect(() => {
  const fetchWalletBalance = async () => {
    try {
      const response = await userAxios.get(`/user/wallet/balance`);
      setWalletBalance(response.data.balance); 
    } catch (error) {
      console.error("Failed to fetch wallet balance:", error);
      toast.error("Failed to fetch wallet balance.");
    }
  };

  fetchWalletBalance();
}, []);


  const deliveryFee = 40; 
  const totalAmount = finalTotal - discount;

 
  // Update final total when total changes
  useEffect(() => {
    setFinalTotal(total + deliveryFee);
  }, [total, deliveryFee]);

  // Load saved cart data on component mount
  useEffect(() => {
    const savedCartData = localStorage.getItem('cartData');
    if (savedCartData) {
      const { discount, couponCode } = JSON.parse(savedCartData);
      setDiscount(discount || 0);
      setCouponCode(couponCode || '');
    }
  }, []);


  useEffect(() => {
    dispatch(getUserCart());
  }, [dispatch]);

 
  // Fetch addresses on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(fetchAddresses(token));
    }
  }, [dispatch]);


  useEffect(() => {
    // Save cart data to localStorage
    const cartData = {
      finalTotal,
      discount,
      couponCode
    };
    localStorage.setItem('cartData', JSON.stringify(cartData));
  }, [finalTotal, discount, couponCode]);

  const handleAddressChange = (id) => {
    setSelectedAddress(id);
    const selected = addresses.find((address) => address._id === id);
    dispatch(setDefault(selected)); // Update default address in Redux
  };

  const handleNewAddress = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const validateAddress = () => {
    let errors = {};
    let isValid = true;
  
    // Check if each field is empty
    Object.keys(newAddress).forEach((field) => {
      if (!newAddress[field]) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        isValid = false;
      } else {
        errors[field] = ""; 
      }
    });
  
    // Specific validation for phone number (simple length check for this example)
    if (newAddress.phoneNumber && newAddress.phoneNumber.length !== 10) {
      errors.phoneNumber = "Phone number should be 10 digits";
      isValid = false;
    }
  
    // Specific validation for postcode (should be 5 digits)
    if (newAddress.postcode && newAddress.postcode.length !== 6) {
      errors.postcode = "Postcode should be 6 digits";
      isValid = false;
    }
  
    setAddressErrors(errors);
    return isValid;
  };
  
  const handleSaveNewAddress = (e) => {
    // If validation fails, exit early and don't proceed
    e.preventDefault();
    if (!validateAddress()) {
      return; // Prevent further execution
    }
    
    const token = localStorage.getItem('token');
    dispatch(addNewAddress({ token, addressData: newAddress }));
    setShowModal(false);
  };

  const handleRazorpayOrder = async () => {
    
    if (!selectedAddress) {
      toast.error("Please select a delivery address.");
      return;
    }

    const token = localStorage.getItem('token'); 

    if (!token) {
      toast.error("User is not authenticated. Please log in.");
      return;
    }
  
    try {
      // Step 1: Create Razorpay order from backend
      const response = await userAxios.post(
        `/orders/razorpay`, 
        {
          addressId: selectedAddress,
          cartItems,
          totalAmount,
        },
      );
  
      const { razorpayOrderId, amount, currency } = response.data;
      const razorpayOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        order_id: razorpayOrderId,
        handler: async (response) => {
          const verifyData = {
            razorpayOrderId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            cartItems: cartItems,
            addressId: selectedAddress,
            totalAmount,
          };
          try {
            // Step 3: Verify the payment and finalize the order
            const verifyResponse = await userAxios.post(
              `/orders/verify`, 
              verifyData, 
            );
  
            if (verifyResponse.data.success) {
              toast.success("Payment verified successfully!");
              localStorage.removeItem('cartData');
             
              setDiscount(0);
              setCouponCode('');
              navigate('/success');
            } else {
              toast.error("Payment verification failed.");
            }
          } catch (error) {
            toast.error("Payment verification failed.");
          }
        }, modal: {
          escape: true,
          ondismiss: async () => {
            try {
              await userAxios.post(
                `/orders/create-failed`,
                {
                  razorpayOrderId,
                  cartItems,
                  addressId: selectedAddress,
                  totalAmount,
                },
              );
              toast.error("Payment canceled. Order created with status: Failed.");
              localStorage.removeItem('cartData');
             
              setDiscount(0);
              setCouponCode('');
              navigate('/success');
            } catch (error) {
              console.error("Failed to handle payment cancellation:", error);
              toast.error("Failed to handle payment cancellation.");
            }
          },
        },
        theme: { color: "#3399cc" },
      };
  
      // Step 4: Open Razorpay payment portal
      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.open();
    } catch (error) {
      toast.error("Failed to initialize Razorpay order. Please try again.");
    }
  };
  
  
  
  const handleCODOrder = async () => {
    const orderData = {
      addressId: selectedAddress,
      paymentMethod: "cod",
      cartItems,
      totalAmount,
    };
  
    try {
      await dispatch(placeOrder(orderData)).unwrap();
      localStorage.removeItem('cartData');
      setDiscount(0);
      setCouponCode('');
      navigate('/success');
    } catch (error) {
      toast.error(error.message || "Order placement failed. Try again.");
    }
  };
  
  
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
  
    if (!selectedAddress) {
      toast.error("Please select a delivery address.");
      return;
    }

    if(finalTotal - deliveryFee == 0){
      toast.error("Your cart is empty. Cannot place an order");
      return; 
    }
  
    if (method === "wallet") {
      await handleWalletOrder();
    } else if (method === "razorpay") {
      await handleRazorpayOrder();
    } else if (method === "cod") {
      handleCODOrder();
    }
  };
  
  const handleApplyCoupon = async () => {
    if (!couponCode) {
      toast.error("Please enter a coupon code");
      return;
    }
  
    if (discount > 0) {
      toast.error("A coupon is already applied. Remove it before applying a new one.");
      return;
    }
  
   
    try {
      const response = await userAxios.post(
        `/coupons/apply`,
        { couponCode, total },
      );
      setDiscount(response.data.discount); 
      toast.success("Coupon applied successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply coupon");
    }
  };
  

  // Remove coupon
  const handleRemoveCoupon = async () => {
    try {
      await userAxios.post(
        `/coupons/remove`,
        {couponCode},
      );
      setDiscount(0);
      setCouponCode('');
      toast.success("Coupon removed successfully!");
    } catch (error) {
      toast.error("Failed to remove coupon");
    }
  };
  

  const handleWalletOrder = async () => {
    if (walletBalance < totalAmount) {
      toast.error("Insufficient wallet balance. Please choose another payment method.");
      return;
    }
  
    const orderData = {
      addressId: selectedAddress,
      paymentMethod: "wallet",
      cartItems,
      totalAmount,
    };
  
    try {
      await dispatch(placeOrder(orderData)).unwrap();
      localStorage.removeItem('cartData');
      setDiscount(0);
      setCouponCode('');
      navigate('/success');
      toast.success("Order placed successfully using wallet balance!");
    } catch (error) {
      toast.error(error.message || "Order placement failed. Try again.");
    }
  };
  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
    <ClipLoader color="#36D7B7" size={50} /> {/* Spinner */}
  </div>
    ); 
  }

  if (error) {
    return <div>Error: {error}</div>; 
  }

  return (
    <form onSubmit={handlePlaceOrder} className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t">
      {/* Left Side - Address Selection */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1="DELIVERY" text2="ADDRESS" />
        </div>

        {addresses.length > 0 ? (
          <div className="flex flex-col gap-4">
            {addresses.map((address) => (
              <div
                key={address._id}
                onClick={() => handleAddressChange(address._id)}
                className={`border p-4 rounded cursor-pointer ${selectedAddress === address._id || address.isDefault ? "border-green-500 bg-green-50" : "border-gray-300"}`}
              >
                <div className="flex justify-between">
                  <p>{address.street}, {address.city}, {address.state}, {address.postcode}</p>
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddress === address._id || address.isDefault}
                    onChange={() => handleAddressChange(address._id)}
                  />
                </div>
                <p className="text-sm text-gray-600">{address.phoneNumber}, {address.country}</p>
                {address.isDefault && <span className="text-green-600 text-xs">Default</span>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No saved addresses. Please add a new address.</p>
        )}

        <button
          type="button"
          onClick={handleNewAddress}
          className="mt-3 text-blue-600 text-sm font-medium hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300"
        >
          + Add New Address
        </button>

        <CouponList/>
      </div>

      {/* Right Side - Payment and Cart Summary */}
      <div className="mt-8">
        <div className="mt-8 min-w-80">
        <CartTotal subtotal={finalTotal-deliveryFee} deliveryFee={deliveryFee} total={finalTotal} discount={discount} />
        </div>

          {/* Coupon input and apply/remove buttons */}
          <div className="flex flex-col gap-3 mt-8">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter Coupon Code"
              className="border p-2 rounded"
              disabled={discount > 0} // Disable input if a coupon is already applied
            />
            <div className="flex gap-3">
              {!discount && (
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="bg-blue-600 text-white px-4 py-2 text-sm"
                >
                  Apply Coupon
                </button>
              )}
              {discount > 0 && (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="bg-gray-600 text-white px-4 py-2 text-sm"
                >
                  Remove Coupon
                </button>
              )}
            </div>
</div>

      

        <div className="mt-12">
          <Title text1="PAYMENT" text2="METHOD" />
          <div className="flex gap-3 flex-col lg:flex-row">
          <div
      onClick={() => {
        if (walletBalance >= totalAmount) {
          setMethod("wallet");
        } else {
          toast.error("Insufficient wallet balance. Please select another payment method.");
        }
      }}
      className={`flex items-center gap-3 border p-2 px-3 cursor-pointer ${
        walletBalance < totalAmount ? "cursor-not-allowed opacity-50" : ""
      }`}
    >
      <p
        className={`min-w-3.5 h-3.5 border rounded-full ${
          method === "wallet" ? "bg-green-400" : ""
        }`}
      />
      <p className="text-gray-500 text-sm font-medium mx-4">
        Wallet (Balance: ₹{walletBalance})
      </p>
    </div>

            <div
              onClick={() => setMethod("razorpay")}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === "razorpay" ? "bg-green-400" : ""}`} />
              <img className="h-5 mx-4" src={assets.razorpay_logo} alt="Razorpay Logo" />
            </div>
            <div
              onClick={() => setMethod("cod")}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === "cod" ? "bg-green-400" : ""}`} />
              <p className="text-gray-500 text-sm font-medium mx-4">CASH ON DELIVERY</p>
            </div>
          </div>

          <div className="w-full text-end mt-8">
            <button
              type="submit"
              className="bg-black text-white px-16 py-3 text-sm"
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>

      {/* Modal for New Address */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <div className="mb-4 text-xl">Add New Address</div>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                name="street"
                value={newAddress.street}
                onChange={handleInputChange}
                placeholder="Street"
                className="border p-2 rounded"
              />
              {addressErrors.street && <p className="text-red-500 text-sm">{addressErrors.street}</p>}

              <input
                type="text"
                name="city"
                value={newAddress.city}
                onChange={handleInputChange}
                placeholder="City"
                className="border p-2 rounded"
              />
              {addressErrors.city && <p className="text-red-500 text-sm">{addressErrors.city}</p>}

              <input
                type="text"
                name="state"
                value={newAddress.state}
                onChange={handleInputChange}
                placeholder="State"
                className="border p-2 rounded"
              />
              {addressErrors.state && <p className="text-red-500 text-sm">{addressErrors.state}</p>}
              <input
                type="text"
                name="postcode"
                value={newAddress.postcode}
                onChange={handleInputChange}
                placeholder="Zip Code"
                className="border p-2 rounded"
              />
              {addressErrors.postcode && <p className="text-red-500 text-sm">{addressErrors.postcode}</p>}
              <input
                type="text"
                name="country"
                value={newAddress.country}
                onChange={handleInputChange}
                placeholder="Country"
                className="border p-2 rounded"
              />
               {addressErrors.country && <p className="text-red-500 text-sm">{addressErrors.country}</p>}
              <input
                type="text"
                name="phoneNumber"
                value={newAddress.phoneNumber}
                onChange={handleInputChange}
                placeholder="Phone Number"
                className="border p-2 rounded"
              />
              {addressErrors.phoneNumber && <p className="text-red-500 text-sm">{addressErrors.phoneNumber}</p>}
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={handleCloseModal}
                className="text-sm text-gray-500 px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewAddress}
                className="bg-blue-600 text-white px-6 py-2 text-sm"
              >
                Save Address
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default PlaceOrder;
