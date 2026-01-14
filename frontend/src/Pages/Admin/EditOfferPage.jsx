import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { adminAxios } from "../../utils/api";
import "./css/Offer.css";
import { fetchSubCategoriesThunk } from "../../slices/admin/subCategorySlice";
import { getOfferById, updateOffer } from "../../slices/admin/offerSlice";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

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
  const token = useSelector((state) => state.admin.token);

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await adminAxios.get(`/products/admin?limit=100`);
        setProducts(
          response.data.products.map((product) => ({
            value: product._id,
            label: `${product.productName} (₹${product.price})`,
            price: product.price,
          }))
        );
      } catch (error) {
        console.error("Error fetching products:", error.message);
      }
    };

    fetchProducts();
    dispatch(fetchSubCategoriesThunk(token));
  }, [dispatch, token]);

  useEffect(() => {
    if (offerId) {
      dispatch(getOfferById(offerId));
    }
  }, [dispatch, offerId]);

  /* ---------------- FORMAT DATA ---------------- */

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

  useEffect(() => {
    if (offerDetails) {
      setOffer((prev) => ({
        ...prev,
        name: offerDetails.name,
        discountType: offerDetails.discountType,
        discountValue: offerDetails.discountValue,
        startDate: new Date(offerDetails.startDate)
          .toISOString()
          .split("T")[0],
        endDate: new Date(offerDetails.endDate)
          .toISOString()
          .split("T")[0],
        type: offerDetails.type,
        selectedItems:
          offerDetails.products.length === 0
            ? offerDetails.categories.map((c) => c._id)
            : offerDetails.products.map((p) => p._id),
        isActive: offerDetails.isActive,
      }));
    }
  }, [offerDetails]);

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOffer((prev) => ({ ...prev, [name]: value }));
  };

  const handleOfferTypeChange = (e) => {
    setOffer((prev) => ({
      ...prev,
      type: e.target.value,
      selectedItems: [],
    }));
  };

  const handleSelectedItemsChange = (selectedOptions) => {
    setOffer((prev) => ({
      ...prev,
      selectedItems: selectedOptions.map((o) => o.value),
    }));
  };

  const handleDiscountTypeChange = (e) => {
    const discountType = e.target.value;
    setOffer((prev) => ({
      ...prev,
      discountType,
      type: discountType === "flat" ? "product" : prev.type,
      selectedItems: [],
    }));
  };

  /* ---------------- VALIDATION (UNCHANGED) ---------------- */

  const validateOffer = () => {
    const {
      name,
      discountValue,
      startDate,
      endDate,
      type,
      discountType,
      selectedItems,
    } = offer;

    if (!name || !discountValue || !startDate || !endDate) {
      toast.error("Please fill all required fields.");
      return false;
    }

    if (
      discountType === "percentage" &&
      (discountValue <= 0 || discountValue >= 50)
    ) {
      toast.error("Percentage discount value must be between 1 and 50.");
      return false;
    }

    if (discountType === "flat" && discountValue <= 0) {
      toast.error("Flat discount value must be greater than 0.");
      return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (end < today) {
      toast.error("Valid Until date cannot be in the past.");
      return false;
    }

    if (start >= end) {
      toast.error("Valid Until date must be later than Valid From date.");
      return false;
    }

    if (
      (type === "category" || type === "product") &&
      selectedItems.length === 0
    ) {
      toast.error(`Please select at least one ${type}.`);
      return false;
    }

    return true;
  };

  /* ---------------- PRODUCT LOGIC (ONLY REQUIRED CHANGES) ---------------- */

  // Dropdown options → ONLY applicable products
  const dropdownProducts =
    offer.discountType === "flat"
      ? products.filter((p) => p.price > Number(offer.discountValue || 0))
      : products;

  // Selected values → ONLY DB-selected products
  const selectedProductOptions = products.filter((p) =>
    offer.selectedItems.includes(p.value)
  );

  // Remove invalid products when flat amount changes
  useEffect(() => {
    if (offer.discountType !== "flat") return;

    const validIds = products
      .filter((p) => p.price > Number(offer.discountValue || 0))
      .map((p) => p.value);

    setOffer((prev) => ({
      ...prev,
      selectedItems: prev.selectedItems.filter((id) =>
        validIds.includes(id)
      ),
    }));
  }, [offer.discountValue, offer.discountType, products]);

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    if (!validateOffer()) return;

    const updatedOffer = {
      ...offer,
      categories: offer.type === "category" ? offer.selectedItems : [],
      products: offer.type === "product" ? offer.selectedItems : [],
    };

    try {
      await dispatch(
        updateOffer({ offerId, offerData: updatedOffer })
      ).unwrap();
      toast.success("Offer updated successfully!");
      navigate("/admin/offers");
    } catch (error) {
      toast.error("Failed to update offer.");
    }
  };

  if (offerLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} />
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="container mx-auto p-6">
      <h3 className="text-3xl font-bold mb-6 text-gray-700">Edit Offer</h3>

      <div className="space-y-4">
        <input
          name="name"
          value={offer.name}
          onChange={handleChange}
          className="p-3 border w-full"
        />

        <select
          value={offer.discountType}
          onChange={handleDiscountTypeChange}
          className="p-3 border w-full"
        >
          <option value="percentage">Percentage</option>
          <option value="flat">Flat</option>
        </select>

        <input
          type="number"
          name="discountValue"
          value={offer.discountValue}
          onChange={handleChange}
          className="p-3 border w-full"
        />

        <select
          value={offer.type}
          onChange={handleOfferTypeChange}
          className="p-3 border w-full"
        >
          {offer.discountType === "percentage" && (
            <option value="category">Category</option>
          )}
          <option value="product">Product</option>
        </select>

        {offer.type === "category" && (
          <Select
            options={formattedCategories}
            isMulti
            value={formattedCategories.filter((c) =>
              offer.selectedItems.includes(c.value)
            )}
            onChange={handleSelectedItemsChange}
          />
        )}

        {offer.type === "product" && (
          <Select
            options={dropdownProducts}
            isMulti
            value={selectedProductOptions}
            onChange={handleSelectedItemsChange}
          />
        )}

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white p-3 rounded"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditOfferPage;
