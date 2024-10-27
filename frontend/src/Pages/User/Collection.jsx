import React from 'react';
import { assets } from '../../assets/assets';
import Title from '../../components/User/Title';
import ProductItem from '../../components/User/ProductItem';

const Collection = () => {
  // Sample products array for layout demonstration
  const sampleProducts = [
    { id: '1', name: 'Product 1', price: 100, image: assets.product_image },
    { id: '2', name: 'Product 2', price: 200, image: assets.product_image },
    { id: '3', name: 'Product 3', price: 300, image: assets.product_image },
    { id: '4', name: 'Product 4', price: 400, image: assets.product_image },
  ];

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
       
      {/* Filter options */}
      <div className='min-w-60'>
        <p className='my-2 text-xl flex items-center cursor-pointer gap-2'>FILTERS
          <img className={`h-3 sm:hidden`} src={assets.dropdown_icon} alt="" />
        </p>

        {/* Category filter */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 sm:block`}>
          <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Men'} /> Men
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Women'} /> Women
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Kids'} /> Kids
            </p>
          </div>
        </div>

        {/* Subcategory filter */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 sm:block`}>
          <p className='mb-3 text-sm font-medium'>TYPE</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Topwear'} /> Topwear
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Bottomwear'} /> Bottomwear
            </p>
            <p className='flex gap-2'>
              <input className='w-3' type="checkbox" value={'Winterwear'} /> Winterwear
            </p>
          </div>
        </div>
      </div>
     
      {/* Right side */}
      <div className='flex-1'>
        <div className='flex justify-between text-base sm:text-2xl mb-4'>
          <Title text1={'ALL'} text2={'COLLECTIONS'} />
          {/* Product sort */}
          <select className='border-2 border-gray-300 text-sm px-2'>
            <option value="relavent">Sort by : Relavent</option>
            <option value="low-high">Sort by : Low to High</option>
            <option value="high-low">Sort by : High to Low</option>
          </select>
        </div>

        {/* Map products */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {sampleProducts.map((item) => (
            <ProductItem key={item.id} name={item.name} id={item.id} price={item.price} image={item.image} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;
