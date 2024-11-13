import React from "react";
import Title from "../../components/User/Title";
import CartTotal from "../../components/User/CartTotal";
import { assets } from "../../assets/assets";
const Cart = () => {
  // Dummy cart data for UI display
  const cartData = [
    {
      _id: "1",
      name: "Wireless Headphones",
      size: "M",
      quantity: 2,
      price: 59.99,
      image: "https://via.placeholder.com/80",
    },
    {
      _id: "2",
      name: "Smartwatch",
      size: "L",
      quantity: 1,
      price: 120.0,
      image: "https://via.placeholder.com/80",
    },
  ];

  const currency = "$";

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>

      <div>
        {cartData.map((item, index) => (
          <div
            key={index}
            className="py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4"
          >
            <div className="flex items-start gap-6">
              <img
                className="w-16 sm:w-20"
                src={item.image}
                alt={item.name}
              />
              <div>
                <p className="text-xs sm:text-lg font-medium">
                  {item.name}
                </p>
                <div className="flex items-center gap-5 mt-2">
                  <p>
                    {currency}
                    {item.price.toFixed(2)}
                  </p>
                  <p className="px-2 sm:px-3 sm:py-1 border bg-slate-50">
                    {item.size}
                  </p>
                </div>
              </div>
            </div>
            <input
              className="border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1"
              type="number"
              min={1}
              defaultValue={item.quantity}
            />
            <img
              className="w-4 mr-4 sm:w-5 cursor-pointer"
              src={assets.bin_icon}
              alt="Remove"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end my-20">
        <div className="w-full sm:w-[450px]">
          <CartTotal />
          <div className="w-full text-end">
            <button
              className="bg-black text-white text-sm my-8 px-8 py-3"
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
