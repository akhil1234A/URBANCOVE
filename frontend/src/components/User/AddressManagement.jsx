import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAddresses,
  addNewAddress,
  updateExistingAddress,
  deleteUserAddress
} from '../../slices/user/addressSlice';
import { toast, ToastContainer } from 'react-toastify';
import { ClipLoader } from 'react-spinners';

const AddressManagement = () => {
  const dispatch = useDispatch();
  const { addresses = [], loading, error } = useSelector(state => state.address);
  const token = useSelector(state => state.auth.token);

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

  useEffect(() => {
    if (token) dispatch(fetchAddresses(token));
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
    else if (!/^\d{10}$/.test(currentAddress.phoneNumber))
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    if (!currentAddress.postcode) newErrors.postcode = 'Postcode is required';
    else if (!/^\d{6}$/.test(currentAddress.postcode))
      newErrors.postcode = 'Postcode must be 6 digits';
    return newErrors;
  };

  const handleSaveAddress = () => {
    const newErrors = validateAddress();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isEditing) {
      dispatch(updateExistingAddress({ token, addressId: editAddressId, addressData: currentAddress }))
        .unwrap()
        .then(() => toast.success('Address updated successfully!'));
    } else {
      dispatch(addNewAddress({ token, addressData: currentAddress }))
        .unwrap()
        .then(() => toast.success('Address added successfully!'));
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
      .then(() => toast.success('Address deleted successfully!'))
      .catch(() => toast.error('Failed to delete address'));
  };

  const handleSetDefault = (id) => {
    const updated = addresses.map(addr =>
      addr._id === id ? { ...addr, isDefault: true } : { ...addr, isDefault: false }
    );

    const defaultAddr = updated.find(a => a._id === id);
    if (defaultAddr) {
      dispatch(updateExistingAddress({
        token,
        addressId: defaultAddr._id,
        addressData: defaultAddr
      }))
        .unwrap()
        .then(() => toast.success('Default address updated successfully!'));
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <ClipLoader color="#7B1E1E" size={40} />
      </div>
    );
  }

  if (error) return <p className="text-red-600">Something went wrong</p>;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">Address Management</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your saved delivery addresses
        </p>
      </div>

      {/* Address List */}
      <div className="space-y-4">
        {addresses.map(addr => (
          <div
            key={addr._id}
            className={`rounded-xl border p-5 ${addr.isDefault
                ? 'border-[#7B1E1E] bg-[#FAF7F7]'
                : 'border-gray-200 bg-white'
              }`}
          >
            <div className="flex justify-between gap-6">
              <div>
                {addr.isDefault && (
                  <span className="mb-2 inline-block rounded-full bg-[#7B1E1E] px-3 py-1 text-xs font-medium text-white">
                    Default
                  </span>
                )}
                <p className="text-sm font-medium text-gray-900">
                  {addr.street}, {addr.city}, {addr.state}
                </p>
                <p className="text-sm text-gray-600">
                  {addr.country} - {addr.postcode}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Phone: {addr.phoneNumber}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2 text-sm">
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr._id)}
                    className="text-[#7B1E1E] hover:underline"
                  >
                    Set as default
                  </button>
                )}
                <button
                  onClick={() => handleEdit(addr._id, addr)}
                  className="text-gray-700 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(addr._id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Button */}
      <button
        onClick={handleModalToggle}
        className="mt-8 inline-flex rounded-md bg-[#7B1E1E] px-6 py-3 text-sm font-medium text-white hover:bg-[#651818]"
      >
        Add New Address
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white px-6 py-6">
            <h3 className="mb-6 text-lg font-semibold text-gray-900">
              {isEditing ? 'Edit Address' : 'Add New Address'}
            </h3>

            <div className="space-y-4">
              {[
                ['street', 'Street'],
                ['city', 'City'],
                ['state', 'State'],
                ['country', 'Country'],
                ['phoneNumber', 'Phone Number'],
                ['postcode', 'Postcode'],
              ].map(([key, label]) => (
                <div key={key}>
                  <input
                    placeholder={label}
                    value={currentAddress[key]}
                    onChange={(e) =>
                      setCurrentAddress({ ...currentAddress, [key]: e.target.value })
                    }
                    className={`w-full rounded-md border px-4 py-3 ${errors[key] ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-[#7B1E1E]`}
                  />
                  {errors[key] && (
                    <p className="mt-1 text-xs text-red-600">{errors[key]}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleModalToggle}
                className="rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAddress}
                className="rounded-md bg-[#7B1E1E] px-4 py-2 text-sm font-medium text-white hover:bg-[#651818]"
              >
                {isEditing ? 'Update Address' : 'Save Address'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={4000} />
    </div>
  );
};

export default AddressManagement;
