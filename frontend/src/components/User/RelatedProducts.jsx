import React, { useEffect, useState } from 'react';
import Title from './Title';
import ProductItem from './ProductItem';
import { fetchWishlist } from '../../slices/user/wishlistSlice';
import { useDispatch, useSelector } from 'react-redux';
import { isTokenExpired } from '../../utils/jwtdecode';


const RelatedProducts = ({ category, subCategory, products, currentProductId}) => {
  const [related, setRelated] = useState([]);

  const dispatch = useDispatch();

  const { items: wishlistItems, error: wishlistError } = useSelector((state) => state.wishlist);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isTokenExpired(token)) {
      dispatch(fetchWishlist());
    }
  }, [dispatch]);

  const isInWishlist = (productId) => {
    return wishlistItems.some((wishlistItem) => wishlistItem._id === productId);
  };



  return (
    <div className='my-24'>
      <div className='text-center text-3xl py-2'>
        <Title text1={'RELATED'} text2={'PRODUCTS'} />
      </div>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {products.length > 0 ? (
          products.map(item => (
            <ProductItem 
              key={item._id} 
              id={item._id} 
              name={item.productName} 
              price={item.price} 
              image={item.images[0]} 
              wishlist={isInWishlist(item._id)}
            />
          ))
        ) : (
          <p className="text-center col-span-full">No related products found.</p>
        )}
      </div>
    </div>
  );
};

export default RelatedProducts;
