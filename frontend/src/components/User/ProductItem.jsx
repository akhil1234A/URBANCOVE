import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa'; // Wishlist heart icon
import { FaTag } from 'react-icons/fa';  // Offer tag icon

const ProductItem = ({ id, image, name, price, currency, discountedPrice }) => {
  // Calculate discount percentage
  const hasDiscount = discountedPrice && discountedPrice < price;
  const discountPercentage = hasDiscount
    ? Math.round(((price - discountedPrice) / price) * 100)
    : 0;

  return (
    <Link className="text-gray-700 cursor-pointer relative" to={`/product/${id}`}>
      <div className="relative overflow-hidden">
        {/* Conditional Offer Tag */}
        {hasDiscount && (
          <div className="absolute top-0 left-0 bg-red-600 text-white px-2 py-1 text-xs rounded-br-lg z-10">
            <FaTag className="inline mr-1 text-white" />
            <span>{discountPercentage}% Off</span>
          </div>
        )}

        <img
          className="hover:scale-110 transition ease-in-out"
          src={image}
          alt={name}
          onError={(e) => {
            e.target.onerror = null; // Prevent looping
            e.target.src = 'fallback-image-url'; // Replace with your actual fallback image URL
          }}
        />
      </div>

      {/* Product Name */}
      <p className="pt-3 pb-1 text-sm">{name}</p>

      {/* Price and Discounted Price */}
      <p className="text-sm font-medium">
        {hasDiscount ? (
          <>
            <span className="line-through text-gray-500 mr-2">
              {currency}{price.toFixed(2)}
            </span>
            <span className="text-red-600">
              {currency}{discountedPrice.toFixed(2)}
            </span>
          </>
        ) : (
          <span>
            {currency}{price.toFixed(2)}
          </span>
        )}
      </p>

      {/* Wishlist Icon */}
      <div className="absolute top-1 right-5 text-xl text-gray-700 opacity-75 hover:opacity-100 z-20">
        <FaHeart className="cursor-pointer hover:text-red-500" />
      </div>
    </Link>
  );
};

export default ProductItem;
