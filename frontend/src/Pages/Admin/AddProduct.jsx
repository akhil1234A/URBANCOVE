import React, { useState, useRef } from 'react';
import { assets } from '../../assets/admin';
import { toast } from 'react-toastify';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const AddProduct = ({ token }) => {
  const [images, setImages] = useState([null, null, null, null]);
  const [croppedImages, setCroppedImages] = useState([null, null, null, null]);
  const [crops, setCrops] = useState([{ unit: '%', width: 30, height: 30 }, { unit: '%', width: 30, height: 30 }, { unit: '%', width: 30, height: 30 }, { unit: '%', width: 30, height: 30 }]);
  
  const imageRefs = useRef([useRef(null), useRef(null), useRef(null), useRef(null)]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Men');
  const [subCategory, setSubcategory] = useState('Topwear');
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);

  const handleCropComplete = (crop, index) => {
    if (imageRefs.current[index]) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const imageElement = imageRefs.current[index];

      canvas.width = crop.width;
      canvas.height = crop.height;
      ctx.drawImage(
        imageElement,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );

      const croppedImageUrl = canvas.toDataURL('image/jpeg');
      setCroppedImages(prev => {
        const newCroppedImages = [...prev];
        newCroppedImages[index] = croppedImageUrl;
        return newCroppedImages;
      });
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('subCategory', subCategory);
      formData.append('bestseller', bestseller);
      formData.append('sizes', JSON.stringify(sizes));

      croppedImages.forEach((croppedImage, index) => {
        if (croppedImage) {
          formData.append(`image${index + 1}`, croppedImage);
        }
      });

      // Uncomment and adjust the response handling when your API call is ready
      // const response = await axios.post(backendUrl + "/api/product/add", formData, { headers: { token } });

      // Simulate response for demonstration purposes
      const response = { data: { success: true, message: 'Product added successfully' } }; // Mock response

      if (response.data.success) {
        toast.success(response.data.message);
        setName('');
        setDescription('');
        setImages([null, null, null, null]);
        setPrice('');
        setCroppedImages([null, null, null, null]);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-4 p-5 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>
      <div>
        <p className="mb-2">Upload Images</p>
        <div className="flex gap-3">
          {images.map((image, index) => (
            <label htmlFor={`image${index + 1}`} key={index} className="cursor-pointer">
              <img
                className="w-20 h-20 object-cover border border-gray-300 rounded"
                src={!image ? assets.upload_area : URL.createObjectURL(image)}
                alt=""
              />
              <input
                onChange={(e) => {
                  const file = e.target.files[0];
                  setImages(prev => {
                    const newImages = [...prev];
                    newImages[index] = file;
                    return newImages;
                  });
                }}
                type="file"
                id={`image${index + 1}`}
                hidden
                accept="image/*"
              />
              {image && (
                <ReactCrop
                  src={URL.createObjectURL(image)}
                  crop={crops[index]}
                  onImageLoaded={img => imageRefs.current[index] = img}
                  onComplete={crop => handleCropComplete(crop, index)}
                  onChange={newCrop => {
                    setCrops(prev => {
                      const newCrops = [...prev];
                      newCrops[index] = newCrop;
                      return newCrops;
                    });
                  }}
                />
              )}
            </label>
          ))}
        </div>
      </div>
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
      <div className="w-full">
        <label className="block mb-2">Price</label>
        <input
          onChange={(e) => setPrice(e.target.value)}
          value={price}
          className="w-full max-w-md border border-gray-300 px-3 py-2 rounded"
          type="number"
          placeholder="Type here"
          required
        />
      </div>
      <div className="flex gap-4">
        <div className="w-full">
          <label className="block mb-2">Category</label>
          <select onChange={(e) => setCategory(e.target.value)} value={category} className="w-full max-w-md border border-gray-300 px-3 py-2 rounded">
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>
        </div>
        <div className="w-full">
          <label className="block mb-2">Subcategory</label>
          <select onChange={(e) => setSubcategory(e.target.value)} value={subCategory} className="w-full max-w-md border border-gray-300 px-3 py-2 rounded">
            <option value="Topwear">Topwear</option>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Footwear">Footwear</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          onChange={(e) => setBestseller(e.target.checked)}
          checked={bestseller}
          type="checkbox"
          id="bestseller"
          className="h-4 w-4"
        />
        <label htmlFor="bestseller" className="text-sm">Bestseller</label>
      </div>
      <div className="flex gap-2 mt-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Add Product</button>
      </div>
    </form>
  );
};

export default AddProduct;
