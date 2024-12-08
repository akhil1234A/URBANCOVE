import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { adminAxios } from "../../utils/api";
import "./css/Offer.css";
import { fetchSubCategoriesThunk } from "../../slices/admin/subCategorySlice";
import { getOfferById, updateOffer } from "../../slices/admin/offerSlice";
import { toast } from "react-toastify";

const EditOfferPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id: offerId } = useParams();

  const [offer, setOffer] = useState({
    name: "",
    discountType: "percentage",
    discountValue: "",
    startDate: "",
    endDate: "",
    type: "category",
    selectedItems: [],
    isActive: false,
  });

  const [products, setProducts] = useState([]);
  const [formattedCategories, setFormattedCategories] = useState([]);

  const { list: categories, loading: categoriesLoading } = useSelector(
    (state) => state.subCategories
  );
  const { offerDetails, loading: offerLoading } = useSelector(
    (state) => state.offers
  );

  console.log(offerDetails);

  const token = useSelector((state) => state.admin.token);

  // Format categories for dropdown
  useEffect(() => {
    if (categories.length > 0) {
      setFormattedCategories(
        categories.map((cat) => ({
          value: cat._id,
          label: `${cat.category.category} - ${cat.subCategory}`,
        }))
      );
    }
  }, [categories]);

  // Fetch products for dropdown
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await adminAxios.get(
          `admin/products?limit=100`
        );
        setProducts(
          response.data.products.map((product) => ({
            value: product._id,
            label: product.productName,
          }))
        );
      } catch (error) {
        console.error("Error fetching products:", error.message);
      }
    };

    fetchProducts();
    dispatch(fetchSubCategoriesThunk(token));
  }, [dispatch, token]);

  // Fetch offer details
  useEffect(() => {
    if (offerId) {
      dispatch(getOfferById(offerId));
    }
  }, [dispatch, offerId]);

  // Populate offer data
  useEffect(() => {
    if (offerDetails) {
      setOffer((prev) => ({
        ...prev,
        name: offerDetails.name,
        discountType: offerDetails.discountType,
        discountValue: offerDetails.discountValue,
        startDate: new Date(offerDetails.startDate).toISOString().split("T")[0],
        endDate: new Date(offerDetails.endDate).toISOString().split("T")[0],
        type: offerDetails.type,
        selectedItems:
          offerDetails.products.length == 0
            ? offerDetails.categories.map((cat) => cat._id)
            : offerDetails.products.map((prod) => prod._id),
        isActive: offerDetails.isActive,
      }));
    }
  }, [offerDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOffer((prev) => ({ ...prev, [name]: value }));
  };

  const handleOfferTypeChange = (e) => {
    setOffer((prev) => ({
      ...prev,
      type: e.target.value,
      selectedItems: [], // Reset selectedItems on type change
    }));
  };

  const handleSelectedItemsChange = (selectedOptions) => {
    const selectedValues = selectedOptions.map((option) => option.value);
    setOffer((prev) => ({ ...prev, selectedItems: selectedValues }));
  };

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
  
    // if (start < today) {
    //   toast.error('Valid From date cannot be in the past.');
    //   return false;
    // }
  
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

    const updatedOffer = {
      ...offer,
      categories: offer.type === "category" ? offer.selectedItems : [],
      products: offer.type === "product" ? offer.selectedItems : [],
    };

    try {
      await dispatch(updateOffer({ offerId, offerData: updatedOffer })).unwrap();
      toast.success("Offer updated successfully!");
      navigate("/admin/offers");
    } catch (error) {
      console.error("Error updating offer:", error);
      toast.error("Failed to update offer. Please try again.");
    }
  };

  if (offerLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h3 className="text-3xl font-bold mb-6 text-gray-700">Edit Offer</h3>

      <div className="space-y-4">
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Offer Name"
          className="p-3 border border-gray-300 rounded-md w-full"
          value={offer.name}
          onChange={handleChange}
        />

        <select
          name="discountType"
          value={offer.discountType}
          onChange={handleChange}
          className="p-3 border border-gray-300 rounded-md w-full"
        >
          <option value="percentage">Percentage</option>
          <option value="flat">Flat</option>
        </select>

        <input
          type="number"
          name="discountValue"
          placeholder="Discount Value"
          className="p-3 border border-gray-300 rounded-md w-full"
          value={offer.discountValue}
          onChange={handleChange}
        />
        <div className="flex gap-4">
          <input
            type="date"
            name="startDate"
            className="p-3 border border-gray-300 rounded-md w-1/2"
            value={offer.startDate}
            onChange={handleChange}
          />
          <input
            type="date"
            name="endDate"
            className="p-3 border border-gray-300 rounded-md w-1/2"
            value={offer.endDate}
            onChange={handleChange}
          />
        </div>

        <select
          value={offer.type}
          onChange={handleOfferTypeChange}
          className="p-3 border border-gray-300 rounded-md w-full"
        >
          <option value="category">Category</option>
          <option value="product">Product</option>
        </select>

        {offer.type === "category" && (
          <Select
            options={formattedCategories}
            isMulti
            value={formattedCategories.filter((cat) =>
              offer.selectedItems.includes(cat.value)
            )}
            onChange={handleSelectedItemsChange}
          />
        )}

        {offer.type === "product" && (
          <Select
            options={products}
            isMulti
            value={products.filter((prod) =>
              offer.selectedItems.includes(prod.value)
            )}
            onChange={handleSelectedItemsChange}
          />
        )}

        <button
          onClick={handleSubmit}
          className="p-3 bg-blue-500 text-white rounded-md"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditOfferPage;
