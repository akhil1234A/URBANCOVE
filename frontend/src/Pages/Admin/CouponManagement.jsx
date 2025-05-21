import  { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';

import {
  fetchCoupons,
  deactivateCoupon,
} from '../../slices/admin/couponSlice'; 

const CouponManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

 
  const { coupons, isLoading, error } = useSelector((state) => state.coupons);
 
  useEffect(() => {
    dispatch(fetchCoupons());
  }, [dispatch]);

  
  const toggleCouponStatus = (coupon) => {
    const couponId = coupon._id;
    dispatch(deactivateCoupon(couponId));
  };

 
  const handleEdit = (couponId) => {
    navigate(`/admin/coupons/edit/${couponId}`);
  };


  const handleCreate = () => {
    navigate('/admin/coupons/create');
  };

  if (isLoading){
    <div className="flex justify-center items-center h-screen">
    <ClipLoader color="#36D7B7" size={50} /> {/* Spinner */}
  </div>
  };
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-700">Coupon Management</h1>
      <div className="flex justify-end mb-6">
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 shadow-md"
          onClick={handleCreate}
        >
          + Add New Coupon
        </button>
      </div>

      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="border border-gray-300 px-4 py-2">Code</th>
            <th className="border border-gray-300 px-4 py-2">Type</th>
            <th className="border border-gray-300 px-4 py-2">Value</th>
            <th className="border border-gray-300 px-4 py-2">Max Discount</th>
            <th className="border border-gray-300 px-4 py-2">Min Purchase</th>
            <th className="border border-gray-300 px-4 py-2">Valid From</th>
            <th className="border border-gray-300 px-4 py-2">Valid Until</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((coupon) => (
            <tr key={coupon._id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-3">{coupon.code}</td>
              <td className="border border-gray-300 px-4 py-3 capitalize">
                {coupon.discountType}
              </td>
              <td className="border border-gray-300 px-4 py-3">
                {coupon.discountType === 'percentage'
                  ? `${coupon.discountValue}%`
                  : `₹${coupon.discountValue}`}
              </td>
              <td className="border border-gray-300 px-4 py-3">
                {coupon.maxDiscount ? `₹${coupon.maxDiscount}` : 'N/A'}
              </td>
              <td className="border border-gray-300 px-4 py-3">₹{coupon.minPurchase}</td>
              <td className="border border-gray-300 px-4 py-3">
                {new Date(coupon.validFrom).toLocaleDateString()}
              </td>
              <td className="border border-gray-300 px-4 py-3">
                {new Date(coupon.validUntil).toLocaleDateString()}
              </td>
              <td className="border border-gray-300 px-4 py-3">
                <span
                  className={`px-3 py-1 rounded-full text-white text-sm ${
                    coupon.isActive ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  {coupon.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="border border-gray-300 px-4 py-3 flex gap-4">
                <button
                  onClick={() => handleEdit(coupon._id)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FaEdit size={18} />
                </button>
                <button
                  onClick={() => toggleCouponStatus(coupon)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  {coupon.isActive ? (
                    <FaToggleOff size={18} />
                  ) : (
                    <FaToggleOn size={18} />
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CouponManagement;
