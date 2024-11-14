import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAddresses, addNewAddress, updateExistingAddress, deleteUserAddress } from '../../slices/user/addressSlice';
import { toast, ToastContainer } from 'react-toastify';

const AddressManagement = () => {
  const dispatch = useDispatch();
  const { addresses = [], loading, error } = useSelector(state => state.address);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState({
    street: '',
    city: '',
    state: '',
    country: '',
    phoneNumber: '',
    postcode: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editAddressId, setEditAddressId] = useState(null);
  const [errors, setErrors] = useState({});
  
  const token = useSelector(state => state.auth.token);

  useEffect(() => {
    if (token) {
      dispatch(fetchAddresses(token));
    }
  }, [dispatch, token]);

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
    setCurrentAddress({
      street: '',
      city: '',
      state: '',
      country: '',
      phoneNumber: '',
      postcode: ''
    });
    setErrors({});
    setIsEditing(false);
  };

  const validateAddress = () => {
    const newErrors = {};
    if (!currentAddress.street) newErrors.street = 'Street is required';
    if (!currentAddress.city) newErrors.city = 'City is required';
    if (!currentAddress.state) newErrors.state = 'State is required';
    if (!currentAddress.country) newErrors.country = 'Country is required';
    if (!currentAddress.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    else if (!/^\d{10}$/.test(currentAddress.phoneNumber)) newErrors.phoneNumber = 'Phone number must be 10 digits';
    if (!currentAddress.postcode) newErrors.postcode = 'Postcode is required';
    else if (!/^\d{5}$/.test(currentAddress.postcode)) newErrors.postcode = 'Postcode must be 5 digits';

    return newErrors;
  };

  const handleSaveAddress = async () => {
    const newErrors = validateAddress();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isEditing) {
      dispatch(updateExistingAddress({ token, addressId: editAddressId, addressData: currentAddress }))
        .unwrap()
        .then(() => {
          toast.success('Address updated successfully!');
        })
        .catch(() => {
          toast.error('Failed to update address');
        });
    } else {
      dispatch(addNewAddress({ token, addressData: currentAddress }))
        .unwrap()
        .then(() => {
          toast.success('Address added successfully!');
        })
        .catch(() => {
          toast.error('Failed to add address');
        });
    }

    handleModalToggle();
  };

  const handleEdit = (id, address) => {
    setEditAddressId(id);
    setCurrentAddress(address);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    dispatch(deleteUserAddress({ token, addressId: id }))
      .then(() => {
        toast.success('Address deleted successfully!');
      })
      .catch(() => {
        toast.error('Failed to delete address');
      });
  };

  const handleSetDefault = async (id) => {
    const updatedData = addresses.map((addr) =>
      addr._id === id ? { ...addr, isDefault: true } : { ...addr, isDefault: false }
    );
  
    const defaultAddress = updatedData.find((addr) => addr._id === id);
  
    if (defaultAddress) {
      dispatch(updateExistingAddress({ token, addressId: defaultAddress._id, addressData: defaultAddress }))
        .unwrap()
        .then(() => {
          toast.success('Default address updated successfully!');
        })
        .catch(() => {
          toast.error('Failed to set default address');
        });
    }
  };

  if (loading) return <p>Loading addresses...</p>;

  if (error) {
    const errorMessage = error.message || error.response?.data?.message || 'Something went wrong';
    return <p>Error: {errorMessage}</p>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Address Management</h2>

      <div className="space-y-4">
        {addresses.map(addr => (
          <div
            key={addr._id}
            className={`p-4 border rounded-lg ${addr.isDefault ? 'border-blue-500' : 'border-gray-300'}`}
          >
            <p className="text-gray-800">{`${addr.street}, ${addr.city}, ${addr.state}, ${addr.country} - ${addr.postcode}`}</p>
            <p className="text-gray-600">Phone: {addr.phoneNumber}</p>
            <div className="flex items-center mt-2 space-x-4">
              {!addr.isDefault && (
                <button
                  onClick={() => handleSetDefault(addr._id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
                >
                  Set as Default
                </button>
              )}
              <button
                onClick={() => handleEdit(addr._id, addr)}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-500"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(addr._id)}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleModalToggle}
        className="mt-6 w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold transition duration-200 ease-in-out hover:bg-blue-500"
      >
        Add New Address
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              {isEditing ? 'Edit Address' : 'Add New Address'}
            </h3>
            <div>
              {/* Address Form Fields */}
              <input
                className={`w-full p-3 mb-4 rounded-lg border ${errors.street ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Street"
                value={currentAddress.street}
                onChange={(e) => setCurrentAddress({ ...currentAddress, street: e.target.value })}
              />
              {errors.street && <p className="text-red-500 text-sm">{errors.street}</p>}
              <input
                className={`w-full p-3 mb-4 rounded-lg border ${errors.city ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="City"
                value={currentAddress.city}
                onChange={(e) => setCurrentAddress({ ...currentAddress, city: e.target.value })}
              />
              {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
              <input
                className={`w-full p-3 mb-4 rounded-lg border ${errors.state ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="State"
                value={currentAddress.state}
                onChange={(e) => setCurrentAddress({ ...currentAddress, state: e.target.value })}
              />
              {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
              <input
                className={`w-full p-3 mb-4 rounded-lg border ${errors.country ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Country"
                value={currentAddress.country}
                onChange={(e) => setCurrentAddress({ ...currentAddress, country: e.target.value })}
              />
              {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
              <input
                className={`w-full p-3 mb-4 rounded-lg border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Phone Number"
                value={currentAddress.phoneNumber}
                onChange={(e) => setCurrentAddress({ ...currentAddress, phoneNumber: e.target.value })}
              />
              {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
              <input
                className={`w-full p-3 mb-4 rounded-lg border ${errors.postcode ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Postcode"
                value={currentAddress.postcode}
                onChange={(e) => setCurrentAddress({ ...currentAddress, postcode: e.target.value })}
              />
              {errors.postcode && <p className="text-red-500 text-sm">{errors.postcode}</p>}
            </div>
            <button
              onClick={handleSaveAddress}
              className="w-full mt-4 py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500"
            >
              {isEditing ? 'Update Address' : 'Save Address'}
            </button>
            <button
              onClick={handleModalToggle}
              className="w-full mt-2 py-2 px-4 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover />
    </div>
  );
};

export default AddressManagement;
