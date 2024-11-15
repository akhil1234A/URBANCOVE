import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; // Import necessary hooks
import { logout } from '../../slices/user/authSlice'; // Import the logout action
import { assets } from '../../assets/assets';

const Navbar = ({toggleSearchBar}) => {
  const [visible, setVisible] = useState(false);
  const dispatch = useDispatch(); 
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    dispatch(logout()); 
    navigate('/login');
  };

  return (
    <div className='flex items-center justify-between py-5 font-medium'>
      <Link to='/'>
        <img src={assets.logo} className='w-36' alt="Logo" />
      </Link>

      <ul className='hidden sm:flex gap-5 text-sm text-gray-700'>
        <NavLink to='/' className='flex flex-col items-center gap-1'>
          <p>HOME</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>

        <NavLink to='/collection' className='flex flex-col items-center gap-1'>
          <p>COLLECTION</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>

        <NavLink to='/about' className='flex flex-col items-center gap-1'>
          <p>ABOUT</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>

        <NavLink to='/contact' className='flex flex-col items-center gap-1'>
          <p>CONTACT</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
      </ul>

      <div className='flex items-center gap-6'>
        <img 
          onClick={toggleSearchBar}
          src={assets.search_icon} 
          className='w-5 cursor-pointer' 
          alt="Search" 
        />

        <div className='relative group'>
          <img 
            className='w-5 cursor-pointer' 
            src={assets.profile_icon} 
            alt="Profile" 
          />
          {/* Profile dropdown */}
          <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4'>
            <div className='flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded'>
                  <NavLink to='/account' className='cursor-pointer hover:text-black'>
                    My Profile
                  </NavLink>
              {/* Conditional rendering for Logout/Login */}
              {user ? (
                <p onClick={handleLogout} className='cursor-pointer hover:text-black'>Logout</p>
              ) : (
                <Link to='/login' className='cursor-pointer hover:text-black'>Login</Link>
              )}
            </div>
          </div>
        </div>

        <Link to='/cart' className='relative'>
          <img src={assets.cart_icon} className='w-5 min-w-5' alt="Cart" />
          <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]'>
            0 {/* Placeholder for cart count */}
          </p>
        </Link>

        <img 
          onClick={() => setVisible(true)} 
          src={assets.menu_icon} 
          className='w-5 cursor-pointer sm:hidden' 
          alt="Menu" 
        />
      </div>

      {/* Sidebar for small screens */}
      <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${visible ? 'w-full' : 'w-0'}`}>
        <div className='flex flex-col text-gray-600'>
          <div onClick={() => setVisible(false)} className='flex items-center gap-4 p-3 cursor-pointer'>
            <img className='h-4 rotate-180' src={assets.dropdown_icon} alt="Back" />
            <p>Back</p>
          </div>
          <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/'>HOME</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/collection'>COLLECTION</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/about'>ABOUT</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/contact'>CONTACT</NavLink>
          {/* Conditional rendering for Logout/Login in sidebar */}
          {user ? (
            <p onClick={handleLogout} className='py-2 pl-6 border cursor-pointer'>Logout</p>
          ) : (
            <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/login'>Login</NavLink>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
