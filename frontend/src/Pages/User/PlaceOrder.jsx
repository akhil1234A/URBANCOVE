import React, { useState } from "react";
import Title from "../../components/User/Title";
import CartTotal from "../../components/User/CartTotal";
import { assets } from "../../assets/assets";

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addresses, setAddresses] = useState([
    { id: 1, street: "123 Main St", city: "New York", state: "NY", zipcode: "10001", country: "USA", phone: "123-456-7890", isDefault: true },
    { id: 2, street: "456 Maple Dr", city: "Los Angeles", state: "CA", zipcode: "90001", country: "USA", phone: "987-654-3210", isDefault: false }
  ]);
  const [showModal, setShowModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: ""
  });

  const handleAddressChange = (id) => {
    setSelectedAddress(id);
    setAddresses(addresses.map(addr => ({ ...addr, isDefault: addr.id === id })));
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

  const handleSaveNewAddress = () => {
    const newAddr = { ...newAddress, id: addresses.length + 1, isDefault: false };
    setAddresses((prev) => [...prev, newAddr]);
    setShowModal(false);
  };

  return (
    <form className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t">
      {/* Left Side - Address Selection */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1="DELIVERY" text2="ADDRESS" />
        </div>

        {addresses.length > 0 ? (
          <div className="flex flex-col gap-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                onClick={() => handleAddressChange(address.id)}
                className={`border p-4 rounded cursor-pointer ${selectedAddress === address.id || address.isDefault ? "border-green-500 bg-green-50" : "border-gray-300"}`}
              >
                <div className="flex justify-between">
                  <p>{address.street}, {address.city}, {address.state}, {address.zipcode}</p>
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddress === address.id || address.isDefault}
                    onChange={() => handleAddressChange(address.id)}
                  />
                </div>
                <p className="text-sm text-gray-600">{address.phone}, {address.country}</p>
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
          <CartTotal />
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
              <input
                type="text"
                name="city"
                value={newAddress.city}
                onChange={handleInputChange}
                placeholder="City"
                className="border p-2 rounded"
              />
              <input
                type="text"
                name="state"
                value={newAddress.state}
                onChange={handleInputChange}
                placeholder="State"
                className="border p-2 rounded"
              />
              <input
                type="text"
                name="zipcode"
                value={newAddress.zipcode}
                onChange={handleInputChange}
                placeholder="Zip Code"
                className="border p-2 rounded"
              />
              <input
                type="text"
                name="country"
                value={newAddress.country}
                onChange={handleInputChange}
                placeholder="Country"
                className="border p-2 rounded"
              />
              <input
                type="text"
                name="phone"
                value={newAddress.phone}
                onChange={handleInputChange}
                placeholder="Phone Number"
                className="border p-2 rounded"
              />
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
