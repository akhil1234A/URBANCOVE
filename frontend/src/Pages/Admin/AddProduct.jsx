import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import ImageUpload from '../../components/Admin/ImageUpload';
import ImageCropper from '../../components/Admin/ImageCropper';
import { toast } from 'react-toastify'; 
import { fetchCategories, fetchSubCategoriesByCategory } from '../../slices/admin/categorySlice';
import { addProduct } from '../../slices/admin/productSlice';

const AddProduct = () => {
  const dispatch = useDispatch(); 
  const categories = useSelector((state) => state.categories.categories);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('671a21b1ed1268c1b442da4b');
  const [selectedSubCategory, setSelectedSubCategory] = useState('671a2c78a10d924e43a514c2');
  const [loading, setLoading] = useState(false);
  
  const [images, setImages] = useState([null, null, null, null]);
  const [croppedImages, setCroppedImages] = useState([null, null, null, null]);
  const [cropperOpen, setCropperOpen] = useState([false, false, false, false]);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [bestseller, setBestseller] = useState(false);
  
  const defaultQuantities = {
    S: 10,
    M: 15,
    L: 20,
    XL: 25,
    XXL: 30
  };

  const [sizes, setSizes] = useState(['L', 'XL']);
  const [stock, setStock] = useState(defaultQuantities); // Store quantities for each size

  const setCroppedImage = (index, croppedImage) => {
    const newCroppedImages = [...croppedImages];
    newCroppedImages[index] = croppedImage;
    setCroppedImages(newCroppedImages);
  };

  const handleCropComplete = (index) => {
    setCropperOpen((prev) => {
      const newOpen = [...prev];
      newOpen[index] = false; // Close the cropper for this image
      return newOpen;
    });
  };

  // Utility function to convert base64 data URL to a Blob
const dataURLToBlob = (dataURL) => {
  const byteString = atob(dataURL.split(',')[1]); // Decode the base64 string
  const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0]; // Extract MIME type
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], { type: mimeString });
};


  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('adminToken');

    try {
      if (!name || !selectedCategory || price <= 0) {
        toast.error('Ensure all fields are filled, and price is positive');
        return;
      }

      if (croppedImages.filter(Boolean).length < 3) {
        toast.error('Please upload and crop at least 3 images.');
        return;
      }

      const formData = new FormData();
      formData.append('productName', name);
      formData.append('productDescription', description);
      formData.append('category', selectedCategory);
      formData.append('subCategory', selectedSubCategory);
      formData.append('isBestSeller', bestseller);
      formData.append('isActive', true);
      formData.append('price', parseFloat(price));

      const totalStock = sizes.reduce((acc, size) => acc + (stock[size] || 0), 0);
      formData.append('stock', totalStock);

    

      croppedImages.forEach((croppedImage) => {
        if (croppedImage) {
          const file = dataURLToBlob(croppedImage);
          formData.append('images', file, `processed-${Date.now()}.png`);
        }
      });

      sizes.forEach((size) => {
        formData.append('size[]', size);
        // formData.append(`stock[${size}]`, stock[size]); // Add stock per size

      });

      

     

      const resultAction = await dispatch(addProduct({ productData: formData, token }));

      if (addProduct.fulfilled.match(resultAction)) {
        toast.success('Product added successfully!');
        resetForm();
      } else {
        toast.error(resultAction.payload || 'Error adding product. Please try again.');
      }
    } catch (error) {
      console.error(error);
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
    setSizes(['L', 'XL']);
    setBestseller(false);
    setCropperOpen([false, false, false, false]);
    setStock(defaultQuantities); // Reset stock to default quantities
    setSubCategories([])
  };

  useEffect(() => {
    // Fetch categories on component mount
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
          } else {
            toast.error('Error fetching subcategories.');
          }
        });
    }
  }, [selectedCategory, dispatch]);

  // Calculate total stock based on selected sizes
  const totalStock = sizes.reduce((acc, size) => acc + (stock[size] || 0), 0);

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-4 p-5 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>

      <ImageUpload images={images} setImages={setImages} setCropperOpen={setCropperOpen} />

      {images.map((image, index) => (
        cropperOpen[index] && (
          <ImageCropper
            key={index}
            imageURL={image}
            setCroppedImage={(croppedImage) => setCroppedImage(index, croppedImage)}
            setCropperOpen={() => setCropperOpen((prev) => {
              const newOpen = [...prev];
              newOpen[index] = false; // Close the cropper when needed
              return newOpen;
            })}
            onCropComplete={() => handleCropComplete(index)}
          />
        )
      ))}

      {/* Product name */}
      <div className="w-full">
        <label className="block mb-2">Product Name</label>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
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
          value={description}
          className="w-full max-w-md border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type here"
          required
        />
      </div>

      {/* Category, subcategory, price, stock */}
      <div className="flex gap-4">
        <div className="w-full">
          <label htmlFor="category" className="block mb-2">Category</label>
          <select
            id="category"
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
          <label htmlFor="subCategory" className="block mb-2">Subcategory</label>
          <select
            id="subCategory"
            value={selectedSubCategory}
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
              <option value="" disabled>Select a category first</option>
            )}
          </select>
        </div>

        <div className="w-full">
          <label className="block mb-2">Product Price</label>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className="w-full max-w-md border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="number"
            placeholder="Enter price (e.g., 25)"
            required
          />
        </div>

        <div className="w-full">
          <label className="block mb-2">Overall Stock</label>
          <input
            value={totalStock} // Total stock based on selected sizes
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
                onChange={() => {
                  setSizes((prevSizes) =>
                    prevSizes.includes(size)
                      ? prevSizes.filter((s) => s !== size) // Remove size if already selected
                      : [...prevSizes, size] // Add size if not selected
                  );
                }}
              />
              <label className="ml-2">{size}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={bestseller}
          onChange={() => setBestseller(!bestseller)}
        />
        <label className="ml-2">Best Seller</label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`mt-4 w-full max-w-md px-4 py-2 text-white bg-blue-600 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Adding...' : 'Add Product'}
      </button>
    </form>
  );
};

export default AddProduct;
