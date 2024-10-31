import React from 'react';
import { Link } from 'react-router-dom';

const ProductItem = ({ id, image, name, price, currency }) => {
  const formatPath = (path) => path.replace(/\\/g, '/');
  return (
    <Link className='text-gray-700 cursor-pointer' to={`admin/product/${id}`}>
      <div className='overflow-hidden'>
        <img
          className='hover:scale-110 transition ease-in-out'
          // src={Array.isArray(image) && image.length > 0 ? image[0] : 'fallback-image-url'}
          src={`http://localhost:3000/${formatPath(image)}`}
          alt=""
        />
      </div>
      <p className='pt-3 pb-1 text-sm'>{name}</p>
      <p className='text-sm font-medium'>{currency}{price}</p>
    </Link>
  );
};

export default ProductItem;
