import React, { useState } from 'react';
import ProfileDetails from '../../components/User/ProfileDetails';
import AddressManagement from '../../components/User/AddressManagement';
import OrderHistory from '../../components/User/OrderHistory';
import ViewOrder from '../../components/User/ViewOrder';

const UserAccount = () => {
  const [activeSection, setActiveSection] = useState('profile');  // Track active section
  const [selectedOrder, setSelectedOrder] = useState(null); 


  const handleViewOrder = (orderId) => {
    // Here, you'd normally fetch the order details by ID; we're using a placeholder for now
    setSelectedOrder({ id: orderId }); // Set dummy order data
    setActiveSection('viewOrder');
  };


  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileDetails />;
      case 'addresses':
        return <AddressManagement />;
      case 'orders':
        return <OrderHistory />;
      case 'viewOrder':
        return <ViewOrder order={selectedOrder} />;
      default:
        return <ProfileDetails />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar - Fixed Position, Full Height, Centered Content */}
      <div className="w-1/4 h-screen bg-white shadow-md flex flex-col items-center py-10">
        <h2 className="text-lg font-semibold mb-4">Account Menu</h2>
        <ul className="space-y-2 w-full px-4">
          <li>
            <button
              onClick={() => setActiveSection('profile')}
              className={`w-full text-left py-2 px-3 rounded-lg ${activeSection === 'profile' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
            >
              Profile Details
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveSection('addresses')}
              className={`w-full text-left py-2 px-3 rounded-lg ${activeSection === 'addresses' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
            >
              Address Management
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveSection('orders')}
              className={`w-full text-left py-2 px-3 rounded-lg ${activeSection === 'orders' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
            >
              Order History
            </button>
          </li>
          
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Your Account</h1>
        <div className="p-4 bg-white shadow-md rounded-lg">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default UserAccount;
