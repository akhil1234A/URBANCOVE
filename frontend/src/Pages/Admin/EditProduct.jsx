import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ImageUpload from '../../components/Admin/EditImageUpload';
import ImageCropper from '../../components/Admin/ImageCropper';
import { toast } from 'react-toastify';
import { fetchCategories, fetchSubCategoriesByCategory } from '../../slices/admin/categorySlice';
import { editProduct } from '../../slices/admin/productSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { selectProductById, fetchProductsForAdmin } from '../../slices/admin/productSlice';

const EditProduct = () => {
  const dispatch = useDispatch();
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const productData = useSelector((state) => selectProductById(state, productId));


  //State Variables 
  const categories = useSelector((state) => state.categories.categories);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [images, setImages] = useState([null, null, null, null]);
  const [croppedImages, setCroppedImages] = useState([null, null, null, null]);
  const [cropperOpen, setCropperOpen] = useState([false, false, false, false]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState(['L', 'XL']);
  const [stock, setStock] = useState(0);
 

 

  //Helper Functions 
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
      formData.append('subCategory', selectedSubCategory);
      formData.append('price', parseFloat(price));
      formData.append('isBestSeller', bestseller);
      formData.append('stock', stock); 
      sizes.forEach((size) => formData.append('size[]', size));
  
      
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
    
      // console.log('images:', images);
      // console.log('croppedImages:', croppedImages);

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

  //reset form
  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setImages([null, null, null, null]);
    setCroppedImages([null, null, null, null]);
    setSizes(['L', 'XL']);  
    setBestseller(false);
    setCropperOpen([false, false, false, false]);
    setStock(0);
    setSubCategories([]);
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

  //fetching products
  useEffect(() => {
    const token = localStorage.getItem('adminToken');

    if (!productData) {
      dispatch(fetchProductsForAdmin({ token, page: 1, limit: 100}));
    }

    if (productData && productData.images) {
      setImages(productData.images);
    }

    console.log("Fetching Products for Admin...");
  }, [productId, dispatch, productData,]);


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
        {loading ? 'Updating...' : 'Update Product'}
      </button>
    </form>
  );
};

export default EditProduct;
