// src/components/AddressManagement.js
import React, { useState } from 'react';

const AddressManagement = () => {
  const [addresses, setAddresses] = useState([
    { id: 1, address: '123 Main St, Springfield', isDefault: true },
    { id: 2, address: '456 Elm St, Shelbyville', isDefault: false },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editAddressId, setEditAddressId] = useState(null);

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
    setCurrentAddress('');
    setIsEditing(false);
  };

  const handleSaveAddress = () => {
    if (isEditing) {
      setAddresses(addresses.map(addr =>
        addr.id === editAddressId ? { ...addr, address: currentAddress } : addr
      ));
    } else {
      setAddresses([
        ...addresses,
        { id: addresses.length + 1, address: currentAddress, isDefault: false },
      ]);
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
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  const handleSetDefault = (id) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    })));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto ">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Address Management</h2>
      
      {/* List Addresses */}
      <div className="space-y-4">
        {addresses.map(addr => (
          <div
            key={addr.id}
            className={`p-4 border rounded-lg ${addr.isDefault ? 'border-blue-500' : 'border-gray-300'}`}
          >
            <p className="text-gray-800">{addr.address}</p>
            <div className="flex items-center mt-2 space-x-4">
              {!addr.isDefault && (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
                >
                  Set as Default
                </button>
              )}
              <button
                onClick={() => handleEdit(addr.id, addr.address)}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-500"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(addr.id)}
                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Address Button */}
      <button
        onClick={handleModalToggle}
        className="mt-6 w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold transition duration-200 ease-in-out hover:bg-blue-500"
      >
        Add New Address
      </button>

      {/* Add/Edit Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              {isEditing ? 'Edit Address' : 'Add New Address'}
            </h3>
            <textarea
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter address here"
              value={currentAddress}
              onChange={(e) => setCurrentAddress(e.target.value)}
            />
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={handleModalToggle}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAddress}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressManagement;
