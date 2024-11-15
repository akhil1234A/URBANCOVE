import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Title from "../../components/User/Title";
import CartTotal from "../../components/User/CartTotal";
import { assets } from "../../assets/assets";
import {
  getUserCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCartError,
  setCartTotal
} from "../../slices/user/cartSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Access cart items and error state from Redux store
  const { cartItems, total, error } = useSelector((state) => state.cart);
  const loading = false
 

  useEffect(() => {
    dispatch(getUserCart());
  }, [dispatch]);

  // Display error as toast if error exists in the store
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearCartError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    dispatch(setCartTotal());
  }, [cartItems, dispatch]);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }

    // Find the item to check the stock limit
    const item = cartItems.find((item) => item._id === productId);
    if (item) {
      if (newQuantity > 5) {
        toast.error("Maximum quantity per user is 5");
        return;
      }
      if (newQuantity > item.productId.stock) {
        toast.error("Insufficient stock");
        return;
      }
      
    }

    // Dispatch action to update cart item quantity
    dispatch(updateCartItemQuantity({ productId, quantity: newQuantity }));
  };

  const handleRemoveItem = (productId) => {
    console.log(productId);
    // Dispatch action to remove item from cart
    dispatch(removeFromCart(productId));
  };



   // Set delivery fee (you can adjust this as needed)
   const deliveryFee = 10; // Static delivery fee, can be calculated dynamically
 


  const currency = "$";

  const handleCheckout = () => {
    navigate("/checkout");
  };

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>

      <div>
        {cartItems.map((item) => (
          <div
            key={item._id}
            className="py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
          >
            <div className="flex items-start gap-6">
              <img
                className="w-16 sm:w-20"
                // Access first image from productId.images array, or fallback to placeholder
                src={
                  item.productId.images?.length
                    ? `http://localhost:3000/${item.productId.images[0]}`
                    : "https://via.placeholder.com/80"
                }
                alt={item.productId.productName}
              />
              <div>
                <p className="text-xs sm:text-lg font-medium">
                  {item.productId.productName} {/* Use productId.productName */}
                </p>
                <div className="flex items-center gap-5 mt-2">
                  <p>
                    {currency}
                    {item.price.toFixed(2)}
                  </p>
                  <p className="px-2 sm:px-3 sm:py-1 border bg-slate-50">
                    {item.size || "N/A"}
                  </p>
                </div>
              </div>
            </div>
            <input
              className="border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1"
              type="number"
              min={1}
              max={item.productId.stock} // max input limit for stock
              value={item.quantity}
              onChange={(e) => handleQuantityChange(item.productId._id, Number(e.target.value))}
            />
            <img
              className="w-4 mr-4 sm:w-5 cursor-pointer"
              src={assets.bin_icon}
              alt="Remove"
              onClick={() => handleRemoveItem(item.productId._id)}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end my-20">
        <div className="w-full sm:w-[450px]">
            <CartTotal subtotal={total} deliveryFee={deliveryFee} total={total+deliveryFee} />
          <div className="w-full text-end">
            <button
              onClick={handleCheckout}
              className="bg-black text-white text-sm my-8 px-8 py-3"
              disabled={loading} // Disable button if loading
            >
              {loading ? "Loading..." : "PROCEED TO CHECKOUT"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
