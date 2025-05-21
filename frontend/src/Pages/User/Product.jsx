import  { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsForUser, selectProductById, selectProducts, selectLoading } from '../../slices/admin/productSlice';
import { addToCart } from '../../slices/user/cartSlice'
import { assets } from '../../assets/assets';
import RelatedProducts from '../../components/User/RelatedProducts';
import ZoomModal from '../../components/User/ZoomModal';
import {  toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { addToWishlist } from '../../slices/user/wishlistSlice';
import { ClipLoader } from 'react-spinners';


// Sub-components
const ProductImageGallery = ({ images, currentImage, onImageClick }) => (
  <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
    {images.map((img, index) => (
      <img
        key={index}
        onClick={() => onImageClick(img)}
        src={img}
        onError={(e) => (e.target.src = 'path/to/fallback-image.jpg')}
        className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
        alt={`Image of ${img}`}
      />
    ))}
  </div>
);

const StarRating = ({ rating }) => (
  <div className="flex">
    {[...Array(5)].map((_, index) => (
      <img
        key={index}
        src={index < rating ? assets.star_icon : assets.star_dull_icon}
        alt="star"
        className="w-5 h-5"
      />
    ))}
  </div>
);

const Reviews = ({ reviews }) => (
  <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
    {reviews.length > 0 ? (
      reviews.map((review, index) => (
        <div key={index} className="border-b pb-4">
          <div className="flex justify-between">
            <p className="font-semibold">{review.username}</p>
            <StarRating rating={review.rating} />
          </div>
          <p className="mt-2">{review.comment}</p>
        </div>
      ))
    ) : (
      <p>No reviews yet.</p>
    )}
  </div>
);

const ProductInfo = ({ productData, size, setSize, onAddToCart, onAddToWishlist }) => {
  const isOutOfStock = productData.stock <= 0;
  const isRunningLow = productData.stock > 0 && productData.stock < 5; // You can adjust the threshold

  const hasDiscount = productData.discountedPrice && productData.discountedPrice !== productData.price;
  

  return (
    <div className="flex-1">
      <h1 className="font-medium text-2xl mt-2">{productData.productName}</h1>
      {/* <div className="flex item-center gap-1 mt-2">
        <StarRating rating={4} />
        <p className="pl-2">(122)</p>
      </div> */}

       {/* Display price with discount if applicable */}
       <p className="mt-5 text-3xl font-medium">
        {hasDiscount ? (
          <>
            <span className="line-through text-gray-500">₹{productData.price.toFixed(2)}</span> {/* Original Price */}
            <span className="text-red-600 ml-2">₹{productData.discountedPrice.toFixed(2)}</span> {/* Discounted Price */}
          </>
        ) : (
          <span>₹{productData.price.toFixed(2)}</span> // Regular price
        )}
      </p>

      {/* <p className="mt-5 text-3xl font-medium">${productData.price}</p> */}
      <p className="mt-5 text-gray-500 md:w-4/5">{productData.productDescription}</p>
      
      {/* Stock Status */}
      <div className="mt-4 text-sm text-gray-600">
        {isOutOfStock && <p className="text-red-600">Sold Out</p>}
        {isRunningLow && <p className="text-orange-600">Only {productData.stock} left in stock!</p>}
        {!isOutOfStock && !isRunningLow && (
          <p className="text-green-600">Available Stock: {productData.stock}</p>
        )}
      </div>

      <div className="flex flex-col gap-4 my-8">
        <p>Select Size</p>
        <div className="flex gap-2">
          {productData.size.map((s, index) => (
            <button
              onClick={() => setSize(s)}
              className={`border py-2 px-4 bg-gray-100 ${s === size ? 'border-orange-500' : ''}`}
              key={index}
              disabled={isOutOfStock} 
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      
      {/* Add to Cart Button */}
      <div className="flex gap-4">
        <button 
          onClick={onAddToCart}
          className={`bg-black text-white px-8 py-3 text-sm ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'active:bg-gray-700'}`} 
          disabled={isOutOfStock}
        >
          {isOutOfStock ? 'Out of Stock' : 'ADD TO CART'}
        </button>
        <button
          onClick={onAddToWishlist}
          className="bg-orange-500 text-white px-6 py-3 text-sm active:bg-orange-600"
        >
          ADD TO WISHLIST
        </button>
      </div>
      
      <hr className="mt-8 sm:w-4/5" />
      <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
        <p>100% Original product.</p>
        <p>Cash on delivery is available on this product.</p>
        <p>Easy return and exchange policy within 7 days.</p>
      </div>
    </div>
  );
};


const Product = () => {
  const { productID } = useParams();
  const dispatch = useDispatch();

  const productData = useSelector((state) => selectProductById(state, productID));
  const products = useSelector(selectProducts);
  const loading = useSelector(selectLoading);

  const [currentImage, setCurrentImage] = useState('');
  const [activeSection, setActiveSection] = useState('description');
  const [size, setSize] = useState(productData?.size[0] || '');
  const [isZoomed, setIsZoomed] = useState(false);

  // Dummy reviews array
  const dummyReviews = [
    { username: 'JohnDoe', rating: 5, comment: 'Excellent product, highly recommend!' },
    { username: 'JaneSmith', rating: 4, comment: 'Good quality but slightly overpriced.' },
    { username: 'MikeJohnson', rating: 3, comment: 'Average product, you get what you pay for.' },
  ];



  useEffect(() => {
    if (!productData) {
      dispatch(fetchProductsForUser({ page: 1, limit: 20}));
    } else if (productData.images) {
      setCurrentImage(productData.images[0]);
    }
  }, [productID, dispatch, productData,]);

  const handleAddToCart = () => {
    if (!size) {
      toast.error('Please select a size before adding to cart.');
      return;
    }
    if (productData) {
      if (productData.stock > 0) {
        dispatch(addToCart({ productId: productData._id, quantity: 1 }))
        .unwrap()
        .then(() => {
          toast.success('Item added to your Cart!');
        })
        .catch((error) => {
          toast.error(error || 'Failed to add item to Cart.');
        });
       
      } else {
        toast.error('This product is currently out of stock.');
      }
    }
  };


  const handleAddToWishlist = (e) => {
    e.preventDefault(); // Prevent navigation when clicking the icon
    dispatch(addToWishlist(productData._id))
      .unwrap()
      .then(() => {
        toast.success('Item added to your wishlist!');
      })
      .catch((error) => {
        toast.error(error || 'Failed to add item to wishlist.');
      });
  };

  const handleImageClick = () => setIsZoomed(true);  // Open zoom modal on image click
  const handleCloseZoom = () => setIsZoomed(false);   // Close zoom modal on close click

  return loading ? (
    <div className="flex justify-center items-center h-screen">
    <ClipLoader color="#36D7B7" size={50} /> {/* Spinner */}
  </div>
  ) : productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      <nav className="text-gray-600 text-sm mb-6">
        <Link to="/" className="hover:text-gray-800">Home</Link>
        <span> / </span>
        <Link to={`/collection`} className="hover:text-gray-800">{productData.category?.category}</Link>
        <span> / </span>
        <span className="text-gray-800">{productData.productName}</span>
      </nav>

      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/* Product Images */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <ProductImageGallery
            images={productData.images}
            currentImage={currentImage}
            onImageClick={setCurrentImage}
          />
          {/* Zoom */}
          <div className="w-full sm:w-[80%] relative flex">
            <img
              className="w-full h-auto cursor-pointer"
              src={currentImage}
              alt={productData.productName}
              onClick={handleImageClick} // Open zoom modal on image click
            />
          </div>
          {/* Zoom */}
          {/* <div className="w-full sm:w-[80%] relative flex">
            <img className="w-full h-auto" src={`http://localhost:3000/${currentImage}`} alt={productData.productName} />
          </div> */}
        </div>

        {/* Product Info */}
        <ProductInfo  productData={ productData}  size={size} setSize={setSize} onAddToCart={handleAddToCart} onAddToWishlist={handleAddToWishlist}/>
      </div>


        {/* Zoom Modal */}
        {isZoomed && (
        <ZoomModal imageSrc={currentImage} onClose={handleCloseZoom} />
      )}

      {/* Description & Review Section */}
      <div className="mt-20">
        <div className="flex">
          <b
            className="border px-5 py-3 text-sm cursor-pointer"
            onClick={() => setActiveSection('description')}
          >
            Description
          </b>
          {/* <p
            className="border px-5 py-3 text-sm cursor-pointer"
            onClick={() => setActiveSection('reviews')}
          >
            Reviews ({dummyReviews.length})
          </p> */}
        </div>
        {activeSection === 'description' ? (
          <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
            <p>An e-commerce website is an online platform where businesses sell goods...</p>
          </div>
        ) : (
          <Reviews reviews={dummyReviews} />
        )}
      </div>

      {/* Related Products */}
      <RelatedProducts
        category={productData.category?._id}
        subCategory={productData.subCategory?._id}
        products={products}
        currentProductId={productID}
      />
    </div>
  ) : (
    <div>Product not found</div>
  );
};

export default Product;
