import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './css/Offer.css';

const EditOfferPage = () => {
  const navigate = useNavigate();
  const { offerId } = useParams(); // For editing, fetch the offer ID from the URL
  const [offer, setOffer] = useState({
    name: '',
    discount: '',
    startDate: '',
    endDate: '',
    offerType: 'category',
    selectedItems: [],
  });
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

  // For editing, load the offer details if offerId is present
  useEffect(() => {
    if (offerId) {
      const offerToEdit = offers.find((offer) => offer._id === offerId);
      if (offerToEdit) {
        setOffer(offerToEdit);
      }
    }
  }, [offerId]);

  const handleOfferTypeChange = (e) => {
    setOffer({ ...offer, offerType: e.target.value, selectedItems: [] });
  };

  const handleItemSelection = (itemId) => {
    if (offer.selectedItems.includes(itemId)) {
      setOffer({
        ...offer,
        selectedItems: offer.selectedItems.filter((id) => id !== itemId),
      });
    } else {
      setOffer({
        ...offer,
        selectedItems: [...offer.selectedItems, itemId],
      });
    }
  };

  const handleSubmit = () => {
    // Save the new offer or update the existing one
    if (offerId) {
      // Update existing offer logic
      // (you may need to dispatch an update action if you're using Redux, for example)
    } else {
      // Create new offer logic
    }

    // After saving, navigate back to the offer list
    navigate('admin/offers');
  };

  return (
    <div className="container mx-auto p-6">
      <h3 className="text-3xl font-semibold mb-6">Edit Offer Page</h3>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Offer Name"
          className="p-3 border border-gray-300 rounded-md w-full"
          value={offer.name}
          onChange={(e) => setOffer({ ...offer, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Discount (%)"
          className="p-3 border border-gray-300 rounded-md w-full"
          value={offer.discount}
          onChange={(e) => setOffer({ ...offer, discount: e.target.value })}
        />
        <div className="flex gap-4">
          <input
            type="date"
            className="p-3 border border-gray-300 rounded-md w-1/2"
            value={offer.startDate}
            onChange={(e) => setOffer({ ...offer, startDate: e.target.value })}
          />
          <input
            type="date"
            className="p-3 border border-gray-300 rounded-md w-1/2"
            value={offer.endDate}
            onChange={(e) => setOffer({ ...offer, endDate: e.target.value })}
          />
        </div>

        {/* Offer Type Dropdown */}
        <div>
          <label className="block text-lg font-medium mb-2">Offer Type</label>
          <select
            value={offer.offerType}
            onChange={handleOfferTypeChange}
            className="p-3 border border-gray-300 rounded-md w-full"
          >
            <option value="category">Category</option>
            <option value="product">Product</option>
          </select>
        </div>

        {/* Dynamic Category/Product Selection */}
        {offer.offerType === 'category' && (
          <div>
            <h4 className="text-xl font-semibold mb-2">Select Categories</h4>
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category._id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={offer.selectedItems.includes(category._id)}
                    onChange={() => handleItemSelection(category._id)}
                    className="mr-2"
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </div>
        )}

        {offer.offerType === 'product' && (
          <div>
            <h4 className="text-xl font-semibold mb-2">Select Products</h4>
            <div className="space-y-2">
              {products.map((product) => (
                <label key={product._id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={offer.selectedItems.includes(product._id)}
                    onChange={() => handleItemSelection(product._id)}
                    className="mr-2"
                  />
                  {product.name}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={() => navigate('admin/offers')}
          className="bg-gray-300 text-black py-2 px-4 rounded-md hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          {offerId ? 'Update Offer' : 'Create Offer'}
        </button>
      </div>
    </div>
  );
};

export default EditOfferPage;
