import { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './css/Offer.css'

const OfferManagement = () => {
  // Dummy data for offers
  const [offers, setOffers] = useState([
    {
      _id: '1',
      name: 'Summer Sale',
      discount: '25',
      startDate: '2024-06-01',
      endDate: '2024-06-30',
      offerType: 'category', // New field to track the offer type (category/product)
      selectedItems: ['1', '3'], // Selected categories (dummy category IDs)
    },
    {
      _id: '2',
      name: 'Black Friday Deal',
      discount: '40',
      startDate: '2024-11-24',
      endDate: '2024-11-26',
      offerType: 'product', // Offer is for products
      selectedItems: ['2'], // Selected product IDs (dummy products)
    },
  ]);

  const [categories, setCategories] = useState([
    { _id: '1', name: 'Electronics' },
    { _id: '2', name: 'Clothing' },
    { _id: '3', name: 'Home & Kitchen' },
  ]);

  const [products, setProducts] = useState([
    { _id: '1', name: 'Laptop' },
    { _id: '2', name: 'T-shirt' },
    { _id: '3', name: 'Blender' },
  ]);

  const [newOffer, setNewOffer] = useState({
    name: '',
    discount: '',
    startDate: '',
    endDate: '',
    offerType: 'category', // Default type is category
    selectedItems: [],
  });

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    console.log('Fetching offers...');
  }, []);

  const handleCreateOffer = () => {
    const newOfferData = {
      ...newOffer,
      _id: (offers.length + 1).toString(), // Generate a new unique ID
    };
    setOffers([...offers, newOfferData]);
    closeModal();
  };

  const handleEditOffer = (offerId) => {
    const offer = offers.find((o) => o._id === offerId);
    if (offer) {
      setNewOffer(offer);
      setEditMode(true);
      setModalIsOpen(true);
    }
  };

  const handleUpdateOffer = () => {
    setOffers(
      offers.map((offer) =>
        offer._id === newOffer._id ? { ...offer, ...newOffer } : offer
      )
    );
    closeModal();
  };

  const handleDeleteOffer = (offerId) => {
    setOffers(offers.filter((offer) => offer._id !== offerId));
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setNewOffer({ name: '', discount: '', startDate: '', endDate: '', offerType: 'category', selectedItems: [] });
    setEditMode(false);
  };

  const handleOfferTypeChange = (e) => {
    setNewOffer({ ...newOffer, offerType: e.target.value, selectedItems: [] });
  };

  const handleItemSelection = (itemId) => {
    if (newOffer.selectedItems.includes(itemId)) {
      setNewOffer({
        ...newOffer,
        selectedItems: newOffer.selectedItems.filter((id) => id !== itemId),
      });
    } else {
      setNewOffer({
        ...newOffer,
        selectedItems: [...newOffer.selectedItems, itemId],
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h3 className="text-3xl font-semibold mb-6">Manage Offers</h3>

      {/* Offers List */}
      <div className="space-y-4">
        {offers.map((offer) => (
          <div
            key={offer._id}
            className="flex items-center justify-between p-4 bg-white shadow-md rounded-md border"
          >
            <div className="flex-1">
              <p className="font-semibold text-xl">{offer.name}</p>
              <p>{offer.discount}% off</p>
              <p>
                {new Date(offer.startDate).toLocaleDateString()} -{' '}
                {new Date(offer.endDate).toLocaleDateString()}
              </p>
              <p>Offer Type: {offer.offerType === 'category' ? 'Category' : 'Product'}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleEditOffer(offer._id)}
                className="text-blue-600 hover:text-blue-800"
              >
                <FaEdit size={20} />
              </button>
              <button
                onClick={() => handleDeleteOffer(offer._id)}
                className="text-red-600 hover:text-red-800"
              >
                <FaTrash size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Offer Button */}
      <div className="mt-6">
        <button
          as={Link}
          to="admin/create-offer"
          className="bg-green-600 text-white py-2 px-4 rounded-md shadow-md hover:bg-green-700"
        >
          + Create New Offer
        </button>
      </div>

     
    </div>
  );
};

export default OfferManagement;
