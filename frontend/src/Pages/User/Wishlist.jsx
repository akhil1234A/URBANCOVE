import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Title from "../../components/User/Title";
import { toast } from "react-toastify";
import {
  fetchWishlist,
  removeFromWishlist,
  clearWishlistError,
} from "../../slices/user/wishlistSlice";
import {
  addToCart,
  clearCartError,
} from "../../slices/user/cartSlice";
import { assets } from "../../assets/assets";

const Wishlist = () => {
  const dispatch = useDispatch();

  const { items: wishlistItems, error: wishlistError } = useSelector(
    (state) => state.wishlist
  );
  const { error: cartError } = useSelector((state) => state.cart);
  const products = useSelector((state) => state.products.items);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  useEffect(() => {
    if (wishlistError) {
      toast.error(wishlistError);
      dispatch(clearWishlistError());
    }
    if (cartError) {
      toast.error(cartError);
      dispatch(clearCartError());
    }
  }, [wishlistError, cartError, dispatch]);

  const handleAddToCart = (productId) => {
    const product = wishlistItems.find(
      (item) => item.productId._id === productId
    )?.productId;
  
    if (!product) {
      toast.error("Product not found.");
      return;
    }
    if (!product.isActive) {
      toast.error("This product is inactive.");
      return;
    }
    if (product.stock < 1) {
      toast.error("Product is out of stock.");
      return;
    }
  
    dispatch(addToCart({ productId, quantity: 1 }));
    toast.success("Added to Cart");
  };
  

  const handleRemoveFromWishlist = (productId) => {
    dispatch(removeFromWishlist(productId));
    toast.success("removed from wishlist")
  };

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <Title text1={"YOUR"} text2={"WISHLIST"} />
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center text-xl font-medium text-gray-600">
          Your wishlist is currently empty. Add your favorite products now!
        </div>
      ) : (
        <div>
          {wishlistItems.map((item) => {
  const product = item.productId; 
  const isInvalid =
    !product || !product.isActive || product.stock < 1;

  return (
    <div
      key={item._id}
      className={`py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4 ${
        isInvalid ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start gap-6">
        <img
          className="w-16 sm:w-20"
          src={
            product?.images?.length
              ? product.images[0]
              : "https://via.placeholder.com/80"
          }
          alt={product?.productName || "Product"}
        />
        <div>
          <p className="text-xs sm:text-lg font-medium">
            {product?.productName || "Product not found"}
          </p>
          <div className="flex items-center gap-5 mt-2">
            <p>
              ₹
              {product?.discountedPrice
                ? product.discountedPrice.toFixed(2)
                : "0.00"}
            </p>
            <p className="px-2 sm:px-3 sm:py-1 border bg-slate-50">
              {product?.size || "N/A"}
            </p>
          </div>
          {isInvalid && (
            <p className="text-red-500 text-sm">
              {product
                ? !product.isActive
                  ? "This product is inactive."
                  : "Product is out of stock."
                : "Product not found."}
            </p>
          )}
        </div>
      </div>
      <button
        className="bg-blue-500 text-white text-sm px-4 py-1 disabled:opacity-50"
        onClick={() => handleAddToCart(product._id)}
        disabled={isInvalid}
      >
        Add to Cart
      </button>
      <img
        className="w-4 sm:w-5 cursor-pointer"
        src={assets.bin_icon}
        alt="Remove"
        onClick={() => handleRemoveFromWishlist(product._id)}
      />
    </div>
  );
})}

        </div>
      )}
    </div>
  );
};

export default Wishlist;
