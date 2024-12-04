import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addCoupon } from '../../slices/admin/couponSlice';
import { toast } from 'react-toastify'; 

const CreateCoupon = () => {
  const [couponData, setCouponData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    maxDiscount: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
    minPurchase: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.coupons);

  const today = new Date(); 
  today.setHours(0, 0, 0, 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'validUntil' && couponData.validFrom && value < couponData.validFrom) {
      toast.error('Valid Until date cannot be earlier than Valid From date');
      return;
    }
    if (name === 'validFrom' && couponData.validUntil && value > couponData.validUntil) {
      toast.error('Valid From date cannot be later than Valid Until date');
      return;
    }

    setCouponData({
      ...couponData,
      [name]: value,
    });
  };

 const handleSubmit = (e) => {
  e.preventDefault();

  // Validation
  if (!couponData.code.trim()) {
    toast.error('Coupon Code is required');
    return;
  }
  if (!couponData.discountValue || couponData.discountValue <= 0) {
    toast.error('Discount Value must be greater than 0');
    return;
  }
  if (!Number.isInteger(couponData.discountValue * 100)) {
    toast.error('Discount Value can have up to 2 decimal places only');
    return;
  }
  if (couponData.discountType === 'percentage' && couponData.discountValue > 100) {
    toast.error('Percentage discount cannot exceed 100%');
    return;
  }
  if (couponData.discountType === 'percentage' && (!couponData.maxDiscount || couponData.maxDiscount <= 0)) {
    toast.error('Max Discount is required and must be greater than 0 for percentage discounts');
    return;
  }
  if (!couponData.validFrom) {
    toast.error('Valid From date is required');
    return;
  }
  if (!couponData.validUntil) {
    toast.error('Valid Until date is required');
    return;
  }
  if (new Date(couponData.validFrom) >= new Date(couponData.validUntil)) {
    toast.error('Valid From date must be earlier than Valid Until date');
    return;
  }
  if (new Date(couponData.validFrom) < today) {
    toast.error('Valid From date cannot be in the past');
    return;
  }
  if (new Date(couponData.validUntil) < new Date()) {
    toast.error('Valid Until date cannot be in the past');
    return;
  }
  if (!couponData.usageLimit || couponData.usageLimit <= 0) {
    toast.error('Usage Limit must be greater than 0');
    return;
  }
  if (!couponData.minPurchase || couponData.minPurchase <= 0) {
    toast.error('Minimum Purchase Amount must be greater than 0');
    return;
  }

  // Disable button while submitting
  setIsSubmitting(true);

  dispatch(addCoupon(couponData))
    .unwrap()
    .then(() => {
      toast.success('Coupon Created Successfully!', { autoClose: 3000 });
      resetForm();
    })
    .catch((err) => {
      const errorMessage = err.message || 'An unexpected error occurred';
      toast.error(`Error: ${errorMessage}`, { autoClose: 5000 });
    })
    .finally(() => setIsSubmitting(false));
};

  

  const resetForm = () => {
    setCouponData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      maxDiscount: '',
      validFrom: '',
      validUntil: '',
      usageLimit: '',
      minPurchase: '',
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-700">Create Coupon</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow-md rounded-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Coupon Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="code"
            value={couponData.code}
            onChange={handleInputChange}
            placeholder="Enter Coupon Code"
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount Type
          </label>
          <select
            name="discountType"
            value={couponData.discountType}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-md"
          >
            <option value="percentage">Percentage</option>
            <option value="flat">Flat</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount Value <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="discountValue"
            value={couponData.discountValue}
            onChange={handleInputChange}
            placeholder="Enter Discount Value"
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>

        {couponData.discountType === 'percentage' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Discount Amount
            </label>
            <input
              type="number"
              name="maxDiscount"
              value={couponData.maxDiscount}
              onChange={handleInputChange}
              placeholder="Enter Max Discount (Optional)"
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valid From <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="validFrom"
            value={couponData.validFrom}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valid Until <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="validUntil"
            value={couponData.validUntil}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Usage Limit
          </label>
          <input
            type="number"
            name="usageLimit"
            value={couponData.usageLimit}
            onChange={handleInputChange}
            placeholder="Enter Usage Limit (Optional)"
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Purchase Amount
          </label>
          <input
            type="number"
            name="minPurchase"
            value={couponData.minPurchase}
            onChange={handleInputChange}
            placeholder="Enter Minimum Purchase Amount (Optional)"
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <div className="flex gap-4 mt-6">
          <button
            type="reset"
            onClick={resetForm}
            className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Reset
          </button>
          <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-600 text-white px-4 py-2 rounded-md ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            >
              {isSubmitting ? 'Submitting...' : 'Create Coupon'}
          </button>

        </div>
      </form>
    </div>
  );
};

export default CreateCoupon;
