import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ImageUploadAndCrop from '../../components/Admin/ImageUploadAndCrop';
import { editProduct, selectProductById, fetchProductsForAdmin } from '../../slices/admin/productSlice';
import { fetchCategories, fetchSubCategoriesByCategory } from '../../slices/admin/categorySlice';

const EditProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: productId } = useParams();
  const productData = useSelector((state) => selectProductById(state, productId));

  const categories = useSelector((state) => state.categories.categories);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [croppedImages, setCroppedImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [bestseller, setBestseller] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [stock, setStock] = useState(0);

  useEffect(() => {
    if (productData) {
      setName(productData.productName);
      setDescription(productData.productDescription);
      setPrice(productData.price);
      setStock(productData.stock);
      setBestseller(productData.isBestSeller);
      setSelectedSize(productData.size || []);
      setSelectedCategory(productData.category._id);
      setSelectedSubCategory(productData.subCategory._id);
      setImages(productData.images);
      setCroppedImages(productData.images);
    }
  }, [productData]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!productData) {
      dispatch(fetchProductsForAdmin({ token, page: 1, limit: 100 }));
    }
    dispatch(fetchCategories(token));
  }, [dispatch, productData]);

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
      if (!name || !selectedCategory || price <= 0) {
        toast.error('Ensure all fields are filled, and price is positive');
        return;
      }

      const formData = new FormData();
      formData.append('productName', name);
      formData.append('productDescription', description);
      formData.append('category', selectedCategory);
      formData.append('subCategory', selectedSubCategory);
      formData.append('price', parseFloat(price));
      formData.append('isBestSeller', bestseller);
      formData.append('stock', stock);
      formData.append('size', selectedSize);


      croppedImages.forEach((image, index) => {
        if (image) {
          const file = dataURLToBlob(image);
          if (file) {
            formData.append("images", file, `image-${Date.now()}-${index}.png`);
          } else {
            console.error(`Failed to create blob for image at index ${index}`);
          }
        }
      });

      formData.append('removeImages', JSON.stringify(removedImages.map(index => productData.images[index])));

      const resultAction = await dispatch(editProduct({ productId, productData: formData, token }));

      if (editProduct.fulfilled.match(resultAction)) {
        toast.success("Product updated successfully!");
        navigate('/admin/products/view');
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

  return (
    <form onSubmit={onSubmitHandler} className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-gray-600">Update your product information here.</p>
      </div>

      <ImageUploadAndCrop
        initialImages={images}
        setImages={setImages}
        setCroppedImages={setCroppedImages}
        setRemovedImages={setRemovedImages}
      />

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
      <label className="block mb-2">Product Size</label>
      <select
          value={selectedSize}
          onChange={(e) => setSelectedSize(e.target.value)}
          className="w-full max-w-md border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        >
          <option value="">Select a size</option>
          {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
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

const dataURLToBlob = (dataURL) => {
  try {
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
    console.error('Error in dataURLToBlob:', error);
    return null;
  }
};

