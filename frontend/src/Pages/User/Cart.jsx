import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Title from "../../components/User/Title";
import CartTotal from "../../components/User/CartTotal";
import { assets } from "../../assets/assets";
import {
  getUserCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCartError,
  setCartTotal,
} from "../../slices/user/cartSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();


  const { cartItems, total, error } = useSelector((state) => state.cart);
  const products = useSelector((state) => state.products.items);

  const loading = false;

  useEffect(() => {
    dispatch(getUserCart());
  }, [dispatch]);


  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearCartError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    dispatch(setCartTotal());
  }, [cartItems, dispatch]);

  // Derive invalid items based on stock and activity
  const invalidItems = cartItems.filter((item) => {
    const product = products.find((p) => p._id === item.productId);
    return !product || !product.isActive || product.stock < item.quantity;
  });

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }

    const product = products.find((item) => item._id === productId);

    if (product) {
      if (newQuantity > 5) {
        toast.error("Maximum quantity per user is 5");
        return;
      }
      if (newQuantity > product.stock) {
        toast.error("Insufficient stock");
        return;
      }
    }


    dispatch(updateCartItemQuantity({ productId, quantity: newQuantity }));
  };

  const handleRemoveItem = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handleCheckout = () => {
    if (invalidItems.length > 0) {
      toast.error(
        "Please remove out-of-stock or inactive items from your cart before proceeding."
      );
      return;
    }

    navigate("/checkout");
  };

  const deliveryFee = 40;
  const currency = "₹";

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center text-xl font-medium text-gray-600">
          Your cart is currently empty. Start shopping now!
        </div>
      ) : (
        <>
          <div>
            {cartItems.map((item) => {
              const product = products.find((p) => p._id === item.productId);
              const isInvalid =
                !product || !product.isActive || product.stock < item.quantity;

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
                        item.images?.length
                          ? item.images
                          : "https://via.placeholder.com/80"
                      }
                      alt={item.productName}
                    />
                    <div>
                      <p className="text-xs sm:text-lg font-medium">
                        {item.productName}
                      </p>
                      <div className="flex items-center gap-5 mt-2">
                        <p>
                          {currency}
                          {item.price ? item.price.toFixed(2) : "0.00"}
                          </p>
                        <p className="px-2 sm:px-3 sm:py-1 border bg-slate-50">
                          {item.sizes || "N/A"}
                        </p>
                      </div>
                      {isInvalid && (
                        <p className="text-red-500 text-sm">
                          {product
                            ? !product.isActive
                              ? "This product is inactive."
                              : "Insufficient stock."
                            : "Product not found."}
                        </p>
                      )}
                    </div>
                  </div>
                  <input
                    className="border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1"
                    type="number"
                    min={1}
                    max={product?.stock || 1}
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(item.productId, Number(e.target.value))
                    }
                    disabled={isInvalid}
                  />
                  <img
                    className="w-4 mr-4 sm:w-5 cursor-pointer"
                    src={assets.bin_icon}
                    alt="Remove"
                    onClick={() => handleRemoveItem(item.productId)}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-end my-20">
            <div className="w-full sm:w-[450px]">
              <CartTotal
                subtotal={total}
                deliveryFee={deliveryFee}
                total={total + deliveryFee}
              />
              <div className="w-full text-end">
                <button
                  onClick={handleCheckout}
                  className="bg-black text-white text-sm my-8 px-8 py-3"
                  disabled={loading || invalidItems.length > 0}
                >
                  {loading ? "Loading..." : "PROCEED TO CHECKOUT"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
