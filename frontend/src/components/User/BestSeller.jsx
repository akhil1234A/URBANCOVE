
import Title from './Title';
import ProductItem from './ProductItem';
import { fetchWishlist } from '../../slices/user/wishlistSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { isTokenExpired } from '../../utils/jwtdecode';



const BestSeller = ({ products }) => {
  const currency = '₹'; 

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
    <div className='my-10'>
      <div className='text-center py-8 text-3xl'>
        <Title text1={'BEST'} text2={'SELLERS'} />
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
          Discover our top-selling products, loved by customers worldwide.
        </p>
      </div>

      {/* Render best-selling products passed as props */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {products.map((item) => (
          <ProductItem
            key={item._id}
            id={item._id}
            image={item.images[0]}  // Assuming first image is the default
            name={item.productName}
            price={item.price}
            currency={currency}
            discountedPrice={item?.discountedPrice || 0}
            wishlist={isInWishlist(item._id)}
          />
        ))}
      </div>
    </div>
  );
};

export default BestSeller;
