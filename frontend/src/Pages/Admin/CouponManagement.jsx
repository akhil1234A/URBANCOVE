import { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

const CouponManagement = () => {
  // Dummy data for coupons
  const [coupons, setCoupons] = useState([
    {
      _id: '1',
      code: 'DISCOUNT10',
      discount: '10',
      expiryDate: '2024-12-31',
      minPurchase: '500',
    },
    {
      _id: '2',
      code: 'SAVE20',
      discount: '20',
      expiryDate: '2024-11-30',
      minPurchase: '1000',
    },
  ]);

  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount: '',
    expiryDate: '',
    minPurchase: '',
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    // Simulate fetching coupons (we have dummy data for now)
    console.log('Fetching coupons...');
  }, []);

  const handleCreateCoupon = () => {
    const newCouponData = {
      ...newCoupon,
      _id: (coupons.length + 1).toString(),
    };
    setCoupons([...coupons, newCouponData]);
    resetForm();
  };

  const handleEditCoupon = (couponId) => {
    const coupon = coupons.find((c) => c._id === couponId);
    if (coupon) {
      setNewCoupon(coupon);
      setIsEditMode(true);
      setModalOpen(true);
    }
  };

  const handleUpdateCoupon = () => {
    setCoupons(
      coupons.map((coupon) =>
        coupon._id === newCoupon._id ? { ...coupon, ...newCoupon } : coupon
      )
    );
    resetForm();
  };

  const handleDeleteCoupon = (couponId) => {
    setCoupons(coupons.filter((coupon) => coupon._id !== couponId));
  };

  const resetForm = () => {
    setNewCoupon({ code: '', discount: '', expiryDate: '', minPurchase: '' });
    setIsEditMode(false);
    setModalOpen(false);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-700">Coupon Management</h1>

      <button
        onClick={() => setModalOpen(true)}
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 shadow-md mb-6"
      >
        + Create New Coupon
      </button>

      {/* Coupons List */}
      <div className="space-y-4">
        {coupons.map((coupon) => (
          <div
            key={coupon._id}
            className="flex items-center justify-between p-4 bg-white shadow-md rounded-md border"
          >
            <div className="flex-1">
              <p className="text-lg font-semibold">{coupon.code}</p>
              <p>{coupon.discount}% off</p>
              <p>Min Purchase: ₹{coupon.minPurchase}</p>
              <p>Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleEditCoupon(coupon._id)}
                className="text-blue-600 hover:text-blue-800"
              >
                <FaEdit size={20} />
              </button>
              <button
                onClick={() => handleDeleteCoupon(coupon._id)}
                className="text-red-600 hover:text-red-800"
              >
                <FaTrash size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-1/3 p-6">
            <h2 className="text-2xl font-bold mb-4">
              {isEditMode ? 'Edit Coupon' : 'Create Coupon'}
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Coupon Code"
                className="w-full p-3 border border-gray-300 rounded-md"
                value={newCoupon.code}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, code: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Discount (%)"
                className="w-full p-3 border border-gray-300 rounded-md"
                value={newCoupon.discount}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, discount: e.target.value })
                }
              />
              <input
                type="date"
                className="w-full p-3 border border-gray-300 rounded-md"
                value={newCoupon.expiryDate}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, expiryDate: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Min Purchase Amount"
                className="w-full p-3 border border-gray-300 rounded-md"
                value={newCoupon.minPurchase}
                onChange={(e) =>
                  setNewCoupon({ ...newCoupon, minPurchase: e.target.value })
                }
              />
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={resetForm}
                className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={isEditMode ? handleUpdateCoupon : handleCreateCoupon}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {isEditMode ? 'Update Coupon' : 'Create Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManagement;
