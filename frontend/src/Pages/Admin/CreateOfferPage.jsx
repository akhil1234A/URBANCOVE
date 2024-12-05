import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import axios from 'axios';
import './css/Offer.css';
import { fetchSubCategoriesThunk } from '../../slices/admin/subCategorySlice'; 
import { addOffer } from '../../slices/admin/offerSlice';
import { toast } from 'react-toastify'; 


const CreateOfferPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [offer, setOffer] = useState({
    name: '',
    discountType: 'percentage',
    discountValue: '',
    startDate: '',
    endDate: '',
    offerType: 'category',
    selectedItems: [],
  });

  const [products, setProducts] = useState([]);
  const { list: categories, loading: categoriesLoading, error } = useSelector((state) => state.subCategories);
  const token = useSelector((state) => state.admin.token);
  const [formattedCategories, setFormattedCategories] = useState([]);

  useEffect(() => {
    if (categories && categories.length > 0) {
      const formatted = categories.map((cat) => ({
        _id: cat._id,
        name: `${cat.category.category} - ${cat.subCategory}`,
      }));
      setFormattedCategories(formatted); 
    }
  }, [categories]);

  useEffect(() => {
    dispatch(fetchSubCategoriesThunk(token));

    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/products?limit=100`);
        const formattedProducts = response.data.products.map((product) => ({
          value: product._id,
          label: product.productName,
        }));
        setProducts(formattedProducts);
      } catch (error) {
        console.error('Error fetching products:', error.message);
      }
    };

    fetchProducts();
  }, [dispatch]);

  const handleOfferTypeChange = (e) => {
    setOffer({ ...offer, offerType: e.target.value, selectedItems: [] });
  };

  const handleSelectedItemsChange = (selectedOptions) => {
    const selectedIds = selectedOptions.map((option) => option.value);
    setOffer({ ...offer, selectedItems: selectedIds });
  };

  // Validate the offer fields
  const validateOffer = () => {
    const { name, discountValue, startDate, endDate, offerType, discountType, selectedItems } = offer;
  
    // Ensure required fields are filled
    if (!name || !discountValue || !startDate || !endDate) {
      toast.error('Please fill all required fields.');
      return false;
    }
  
    // Validate discount value
    if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
      toast.error('Percentage discount value must be between 1 and 100.');
      return false;
    }
    if (discountType === 'flat' && discountValue <= 0) {
      toast.error('Flat discount value must be greater than 0.');
      return false;
    }
  
    // Validate date format and logic
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight
  
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      toast.error('Invalid date format.');
      return false;
    }
  
    if (start < today) {
      toast.error('Valid From date cannot be in the past.');
      return false;
    }
  
    if (end < today) {
      toast.error('Valid Until date cannot be in the past.');
      return false;
    }
  
    if (start >= end) {
      toast.error('Valid Until date must be later than Valid From date.');
      return false;
    }
  
    // Validate selection
    if ((offerType === 'category' || offerType === 'product') && selectedItems.length === 0) {
      toast.error(`Please select at least one ${offerType}.`);
      return false;
    }
  
    return true;
  };
  
  const handleSubmit = async () => {
    if (!validateOffer()) return;

    try {
      await dispatch(addOffer(offer)).unwrap();
      toast.success('Offer created successfully!');
      navigate('/admin/offers');
    } catch (error) {
      console.error('Error creating offer:', error);
      toast.error('Failed to create offer. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h3 className="text-3xl font-bold mb-6 text-gray-700">Create Offer</h3>

      <div className="space-y-4">
        {/* Offer Name */}
        <input
          type="text"
          placeholder="Offer Name"
          className="p-3 border border-gray-300 rounded-md w-full"
          value={offer.name}
          onChange={(e) => setOffer({ ...offer, name: e.target.value })}
        />

        {/* Discount Type */}
        <div>
          <label className="block text-lg font-medium mb-2">Discount Type</label>
          <select
            value={offer.discountType}
            onChange={(e) => setOffer({ ...offer, discountType: e.target.value })}
            className="p-3 border border-gray-300 rounded-md w-full"
          >
            <option value="percentage">Percentage</option>
            <option value="flat">Flat</option>
          </select>
        </div>

        {/* Discount Value */}
        <input
          type="number"
          placeholder="Discount Value"
          className="p-3 border border-gray-300 rounded-md w-full"
          value={offer.discountValue}
          onChange={(e) => setOffer({ ...offer, discountValue: e.target.value })}
        />


        {/* Date Range */}
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

        {/* Offer Type */}
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

        {/* Category/Product Selection */}
        {offer.offerType === 'category' && (
          <div>
            <h4 className="text-xl font-semibold mb-2">Select Categories</h4>
            {categoriesLoading ? (
              <p>Loading categories...</p>
            ) : (
              <Select
                options={formattedCategories.map((cat) => ({
                  value: cat._id,
                  label: cat.name,
                }))}
                isMulti
                value={formattedCategories
                  .map((cat) => ({ value: cat._id, label: cat.name }))
                  .filter((c) => offer.selectedItems.includes(c.value))}
                onChange={handleSelectedItemsChange}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            )}
          </div>
        )}

        {offer.offerType === 'product' && (
          <div>
            <h4 className="text-xl font-semibold mb-2">Select Products</h4>
            <Select
              options={products}
              isMulti
              value={products.filter((p) => offer.selectedItems.includes(p.value))}
              onChange={handleSelectedItemsChange}
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={() => navigate('/admin/offers')}
          className="bg-gray-300 text-black py-2 px-4 rounded-md hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Create Offer
        </button>
      </div>
    </div>
  );
};

export default CreateOfferPage;
