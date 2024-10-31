import React from 'react';
import { Link } from 'react-router-dom';

const ProductItem = ({ id, image, name, price, currency }) => {
  const formatPath = (path) => path.replace(/\\/g, '/');
  return (
    <Link className='text-gray-700 cursor-pointer' to={`/product/${id}`}>
      <div className='overflow-hidden'>
          <img
      className='hover:scale-110 transition ease-in-out'
      src={`http://localhost:3000/${image}`}
      onError={(e) => {
        e.target.onerror = null; // Prevent looping
        e.target.src = 'fallback-image-url'; // Replace with your actual fallback image URL
      }}
      alt=""
    />
      </div>
      <p className='pt-3 pb-1 text-sm'>{name}</p>
      <p className='text-sm font-medium'>{currency}{price}</p>
    </Link>
  );
};

export default ProductItem;
