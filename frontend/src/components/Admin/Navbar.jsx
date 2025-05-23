import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutAdmin } from '../../slices/admin/adminSlice';
import { toast } from 'react-toastify';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    toast.success('Logout Succesful');
    dispatch(logoutAdmin()); 
    navigate('/admin/login'); 
  };

  return (
    <nav className="bg-navyBlue p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-10">
      <div className="text-white text-lg font-bold">Admin Dashboard</div>
      <button onClick={handleLogout} className="bg-white text-navyBlue px-4 py-2 rounded">
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
