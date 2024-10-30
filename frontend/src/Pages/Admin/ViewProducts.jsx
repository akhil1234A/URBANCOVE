import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEdit } from 'react-icons/fa';

const ViewProducts = () => {
  const [list, setList] = useState([]);
  const navigate = useNavigate();
  const formatPath = (path) => path.replace(/\\/g, '/');


  // Function to fetch products from API
  const fetchProducts = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      toast.error("Authorization token not found. Please log in again.");
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/admin/products/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setList(data); // Assuming data is an array of products
    } catch (error) {
      console.error(error);
      toast.error('Error fetching products. Please try again later.');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleProductStatus = (id) => {
    setList((prevList) =>
      prevList.map((item) =>
        item._id === id ? { ...item, status: item.status === 'listed' ? 'unlisted' : 'listed' } : item
      )
    );
    toast.success('Product status updated successfully');
  };

  const handleEditProduct = (id) => {
    navigate(`/admin/products/${id}/edit`);
  };

  return (
    <>
      <p className='mb-2'>All Products List</p>
      <div className='flex flex-col gap-2'>
        <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Status</b>
          <b className='text-center'>Actions</b>
        </div>

        {list.map((item) => (
          <div
            className={`grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm ${
              item.status === 'unlisted' ? 'opacity-50' : ''
            }`}
            key={item._id}
          >
            <img className='w-12' src={`http://localhost:3000/${formatPath(item.images[0])}`} />
            <p>{item.productName}</p>
            <p>{item.category?.category || 'Unknown'}</p>
            <p>${item.price}</p>
            <p>{item.status}</p>
            <div className='flex gap-2 justify-center'>
              <button
                onClick={() => toggleProductStatus(item._id)}
                className={`text-sm py-1 px-3 rounded-md 
                 ${item.status === 'listed' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'} 
                 transition duration-200 ease-in-out`}
              >
                {item.status === 'listed' ? 'Unlist' : 'List'}
              </button>
              <button
                onClick={() => handleEditProduct(item._id)}
                className='text-sm py-1 px-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 flex items-center transition duration-200 ease-in-out'
              >
                <FaEdit className='mr-1' /> Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ViewProducts;
