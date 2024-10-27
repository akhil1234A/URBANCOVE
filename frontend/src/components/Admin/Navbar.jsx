import React from 'react'

const Navbar = () => {
  return (
    <nav className="bg-navyBlue p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-10">
      <div className="text-white text-lg font-bold">Admin Dashboard</div>
      <button className="bg-white text-navyBlue px-4 py-2 rounded">Logout</button>
    </nav>
  );
};

export default Navbar;
