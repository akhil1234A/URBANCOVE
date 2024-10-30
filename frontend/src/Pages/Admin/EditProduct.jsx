import React, { useEffect, useState } from 'react';
import { assets } from '../../assets/admin';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';

const EditProduct = () => {

  const {id: productId} = useParams();
  console.log('productId',productId);
  //category management
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');



  //form data 
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [stock, setStock] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch categories (same as in AddProduct)
  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem('adminToken'); // Retrieve the token from local storage
      try {
        const response = await fetch('http://localhost:3000/admin/categories', {
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

    ///fetching sub categories
    useEffect(() => {
      const fetchSubCategories = async (categoryId) => {
        const token = localStorage.getItem('adminToken');
        try {
          const response = await fetch(`http://localhost:3000/admin/categories/${categoryId}/subcategories`, {
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

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      const token = localStorage.getItem('adminToken');
      try {
        const response = await fetch(`http://localhost:3000/admin/products/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const productData = await response.json();
        console.log(productData);
        if (response.ok) {
          setName(productData[0].productName);
          setDescription(productData[0].productDescription);
          setPrice(productData[0].price);
          setStock(productData[0].stock);
          setBestseller(productData[0].isBestSeller);
          setSizes(productData[0].size);
          const parsedSizes = productData[0].size.map(size => size.replace(/"/g, '').trim());
          setSizes(parsedSizes);
          setSelectedCategory(productData[0].category);
          setSelectedSubCategory(productData[0].subCategory);
         
        } else {
          toast.error(productData.message || 'Failed to load product');
        }
      } catch (error) {
        toast.error('An error occurred while fetching the product');
        console.error(error);
      }
    };

    fetchProduct();
  }, [productId]);

  //submit handler 
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
    
      const response = await fetch('http://localhost:3000/admin/products/${productId}', {
        method: 'PUT',
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

  // Update the form to include the previous state
  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-4 p-5 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>

    

      {/* Product Name */}
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

      {/* Product Description */}
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

      {/* Category and Subcategory */}
      <div className="flex gap-4">
        <div className="w-full">
          <label htmlFor="category" className="block mb-2">Category</label>
          <select id="category" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full max-w-md border border-gray-300 px-3 py-2 rounded">
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.category}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full">
          <label htmlFor="subCategory" className="block mb-2">Subcategory</label>
          <select id="subCategory" value={selectedSubCategory} onChange={(e) => setSelectedSubCategory(e.target.value)} className="w-full max-w-md border border-gray-300 px-3 py-2 rounded">
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

      {/* Product Sizes */}
      <div className="flex gap-3">
              {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                <div
            key={size}
            onClick={() =>
              setSizes((prev) =>
                Array.isArray(prev) && prev.includes(size)
                  ? prev.filter((item) => item !== size) // Remove size if already selected
                  : [...(prev || []), size] // Add size if not selected
              )
            }
          >
            <p
              className={`${
                sizes && sizes.includes(size) ? 'bg-pink-100' : 'bg-slate-200'
              } px-3 py-1 cursor-pointer rounded`}
            >
              {size}
            </p>
          </div>
        ))}
      </div>



      {/* Best Seller */}
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
        {loading ? 'Updating...' : 'Update Product'}
      </button>
    </form>
  );
};

export default EditProduct;
