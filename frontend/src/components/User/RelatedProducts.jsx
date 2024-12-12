import React, { useEffect, useState } from 'react';
import Title from './Title';
import ProductItem from './ProductItem';
import { fetchWishlist } from '../../slices/user/wishlistSlice';
import { useDispatch, useSelector } from 'react-redux';


const RelatedProducts = ({ category, subCategory, products, currentProductId}) => {
  const [related, setRelated] = useState([]);

  const dispatch = useDispatch();

  const { items: wishlistItems, error: wishlistError } = useSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const isInWishlist = (productId) => {
    return wishlistItems.some((wishlistItem) => wishlistItem.productId._id === productId);
  };

  useEffect(() => {
    if (products.length > 0) {
      const filteredProducts = products.filter(item => 
        item.category?._id === category && item.subCategory?._id === subCategory && item._id !== currentProductId
      );

      // Limit to 5 related products
      setRelated(filteredProducts.slice(0, 5));
    }
  }, [products, category, subCategory]);

  return (
    <div className='my-24'>
      <div className='text-center text-3xl py-2'>
        <Title text1={'RELATED'} text2={'PRODUCTS'} />
      </div>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {related.length > 0 ? (
          related.map(item => (
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
