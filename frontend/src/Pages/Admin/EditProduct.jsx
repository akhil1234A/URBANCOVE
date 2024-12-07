import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ImageUpload from "../../components/Admin/EditImageUpload";
import ImageCropper from "../../components/Admin/EditImageCropper";
import { fetchCategories, fetchSubCategoriesByCategory } from '../../slices/admin/categorySlice';
import { toast } from "react-toastify";
import { editProduct } from "../../slices/admin/productSlice";
import { useNavigate, useParams } from "react-router-dom";
import { selectProductById, fetchProductsForAdmin } from "../../slices/admin/productSlice";

const EditProduct = () => {
  const dispatch = useDispatch();
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const productData = useSelector((state) => selectProductById(state, productId));

  const categories = useSelector((state) => state.categories.categories);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState([]);


  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [images, setImages] = useState([]);
  const [croppedImages, setCroppedImages] = useState([]);
  const [cropperOpen, setCropperOpen] = useState([]);
  const [isNewImage, setIsNewImage] = useState([]);
  const [removedIndices, setRemovedIndices] = useState([]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState(['L', 'XL']);
  const [stock, setStock] = useState(0);
 

  const setCroppedImage = (index, croppedImage) => {
    const newCroppedImages = [...croppedImages];
    newCroppedImages[index] = croppedImage;
    setCroppedImages(newCroppedImages);
  };

  const handleCropComplete = (index) => {
    setCropperOpen((prev) => {
      const newOpen = [...prev];
      newOpen[index] = false;
      return newOpen;
    });
  };

  const dataURLToBlob = (dataURL) => {
    try {
      if (!dataURL.startsWith("data:")) {
        console.error("Invalid data URL:", dataURL);
        return null;
      }
      const arr = dataURL.split(",");
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    } catch (error) {
      console.error("Error converting data URL to Blob:", error);
      return null;
    }
  };

  const handleRemoveImage = (index) => {
    setRemovedIndices((prev) => [...prev, index]);

    setImages((prev) => {
      const newImages = [...prev];
      newImages[index] = null;
      return newImages;
    });

    setCroppedImages((prev) => {
      const newCropped = [...prev];
      newCropped[index] = null;
      return newCropped;
    });

    setIsNewImage((prev) => {
      const newIsNewImage = [...prev];
      newIsNewImage[index] = false;
      return newIsNewImage;
    });
  };

  const handleSizeSelection = (size) => {
    setSizes((prevSizes) => {
      if (prevSizes.includes(size)) {
        return prevSizes.filter((s) => s !== size);
      }
      return [...prevSizes, size];
    });
  };


  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("adminToken");

    try {

    // Validate required fields
    if (!name || !selectedCategory || price <= 0) {
      toast.error('Ensure all fields are filled, and price is positive');
       return;
    }



      // Check if images are cropped before submitting
      for (let index = 0; index < images.length; index++) {
        if (images[index] && !croppedImages[index] && isNewImage[index]) {
          toast.error(`Please crop the image at index ${index + 1} before submitting.`);
          return;
        }
      }

      const formData = new FormData();

      formData.append('productName', name);
      formData.append('productDescription', description);
      formData.append('category', selectedCategory);
      formData.append('subCategory', selectedSubCategory);
      formData.append('price', parseFloat(price));
      formData.append('isBestSeller', bestseller);
      formData.append('stock', stock); 
      sizes.forEach((size) => formData.append('size[]', size));

      // Attach images
      for (let index = 0; index < images.length; index++) {
        if (images[index] && croppedImages[index] && isNewImage[index]) {
          const file = dataURLToBlob(croppedImages[index]);
          formData.append("images", file, `image-${Date.now()}-${index}.png`);
        }
      }

      // Attach removed indices
      formData.append("removeImages", removedIndices.join(","));

      const resultAction = await dispatch(editProduct({ productId, productData: formData, token }));

      if (editProduct.fulfilled.match(resultAction)) {
        toast.success("Product updated successfully!");
        navigate(`/admin/products/view`);
      } else {
        toast.error(resultAction.payload || "Error updating product. Please try again.");
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productData) {
      setName(productData.productName);
      setDescription(productData.productDescription);
      setPrice(productData.price);
      setStock(productData.stock);
      setBestseller(productData.isBestSeller);
      setSizes(productData.size || []);
      setSelectedCategory(productData.category._id);
      setSelectedSubCategory(productData.subCategory._id);
      setLoadingData(false);
      console.log("Product Data Loaded:", productData);
    } else {
      toast.error('Failed to load product data from the store.');
      setLoadingData(false);
    }
  }, [productData]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!productData) {
      dispatch(fetchProductsForAdmin({ token, page: 1, limit: 100 }));
    }

    if (productData && productData.images) {
      setImages(productData.images);
      setCroppedImages(new Array(productData.images.length).fill(null));
      setCropperOpen(new Array(productData.images.length).fill(false));
      setIsNewImage(new Array(productData.images.length).fill(false));
    }
  }, [productId, dispatch, productData]);

   //useffect for fetching categories 
   useEffect(() => {
    const token = localStorage.getItem('adminToken');
    dispatch(fetchCategories(token));
    console.log("Fetching Categories...");
  }, [dispatch]);


