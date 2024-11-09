import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProductsForUser, selectProducts, selectLoading } from '../../slices/admin/productSlice';
import { assets } from '../../assets/assets';
import Title from '../../components/User/Title';
import ProductItem from '../../components/User/ProductItem';

const Collection = () => {
  const dispatch = useDispatch();
  const currency = '$';

  // Retrieve product list and loading status from Redux
  const productList = useSelector(selectProducts);
  const loading = useSelector(selectLoading);

  useEffect(() => {
    // Dispatch an action to fetch products if not already loaded
    dispatch(fetchProductsForUser());
  }, [dispatch]);

  if (loading) {
    return <div>Loading products...</div>;
  }

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
            <option value="relavent">Sort by : Relevant</option>
            <option value="low-high">Sort by : Low to High</option>
            <option value="high-low">Sort by : High to Low</option>
          </select>
        </div>

        {/* Map products */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {Array.isArray(productList) && productList.map((item) => (
             <ProductItem 
             key={item._id} 
             id={item._id} 
             name={item.productName} 
             price={item.price} 
             image={item.images[0]} 
             currency={currency}
           />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;
