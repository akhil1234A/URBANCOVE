import React, { useEffect, useState } from 'react';
import Title from './Title';
import ProductItem from './ProductItem';
import { products } from '../../assets/assets'; // Adjust the path accordingly

const LatestCollection = () => {
  const [latestProducts, setLatestProducts] = useState([]);
  const currency = '$'; // Use your preferred currency symbol here

  useEffect(() => {
    // Set latest products from dummy data instead of context or Redux store
    setLatestProducts(products.slice(0, 10));
  }, []);

  return (
    <div className='my-10'>
      <div className='text-center py-8 text-3xl'>
        <Title text1={'LATEST'} text2={'COLLECTIONS'} />
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
          Lorem Ipsum, is simply dummy text of the printing and typesetting industry.
        </p>
      </div>

      {/* Rendering products */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {latestProducts.map((item, index) => (
          <ProductItem
            key={index}
            id={item._id}
            image={item.image}
            name={item.name}
            price={item.price}
            currency={currency} // Pass currency as a prop
          />
        ))}
      </div>
    </div>
  );
};

export default LatestCollection;
