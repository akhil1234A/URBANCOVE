import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ImageUpload from '../../components/Admin/ImageUpload';
import ImageCropper from '../../components/Admin/ImageCropper';
import { toast } from 'react-toastify';
import { fetchCategories, fetchSubCategoriesByCategory } from '../../slices/admin/categorySlice';
import { editProduct } from '../../slices/admin/productSlice';
import { useNavigate, useParams } from 'react-router-dom';

const EditProduct = () => {
  const dispatch = useDispatch();
  const { id: productId } = useParams();
  const navigate = useNavigate();

  const categories = useSelector((state) => state.categories.categories);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([null, null, null, null]);
  const [croppedImages, setCroppedImages] = useState([null, null, null, null]);
  const [cropperOpen, setCropperOpen] = useState([false, false, false, false]);

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
      if (!dataURL.startsWith('data:')) {
        console.error('Invalid data URL:', dataURL);
        return null;
      }
      const arr = dataURL.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    } catch (error) {
      console.error('Error converting data URL to Blob:', error);
      return null;
    }
  };

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [bestseller, setBestseller] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const defaultQuantities = {
    S: 10,
    M: 15,
    L: 20,
    XL: 25,
    XXL: 30,
  };

  const [sizes, setSizes] = useState(['L', 'XL']);
  const [stock, setStock] = useState(defaultQuantities);
  const [totalStock, setTotalStock] = useState(0); // Define totalStock as state
  const [cStock, setCStock] = useState(0)
  const calculateTotalStock = (selectedSizes, stockData) => {
    return selectedSizes.reduce((acc, size) => acc + (stockData[size] || 0), 0);
  };

  useEffect(() => {
    const total = calculateTotalStock(sizes, stock);
    setTotalStock(total);
  }, [sizes, stock]);
  
 
  const handleSizeSelection = (size) => {
    setSizes((prevSizes) => {
      const newSizes = prevSizes.includes(size)
        ? prevSizes.filter((s) => s !== size)
        : [...prevSizes, size];
        const updatedTotalStock = calculateTotalStock(newSizes, stock);
        setTotalStock(updatedTotalStock);
      return newSizes;
    });
  };

