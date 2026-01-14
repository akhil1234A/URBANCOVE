const Cart = require('../models/Cart');
const PricingService = require('./pricing.service');

class CartService {
   async getCart(userId) {
      const cart = await Cart.find({ userId }).populate(
            'productId',
            'productName stock images size isActive price category subCategory'
          );
      return cart;
   }

   async calculateLivePrice(cartItems){

     // 2. Extract products directly from populated cart
    const products = cartItems.map(item => item.productId);

    // 3. Calculate live prices in ONE call
    const pricedProducts =
      await PricingService.calculatePriceForProducts(products);

    // 4. Build a lookup map (O(1))
    const priceMap = new Map(
      pricedProducts.map(p => [p._id.toString(), p.discountedPrice])
    );

    // 5. Build response items
    const items = cartItems.map(item => {
      const livePrice = priceMap.get(item.productId._id.toString());
      const previewPrice = Math.min(item.cartPrice, livePrice);

      return {
        _id: item._id,
        productId: item.productId._id,
        productName: item.productId.productName,
        images: item.productId.images?.[0],
        originalPrice: item.basePrice,
        cartPrice: item.cartPrice,
        price: previewPrice,
        quantity: item.quantity,
        stock: item.productId.stock,
        size: item.productId.size,
        isActive: item.productId.isActive,
      };
    });

    return items;
   }

   async calculateTotal(cartItems){
    const { cartPriceTotal, total } = cartItems.reduce(
      (acc, item) => {
        acc.cartPriceTotal += item.cartPrice * item.quantity;
        acc.total += item.price * item.quantity;
        return acc;
      },
      { cartPriceTotal: 0, total: 0 }
    );

    const priceChanged = cartPriceTotal !== total;

    return { cartPriceTotal, total, priceChanged };
   }
}


module.exports = new CartService();