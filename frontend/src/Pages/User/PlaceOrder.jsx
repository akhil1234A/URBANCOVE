import React, { useState, useEffect } from "react";
import Title from "../../components/User/Title";
import { assets } from "../../assets/assets";
import { useDispatch, useSelector } from "react-redux";
import { fetchAddresses, addNewAddress, setDefault } from "../../slices/user/addressSlice";
import { placeOrder } from '../../slices/admin/orderSlice';
import CartTotal from "../../components/User/CartTotal";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { addresses, loading, error } = useSelector((state) => state.address);
  const { cartItems, total} = useSelector((state) => state.cart);
 


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
  
  const deliveryFee = 10; // This can be dynamic based on your logic
  const finalTotal = total + deliveryFee;

  // Fetch addresses on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    dispatch(fetchAddresses(token));
  }, [dispatch]);

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
        errors[field] = ""; // Clear error if valid
      }
    });
  
    // Specific validation for phone number (simple length check for this example)
    if (newAddress.phoneNumber && newAddress.phoneNumber.length !== 10) {
      errors.phoneNumber = "Phone number should be 10 digits";
      isValid = false;
    }
  
    // Specific validation for postcode (should be 5 digits)
    if (newAddress.postcode && newAddress.postcode.length !== 5) {
      errors.postcode = "Postcode should be 5 digits";
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
  
  const handlePlaceOrder = async(e) => {
    e.preventDefault();

    if (!selectedAddress) {
      toast.error("Please select a delivery address.");
      return;
    }

    const token = localStorage.getItem("token");
    const orderData = {
      addressId: selectedAddress,
      paymentMethod: method,
      cartItems,
      total: finalTotal
    };

    console.log("Order Data Sent to API:", orderData);

    await dispatch(placeOrder(orderData)).unwrap();
    navigate('/success');
     
  };

  if (loading) {
    return <div>Loading...</div>; // Add a loading state while addresses are being fetched
  }

  if (error) {
    return <div>Error: {error}</div>; // Handle error if there was an issue fetching addresses
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
      </div>

      {/* Right Side - Payment and Cart Summary */}
      <div className="mt-8">
        <div className="mt-8 min-w-80">
        <CartTotal subtotal={total} deliveryFee={deliveryFee} total={finalTotal} />
        </div>

        <div className="mt-12">
          <Title text1="PAYMENT" text2="METHOD" />
          <div className="flex gap-3 flex-col lg:flex-row">
            <div
              onClick={() => setMethod("stripe")}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === "stripe" ? "bg-green-400" : ""}`} />
              <img className="h-5 mx-4" src={assets.stripe_logo} alt="Stripe Logo" />
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
