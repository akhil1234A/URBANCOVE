import { useEffect, useState } from 'react';
import { FaEdit, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import './css/Offer.css';
import { useSelector, useDispatch } from 'react-redux';
import {
  getOffers,
  addOffer,
  updateOffer,
  deactivateOffer,
} from '../../slices/admin/offerSlice';

const OfferManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { offers, loading, error } = useSelector((state) => state.offers);
  const [newOffer, setNewOffer] = useState({
    name: '',
    discount: '',
    startDate: '',
    endDate: '',
    offerType: 'category',
    selectedItems: [],
  });

 

  useEffect(() => {
    dispatch(getOffers());
  }, [dispatch]);

  

  
  const handleDeactivateOffer = async (offerId) => {
    await dispatch(deactivateOffer(offerId));
  };

  
  

 
  const handleEditOffer = (id) => {
    navigate(`/admin/offers/edit-offer/${id}`)
  };

  return (
    <div className="container mx-auto p-6">
      <h3 className="text-3xl font-semibold mb-6">Manage Offers</h3>

      
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Offers List */}
      <div className="space-y-6">
        {offers.map((offer) => (
          <div
            key={offer._id}
            className="flex flex-col md:flex-row items-start justify-between p-6 bg-white shadow-lg rounded-lg border border-gray-200"
          >
            {/* Left Section: Offer Information */}
            <div className="flex-1 mb-4 md:mb-0">
              <p className="font-semibold text-2xl text-gray-800 mb-2">{offer.name}</p>
              <p className="text-lg font-medium text-gray-700 mb-2">
                {offer.discountType === 'flat' ? `₹${offer.discountValue} off` : `${offer.discountValue}% off`}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                {new Date(offer.startDate).toLocaleDateString()} -{' '}
                {new Date(offer.endDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Offer Type:</span> {offer.type === 'category' ? 'Category' : 'Product'}
              </p>
            </div>

            {/* Right Section: Action Buttons */}
            <div className="flex gap-4 mt-4 md:mt-0">
              {/* Edit Offer */}
              <button
                onClick={() => handleEditOffer(offer._id)}
                className="flex items-center justify-center text-blue-600 hover:text-blue-800 transition duration-300"
              >
                <FaEdit size={20} />
              </button>

              {/* List/Unlist Offer */}
              {offer.isActive ? (
                <button
                  onClick={() => handleDeactivateOffer(offer._id, offer.isActive)}
                  className="flex items-center justify-center text-yellow-600 hover:text-yellow-800 transition duration-300"
                >
                  <FaTimesCircle size={20} /> Unlist
                </button>
              ) : (
                <button
                  onClick={() => handleDeactivateOffer(offer._id, offer.isActive)}
                  className="flex items-center justify-center text-green-600 hover:text-green-800 transition duration-300"
                >
                  <FaCheckCircle size={20} /> List
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add New Offer Button */}
      <div className="mt-6">
        <Link
          to="/admin/offers/create-offer"
          className="bg-green-600 text-white py-2 px-4 rounded-md shadow-md hover:bg-green-700"
        >
          + Create New Offer
        </Link>
      </div>
    </div>
  );
};

export default OfferManagement;
