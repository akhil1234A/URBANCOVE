import React, { useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaEdit } from 'react-icons/fa';
import { fetchProductsForAdmin, updateProductStatus, selectProducts } from '../../slices/admin/productSlice';
import { useNavigate } from 'react-router-dom';

const ViewProducts = () => {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  // const [currentPage, setCurrentPage] = useState(1);
  // const [totalPages, setTotalPages] = useState(0);
  // const itemsPerPage = 10; // Adjust this value as needed

  useEffect(() => {
    if (token) {
      dispatch(fetchProductsForAdmin(token));
    } else {
      toast.error("Authorization token not found. Please log in again.");
    }
  }, [dispatch, token]);

  // useEffect(() => {
  //   if (token) {
  //     dispatch(fetchProductsForAdmin({ token, page: currentPage, limit: itemsPerPage }))
  //       .unwrap()
  //       .then((data) => {
  //         console.log('Fetched products:', data); // Log to ensure products are fetched
  //       })
  //       .catch((error) => {
  //         console.error('Error fetching products:', error);
  //         toast.error(error.message || 'Error fetching products. Please try again later.');
  //       });
  //   } else {
  //     toast.error("Authorization token not found. Please log in again.");
  //   }
  // }, [dispatch, token, currentPage]);
  

  const handleEditProduct = (id) => {
    navigate(`/admin/products/${id}/edit`);
  };

  const toggleProductStatus = (id, currentIsActive) => {
    const newIsActive = !currentIsActive;
    dispatch(updateProductStatus({ productId: id, isActive: newIsActive, token }))
      .unwrap()
      .then(() => {
        toast.success(`Product is now ${newIsActive ? 'active' : 'inactive'}`);
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.message || 'Error updating product status. Please try again later.');
      });
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div>
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

        {products.map((item) => (
          <div
            className={`grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm ${
              item.status === 'unlisted' ? 'opacity-50' : ''
            }`}
            key={item._id}
          >
            <img className='w-12' src={`http://localhost:3000/${item.images[0]}`} />
            <p>{item.productName}</p>
            <p>{item.category?.category || 'Unknown'}</p>
            <p>${item.price}</p>
            <p>{item.isActive ? 'Listed' : 'Unlisted'}</p>
            <div className='flex gap-2 justify-center'>
              <button
                onClick={() => toggleProductStatus(item._id, item.isActive)}
                className={`text-sm py-1 px-3 rounded-md ${
                  item.isActive ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'
                } transition duration-200 ease-in-out`}
              >
                {item.isActive ? 'Unlist' : 'List'}
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

{/* <div className="pagination flex justify-center mt-4">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={currentPage === index + 1 ? 'active' : ''}
            >
              {index + 1}
            </button>
          ))}
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            Next
          </button>
        </div> */}

      </div>
    </div>
  );
};

export default ViewProducts;
