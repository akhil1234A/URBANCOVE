import React, { useState, useRef, useEffect } from 'react';
import { assets } from '../../assets/admin';
import { toast } from 'react-toastify';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

const AddProduct = () => {

 //category management drop downn
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('671a21b1ed1268c1b442da4b');
  const [selectedSubCategory, setSelectedSubCategory] = useState('671a2c78a10d924e43a514c2');

  
  //handling images
  const [images, setImages] = useState([null, null, null, null]);
  const [croppedImages, setCroppedImages] = useState([null, null, null, null]);
  const cropperRefs = useRef([null, null, null, null]);
  const [imageURLs, setImageURLs] = useState([null, null, null, null]);
  const [cropperOpen, setCropperOpen] = useState([false, false, false, false]);
  const [zoom, setZoom] = useState(1);


  //form data
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState(['L', 'XL']);
  const [stock, setStock] = useState(22);
  const [loading, setLoading] = useState(false);


  //fetch categories 
  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem('adminToken'); // Retrieve the token from local storage
      try {
        const response = await fetch('http://localhost:3000/admin/categories?isActive-true', {
          headers: {
            'Authorization': `Bearer ${token}`, // Include the token in the headers
          },
        });
        const data = await response.json();
        console.log('data',data);
        setCategories(data); // Assuming your API returns categories in this format
        console.log('categories',categories);
        
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  //end of fetching categories

  ///fetching sub categories
  useEffect(() => {
    const fetchSubCategories = async (categoryId) => {
      const token = localStorage.getItem('adminToken');
      try {
        const response = await fetch(`http://localhost:3000/admin/categories/${categoryId}/subcategories?isActive=true`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        console.log(data);
        setSubCategories(data); // Assuming the data returned is an array of subcategories
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        toast.error('Failed to load subcategories');
      }
    };
  
    if (selectedCategory) {
      fetchSubCategories(selectedCategory);
    }
  }, [selectedCategory]);
  //end of fetching sub categories


  //handling images
  useEffect(() => {
    return () => {
      imageURLs.forEach(url => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imageURLs]);

  const handleImageChange = (index, file) => {
    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);

    if (file) {
      const url = URL.createObjectURL(file);
      setImageURLs((prev) => {
        const newUrls = [...prev];
        newUrls[index] = url;
        return newUrls;
      });
      setCropperOpen((prev) => {
        const newState = [...prev];
        newState[index] = true;
        return newState;
      });
    }
  };

  const handleCrop = (index) => {
    const cropper = cropperRefs.current[index]?.cropper;
    if (cropper) {
      const croppedDataUrl = cropper.getCroppedCanvas({
        width: 390,
        height: 450,
      }).toDataURL('image/png');

      // Update croppedImages state correctly
      setCroppedImages((prev) => {
        const newCroppedImages = [...prev];
        newCroppedImages[index] = croppedDataUrl; // Store the cropped image
        return newCroppedImages;
      });

      closeCropper(index); // Close the cropper after cropping
    }
  };

  const closeCropper = (index) => {
    setCropperOpen((prev) => {
      const newState = [...prev];
      newState[index] = false;
      return newState;
    });
    setZoom(1); // Reset zoom when closing the cropper
    setImages((prev) => {
      const newImages = [...prev];
      newImages[index] = null; // Clear the image
      return newImages;
    });
    setImageURLs((prev) => {
      const newUrls = [...prev];
      newUrls[index] = null; // Clear the URL
      return newUrls;
    });
  };

  const handleZoomIn = () => {
    setZoom(prev => prev + 0.1);
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 1));
  };
  //end handling images


  //form submit
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      if (price <= 0) {
        toast.error('Price must be a positive number');
        return;
      }
      if (stock < 0) {
        toast.error('Stock must be a non-negative number');
        return;
      }

      console.log(selectedCategory);
      console.log(selectedSubCategory);


      const formData = new FormData();
      formData.append('productName', name);
      formData.append('productDescription', description);
      formData.append('price', price);
      formData.append('category', selectedCategory);
      formData.append('subCategory', selectedSubCategory);
      formData.append('stock', stock);
      sizes.forEach(s => formData.append('size[]', s));
      formData.append('isBestSeller', bestseller);
      formData.append('isActive', true);

      croppedImages.forEach((croppedImage, index) => {
        if (croppedImage) {
          const file = dataURLToBlob(croppedImage);
          formData.append('images', file, `processed-${Date.now()}.png`); 
        }
      });

      for (const [key, value] of formData.entries()) {
        console.log(key, value);
    }
     
     console.log(formData);
    
      const response = await fetch('http://localhost:3000/admin/products/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        toast.success('Product added successfully!');
        resetForm();
      } else {
        toast.error(result.message || 'Error adding product. Please try again.');
      }
    } catch (error) {
      console.error(error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  //end of form submit

  //reset form 
  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setImages([null, null, null, null]);
    setCroppedImages([null, null, null, null]);
    setStock(22);
    setSizes(['L', 'XL']);
    setBestseller(false);
    setImageURLs([null, null, null, null]);
    setCropperOpen([false, false, false, false]);
  };

  const dataURLToBlob = (dataURL) => {
    const [meta, content] = dataURL.split(',');
    const byteString = atob(content);
    const mimeString = meta.split(':')[1].split(';')[0];
    const buffer = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i++) {
      buffer[i] = byteString.charCodeAt(i);
    }
    return new Blob([buffer], { type: mimeString });
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-4 p-5 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>

      {/* image upload */}
      <div>
        <p className="mb-2">Upload and Crop Images</p>
        <div className="flex gap-3">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <label htmlFor={`image${index + 1}`} className="cursor-pointer">
                <img
                  className="w-20 h-20 object-cover border border-gray-300 rounded"
                  src={croppedImages[index] || imageURLs[index] || assets.upload_area} // Show cropped image or uploaded image, fallback to upload icon
                  alt={`Product Preview ${index}`}
                />
                <input
                  onChange={(e) => handleImageChange(index, e.target.files[0])}
                  type="file"
                  id={`image${index + 1}`}
                  hidden
                  accept="image/*"
                />
              </label>
              {cropperOpen[index] && (
                <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                  <div className="bg-white p-4 rounded" style={{ width: '500px', height: '500px' }}>
                    <Cropper
                      src={imageURLs[index]}
                      style={{ height: '100%', width: '100%' }}
                      initialAspectRatio={390 / 450}
                      aspectRatio={390 / 450}
                      guides={false}
                      ref={(el) => (cropperRefs.current[index] = el)}
                      zoom={zoom}
                    />
                    <div className="flex justify-between mt-2">
                      <button
                        onClick={() => handleCrop(index)}
                        className="bg-green-500 text-white px-2 py-1 rounded"
                      >
                        Crop
                      </button>
                      <button
                        onClick={() => closeCropper(index)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* product name */}
      <div className="w-full">
        <label className="block mb-2">Product Name</label>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className="w-full max-w-md border border-gray-300 px-3 py-2 rounded"
          type="text"
          placeholder="Type here"
          required
        />
      </div>

      {/* product description */}
      <div className="w-full">
        <label className="block mb-2">Product Description</label>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          className="w-full max-w-md border border-gray-300 px-3 py-2 rounded"
          placeholder="Type here"
          required
        />
      </div>
      

      {/* category, sub category, price, stock */}
      <div className="flex gap-4">
        <div className="w-full">
          <label htmlFor="category" className="block mb-2">Category</label>
          <select id="category"  onChange={(e) => setSelectedCategory(e.target.value)} className="w-full max-w-md border border-gray-300 px-3 py-2 rounded">
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.category}
            </option>
          ))}
          </select>
        </div>

        <div className="w-full">
          <label htmlFor="subCategory" className="block mb-2">Subcategory</label>
          <select id="subCategory"
          value={selectedSubCategory}
          onChange={(e) => setSelectedSubCategory(e.target.value)} className="w-full max-w-md border border-gray-300 px-3 py-2 rounded">
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
          value={price}
          className="w-full px-3 py-2 sm:w-[120px]"
          type="number"
          placeholder="Enter price (e.g., 25)"
          required
        />
      </div>

      <div className="w-full">
        <label className="block mb-2">Stock</label>
        <input
          onChange={(e) => setStock(e.target.value)}
          value={stock}
          className="w-full px-3 py-2 sm:w-[120px]"
          type="number"
          placeholder="Type here"
          required
        />
      </div>

      </div>

      
      {/* product sizes */}
      <div className="w-full">
        <p className="mb-2">Product Sizes</p>
        <div className="flex gap-3">
          {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
            <div
              key={size}
              onClick={() => setSizes((prev) =>
                prev.includes(size) ? prev.filter((item) => item !== size) : [...prev, size]
              )}
            >
              <p
                className={`${sizes.includes(size) ? 'bg-pink-100' : 'bg-slate-200'} 
                px-3 py-1 cursor-pointer rounded`}
              >
                {size}
              </p>
            </div>
          ))}
        </div>
      </div>
        
     
      {/* best seller */}
      <div className="flex gap-2 mt-2">
        <input
          onChange={() => setBestseller((prev) => !prev)}
          checked={bestseller}
          type="checkbox"
          id="bestseller"
        />
        <label htmlFor="bestseller" className="cursor-pointer">Add to Bestseller</label>
      </div>
     
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        {loading ? 'Adding...' : 'Add Product'}
      </button>
    </form>
  );
};

export default AddProduct;
