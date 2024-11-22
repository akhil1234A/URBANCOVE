import React from 'react';
import Title from './Title';
import ProductItem from './ProductItem';

const LatestCollection = ({ products }) => {
  const currency = '₹'; // Use your preferred currency symbol here

  return (
    <div className='my-10'>
      <div className='text-center py-8 text-3xl'>
        <Title text1={'LATEST'} text2={'COLLECTIONS'} />
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
          Explore the latest additions to our collection, crafted with care and quality.
        </p>
      </div>

      {/* Render latest products passed as props */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {products.map((item) => (
          <ProductItem
            key={item._id}
            id={item._id}
            image={item.images[0]}  // Assuming first image is the default
            name={item.productName}
            price={item.price}
            currency={currency}
          />
        ))}
      </div>
    </div>
  );
};

export default LatestCollection;