const [initialSizes, setInitialSizes] = useState([]);
const [initialTotalStock, setInitialTotalStock] = useState(0);
const [initialSubCategory, setInitialSubCategory] = useState('');

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('adminToken');

    try {
      // Validate required fields
      if (!name || !selectedCategory || price <= 0) {
        toast.error('Ensure all fields are filled, and price is positive');
        return;
      }
      // Check if each image exists and has been cropped if required
      for (let index = 0; index < images.length; index++) {
        if (images[index] && !croppedImages[index]) {
          toast.error(`Please crop the image at index ${index + 1} before submitting.`);
          return;
        }
      }

      const formData = new FormData();

      formData.append('productName', name);
      formData.append('productDescription', description);
      formData.append('category', selectedCategory);
      formData.append('subCategory', selectedSubCategory || initialSubCategory);
      formData.append('price', parseFloat(price));
      formData.append('isBestSeller', bestseller);
  
      if (JSON.stringify(sizes) !== JSON.stringify(initialSizes)) {
        sizes.forEach((size) => {
          formData.append('size[]', size);
        });
      }
  
      // Append stock if it has changed
      if (totalStock !== initialTotalStock) {
        formData.append('stock', totalStock);
      }
      // Handle images (ensure they are either original or cropped)
      for (let index = 0; index < images.length; index++) {
        let file;

        if (croppedImages[index]) {
          console.log(`Using cropped image at index ${index}`);
          file = dataURLToBlob(croppedImages[index]);
        } else if (images[index]) {
          console.log(`Using original image at index ${index}`);

          if (images[index] instanceof File) {
            file = images[index];
          } else if (typeof images[index] === 'string' && images[index].startsWith('data:')) {
            file = dataURLToBlob(images[index]);
          }
        }

        if (file) {
          console.log('Appending image to FormData:', file);
          formData.append('images', file, `image-${Date.now()}-${index}.png`);
        }
      }

      console.log('images:', images);
      console.log('croppedImages:', croppedImages);

      // Send the request
      const resultAction = await dispatch(editProduct({ productId, productData: formData, token }));

      if (editProduct.fulfilled.match(resultAction)) {
        toast.success('Product updated successfully!');
        navigate(`/admin/products/view`);
        resetForm();
      } else {
        toast.error(resultAction.payload || 'Error updating product. Please try again.');
      }
    } catch (error) {
      console.error('API Error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setImages([null, null, null, null]);
    setCroppedImages([null, null, null, null]);
    setSizes(['L', 'XL']);  // Or preserve the fetched sizes
    setBestseller(false);
    setCropperOpen([false, false, false, false]);
    setStock(defaultQuantities);
    setSubCategories([]);
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    dispatch(fetchCategories(token));
  }, [dispatch]);

  useEffect(() => {
    if (selectedCategory) {
      const token = localStorage.getItem('adminToken');
      dispatch(fetchSubCategoriesByCategory({ categoryId: selectedCategory, token }))
        .then((response) => {
          if (fetchSubCategoriesByCategory.fulfilled.match(response)) {
            setSubCategories(response.payload);
            if (selectedSubCategory) {
              setSelectedSubCategory(selectedSubCategory._id);
            }
          } else {
            toast.error('Error fetching subcategories.');
          }
        });
    }
  }, [selectedCategory, dispatch]);

  useEffect(() => {
    const fetchProduct = async () => {
      const token = localStorage.getItem('adminToken');
      try {
        const response = await fetch(`http://localhost:3000/admin/products?productId=${productId}&isAdmin=true`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const productX = await response.json();
        const productData = productX.products;
        console.log(productData);
        if (response.ok && productData) {
          setName(productData[0].productName);
          setDescription(productData[0].productDescription);
          setPrice(productData[0].price);
          setStock((prev) => ({
              ...prev,
              ...productData[0].stockQuantities,  // Ensure stockQuantities aligns with your data structure
          }));
          setCStock(productData[0].stock);
          setBestseller(productData[0].isBestSeller);
          setSizes(productData[0].sizes || []);  // Populate sizes from fetched data
          setSelectedCategory(productData[0].category._id);
          setSelectedSubCategory(productData[0].subCategory._id);
          setInitialSizes(productData[0].sizes || []);
          setInitialTotalStock(totalStock);
          setInitialSubCategory(productData[0].subCategory._id);
          setLoadingData(false);
      } else {
          toast.error(productData.message || 'Failed to load product');
      }


      } catch (error) {
        toast.error('An error occurred while fetching the product');
        console.error(error);
        setLoadingData(false);
      }
    };

    fetchProduct();
  }, [productId]);

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-4 p-5 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>

      <ImageUpload images={images} setImages={setImages} setCropperOpen={setCropperOpen} />

      {images.map((image, index) => {
        return cropperOpen[index] ? (
          <ImageCropper
            key={index}
            imageURL={image}
            setCroppedImage={(croppedImage) => setCroppedImage(index, croppedImage)}
            setCropperOpen={setCropperOpen}
            onCropComplete={() => handleCropComplete(index)}
          />
        ) : null;
      })}

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
            value={selectedSubCategory || ''}
            onChange={(e) => setSelectedSubCategory(e.target.value)}
            className="w-full max-w-md border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {subCategories.length > 0 ? (
              subCategories.map((subCategory) => (
                <option key={subCategory._id} value={subCategory._id}>
                  {subCategory.subCategory}
                </option>
              ))
            ) : (
              <option value="" disabled>
                Select a category first
              </option>
            )}
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
          <label className="block mb-2">Fetched Stock</label>
          <input
            value={cStock || 0}
            className="w-full max-w-md border border-gray-300 px-3 py-2 rounded focus:outline-none bg-gray-100 cursor-not-allowed"
            readOnly
          />
        </div>

        <div className="w-full">
          <label className="block mb-2">Overall Stock</label>
          <input
            value={totalStock || ''}
            className="w-full max-w-md border border-gray-300 px-3 py-2 rounded focus:outline-none bg-gray-100 cursor-not-allowed"
            readOnly
          />
        </div>
      </div>

      {/* Product sizes with default stock */}
      <div className="w-full">
        <p className="mb-2">Product Sizes</p>
        <div className="flex gap-3">
          {Object.keys(defaultQuantities).map((size) => (
            <div key={size} className="flex items-center">
              <input
                type="checkbox"
                checked={sizes.includes(size)}
                onChange={() => handleSizeSelection(size)}
              />
              <label className="ml-2">{size}</label>
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
        {loading ? 'Updating...' : 'Update Product'}
      </button>
    </form>
  );
};

export default EditProduct;
