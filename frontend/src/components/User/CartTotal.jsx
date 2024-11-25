import Title from './Title';

const CartTotal = ({ subtotal, deliveryFee, total, discount=0 }) => {
  const currency = "₹";
  const discountedTotal = total - discount;

  return (
    <div className="w-full">
      <div className="text-2xl">
        <Title text1={'CART'} text2={'TOTALS'} />
      </div>

      <div className="flex flex-col gap-2 mt-2 text-sm">
        <div className="flex justify-between">
          <p>Subtotal</p>
          <p>{currency} {subtotal.toFixed(2)}</p>
        </div>
        <hr />
        <div className="flex justify-between">
          <p>Shipping Fee</p>
          <p>{currency} {deliveryFee.toFixed(2)}</p>
        </div>
        <hr />
        {discount > 0 && (
          <div className="flex justify-between">
            <p>Discount</p>
            <p>{currency} {discount.toFixed(2)}</p>
          </div>
        )}
        <hr />
        <div className="flex justify-between">
          <b>Total</b>
          <b>{currency} {discountedTotal.toFixed(2)}</b>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;
