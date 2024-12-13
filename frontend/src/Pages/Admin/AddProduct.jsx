import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ImageUpload from '../../components/Admin/ImageUpload';
import ImageCropper from '../../components/Admin/ImageCropper';
import { fetchCategories, fetchSubCategoriesByCategory } from '../../slices/admin/categorySlice';
import { addProduct } from '../../slices/admin/productSlice';

const AddProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const categories = useSelector((state) => state.categories.categories);
  
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [images, setImages] = useState([null, null, null, null]);
  const [croppedImages, setCroppedImages] = useState([null, null, null, null]);
  const [cropperOpen, setCropperOpen] = useState([false, false, false, false]);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [bestseller, setBestseller] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [stock, setStock] = useState(0);

  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

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
          } else {
            toast.error('Error fetching subcategories.');
          }
        });
    } else {
      setSubCategories([]);
    }
  }, [selectedCategory, dispatch]);

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
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };


  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('adminToken');

    try {
      if (!name || !selectedCategory || !selectedSize || price <= 0 || stock <= 0) {
        toast.error('Please fill all required fields with valid values.');
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
      formData.append('stock', stock);
      formData.append('size', selectedSize);

      croppedImages.forEach((croppedImage, index) => {
        if (croppedImage) {
          const file = dataURLToBlob(croppedImage);
          formData.append('images', file, `processed-${Date.now()}.png`);
        } else if (images[index]) {
          fetch(images[index])
            .then(res => res.blob())
            .then(blob => {
              formData.append('images', blob, `original-${Date.now()}.png`);
            });
        }
      });

      const resultAction = await dispatch(addProduct({ productData: formData, token }));

      if (addProduct.fulfilled.match(resultAction)) {
        toast.success('Product added successfully!');
        navigate('/admin/products/view');
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
    setSelectedSize('');
    setStock(0);
    setBestseller(false);
    setCropperOpen([false, false, false, false]);
    setSubCategories([]);
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-4 p-5 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>

      <ImageUpload images={images} setImages={setImages} setCropperOpen={setCropperOpen} />

{images.map((image, index) => (
  cropperOpen[index] && image && (
    <ImageCropper
      key={index}
      imageURL={image}
      setCroppedImage={(croppedImage) => setCroppedImage(index, croppedImage)}
      setCropperOpen={(open) => setCropperOpen((prev) => {
        const newOpen = [...prev];
        newOpen[index] = open;
        return newOpen;
      })}
      onCropComplete={() => handleCropComplete(index)}
    />
  )
))}


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

      <div className="flex gap-4 flex-wrap">
        <div className="w-full md:w-1/2">
          <label htmlFor="category" className="block mb-2">Category</label>
          <select
            id="category"
            value={selectedCategory} 
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedSubCategory(''); 
            }}
            className="w-full max-w-md border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="" disabled>Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.category}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-1/2">
          <label htmlFor="subCategory" className="block mb-2">Subcategory</label>
          <select
            id="subCategory"
            value={selectedSubCategory}
            onChange={(e) => setSelectedSubCategory(e.target.value)}
            className="w-full max-w-md border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={subCategories.length === 0}
          >
            <option value="" disabled>
              {subCategories.length > 0 ? 'Select a subcategory' : 'Select a category first'}
            </option>
            {subCategories.map((subCategory) => (
              <option key={subCategory._id} value={subCategory._id}>
                {subCategory.subCategory}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-1/2">
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

        <div className="w-full md:w-1/2">
          <label className="block mb-2">Product Size</label>
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="w-full max-w-md border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="">Select a size</option>
            {sizes.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-1/2">
          <label className="block mb-2">Stock</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(parseInt(e.target.value))}
            className="w-full max-w-md border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter stock quantity"
            required
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={bestseller}
          onChange={() => setBestseller(!bestseller)}
          id="bestseller"
        />
        <label htmlFor="bestseller" className="ml-2">Best Seller</label>
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

