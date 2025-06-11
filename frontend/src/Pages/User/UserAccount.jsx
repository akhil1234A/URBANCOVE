import { NavLink, Outlet } from 'react-router-dom';

const UserAccount = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 h-screen bg-white shadow-md flex flex-col py-10 px-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-3">
          Account Menu
        </h2>
        <nav className="flex flex-col gap-3">
          <NavLink
            to="profile"
            className={({ isActive }) =>
              `block py-3 px-4 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            Profile Details
          </NavLink>
          <NavLink
            to="addresses"
            className={({ isActive }) =>
              `block py-3 px-4 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            Address Management
          </NavLink>
          <NavLink
            to="orders"
            className={({ isActive }) =>
              `block py-3 px-4 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            Order History
          </NavLink>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Account</h1>
        <div className="p-6 bg-white shadow rounded-lg">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default UserAccount;