//useeffect for populating selected categories 
  useEffect(() => {
    if (selectedCategory) {
      console.log("Selected Category:", selectedCategory);
      const token = localStorage.getItem('adminToken');
      dispatch(fetchSubCategoriesByCategory({ categoryId: selectedCategory, token }))
        .then((response) => {
          if (fetchSubCategoriesByCategory.fulfilled.match(response)) {
            console.log("Fetched SubCategories:", response.payload);
            setSubCategories(response.payload);
          } else {
            toast.error('Error fetching subcategories.');
          }
        });
    }
  }, [selectedCategory, dispatch]);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col w-full items-start gap-4 p-5 bg-white rounded shadow-md"
    >
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>

      <div className="space-y-4">
        <ImageUpload
          images={images}
          setImages={setImages}
          setCropperOpen={setCropperOpen}
          setIsNewImage={setIsNewImage}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {images.map((image, index) => (
            cropperOpen[index] ? (
              <ImageCropper
                key={index}
                imageURL={image}
                setCroppedImage={(croppedImage) => setCroppedImage(index, croppedImage)}
                setCropperOpen={setCropperOpen}
                onCropComplete={() => handleCropComplete(index)}
              />
            ) : (
              image && (
                <div key={index} className="flex flex-col items-center space-y-4">
                  <img
                    src={croppedImages[index] || image}
                    alt={`Image preview ${index + 1}`}
                    className="w-36 h-36 object-cover rounded-lg shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition"
                  >
                    Remove
                  </button>
                </div>
              )
            )
          ))}
        </div>
      </div>

      {/* Product name */}
 <div className="w-full">
        <label className="block mb-2">Product Name</label>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name || ''}
          className="w-full max-w-md border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          type="text"
          placeholder="Type here"
          required
        />
      </div>

      {/* Product description */}
      <div className="w-full">
        <label className="block mb-2">Product Description</label>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description || ''}           className="w-full max-w-md border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type here"
          required
        />
      </div>

      {/* Category, subcategory, price, stock */}
      <div className="flex gap-4">
        <div className="w-full">
          <label htmlFor="category" className="block mb-2">
            Category
          </label>
          <select
            id="category"
            value={selectedCategory || ''} 
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedSubCategory('');
              setSubCategories([]);
            }}
            className="w-full max-w-md border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.category}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full">
          <label htmlFor="subCategory" className="block mb-2">
            Subcategory
          </label>
          <select
            id="subCategory"
            value={selectedSubCategory}
            onChange={(e) => setSelectedSubCategory(e.target.value)}
            className="w-full max-w-md border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
          <option value="">Select a subcategory</option>
          {subCategories.map((subCategory) => (
            <option key={subCategory._id} value={subCategory._id}>
              {subCategory.subCategory}
            </option>
          ))}
          </select>
        </div>

        <div className="w-full">
          <label className="block mb-2">Product Price</label>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price || 0} 
            className="w-full max-w-md border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="number"
            placeholder="Enter price (e.g., 25)"
            required
          />
        </div>

        <div className="w-full">
          <label className="block mb-2">Stock</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="w-full px-3 py-2 border rounded"
          />

        </div>
      </div>

      {/* Product sizes with default stock */}
      <div className="w-full">
        <p className="mb-2">Product Sizes</p>
        <div className="flex gap-3">
        {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
            <div key={size} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={sizes.includes(size)}
                onChange={() => handleSizeSelection(size)}
              />
              <label>{size}</label>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center">
        <input type="checkbox" checked={bestseller} onChange={() => setBestseller(!bestseller)} />
        <label className="ml-2">Best Seller</label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`mt-4 w-full max-w-md px-4 py-2 text-white bg-blue-600 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? "Updating..." : "Update Product"}
      </button>
    </form>
  );
};

export default EditProduct;

