import React, { useEffect, useState } from 'react';
import { userAxios } from '../../utils/api';
import { toast } from 'react-toastify';
import Title from "../../components/User/Title";
import { PulseLoader } from 'react-spinners'

const CouponList = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await userAxios.get(`/coupons/list`);
        setCoupons(response.data.coupons);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load coupons.');
        setLoading(false);
        toast.error('Unable to fetch coupons');
      }
    };
    fetchCoupons();
  }, []);

   if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PulseLoader color="#36D7B7" size={10} /> {/* Spinner */}
      </div>
    );
  }

  if (error || coupons.length === 0) {
    return null; // Or a subtle message
  }

  return (
    <div className="mt-6">
      <div className="text-xl sm:text-2xl my-3">
        <Title text1="AVAILABLE" text2="COUPONS" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((coupon) => (
          <div 
            key={coupon._id} 
            className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold text-blue-600">{coupon.code}</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                {coupon.discountType === 'percentage' ? '%' : '₹'}
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                {coupon.discountType === 'percentage'
                  ? `${coupon.discountValue}% off (Up to ₹${coupon.maxDiscount})`
                  : `Flat ₹${coupon.discountValue} off`}
              </p>
              <p>Min Purchase: ₹{coupon.minPurchase}</p>
              <p className="text-xs text-gray-500">
                Valid: {new Date(coupon.validFrom).toLocaleDateString()} - {' '}
                {new Date(coupon.validUntil).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CouponList;