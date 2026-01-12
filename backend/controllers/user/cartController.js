const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const logger = require("../../utils/logger");
const httpStatus = require("../../constants/httpStatus");
const Messages = require("../../constants/messages");
const PricingService = require("../../services/pricing.service");

const MAX_QUANTITY_PER_USER = 5;

/**
 * User: Add to cart
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: Messages.PRODUCT_NOT_FOUND });
    }

    if (product.stock < quantity) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: Messages.INSUFFICIENT_STOCK });
    }

    let cartItem = await Cart.findOne({ userId, productId });
    if (cartItem) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({
          message: "Product already in cart. Please update the quantity.",
        });
    }

    if (quantity > MAX_QUANTITY_PER_USER) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({
          message: `Maximum quantity per user for this product is ${MAX_QUANTITY_PER_USER}`,
        });
    }

    const cartPrice = await PricingService.calculateProductPrice(product);

    cartItem = new Cart({
      userId,
      basePrice: product.price,
      cartPrice,
      productId,
      quantity,
    });
    await cartItem.save();

    // Decrease product stock after successful addition to cart
    // product.stock -= quantity;
    // await product.save();

    res
      .status(httpStatus.CREATED)
      .json({ message: "Item added to cart", cartItem });
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

/**
 * User: Update cart item quantity
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.updateCartItemQuantity = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const userId = req.user.id;

  try {
    const cartItem = await Cart.findOne({ userId, productId });
    if (!cartItem) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: Messages.CART_ITEM_NOT_FOUND });
    }

    const product = await Product.findById(productId);
    if (!product || product.stock + cartItem.quantity < quantity) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: Messages.INSUFFICIENT_STOCK });
    }

    if (quantity > MAX_QUANTITY_PER_USER) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({
          message: `Maximum quantity per user for this product is ${MAX_QUANTITY_PER_USER}`,
        });
    }

    // Adjust stock based on quantity change
    // product.stock += cartItem.quantity - quantity;
    // await product.save();

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(httpStatus.OK).json({ message: "Cart item updated", cartItem });
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

/**
 * User: Remove from cart
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.removeFromCart = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    const cartItem = await Cart.findOne({ userId, productId });
    if (!cartItem) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: Messages.CART_ITEM_NOT_FOUND });
    }

    await Cart.findOneAndDelete({ userId, productId });

    // Re-stock the product
    // const product = await Product.findById(productId);
    // if (product) {
    //   product.stock += cartItem.quantity;
    //   await product.save();
    //   logger.info("Product stock updated:", product);
    // } else {
    //   logger.error("Product not found for stock update");
    // }

    res.status(httpStatus.OK).json({ message: "Item removed from cart" });
  } catch (error) {
    logger.error("Error in removeFromCart:", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

/**
 * User: Get all cart items for a user
 * @param {*} req
 * @param {*} res
 */
exports.getUserCart = async (req, res) => {
  const userId = req.user.id;

  try {
    const cartItems = await Cart.find({ userId }).populate(
      "productId",
      "productName stock images size isActive"
    );

    const formattedCartItems = cartItems.map((item) => ({
      _id: item._id,
      productId: item.productId._id,
      productName: item.productId.productName,
      images: item.productId.images[0],
      price: item.cartPrice,
      originalPrice: item.basePrice,
      stock: item.productId.stock,
      quantity: item.quantity,
      size: item.productId.size,
      isActive: item.productId.isActive,
    }));

    res.status(httpStatus.OK).json({ cartItems: formattedCartItems });
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

exports.cartCheckout = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Fetch cart items with product data
    const cartItems = await Cart.find({ userId }).populate(
      'productId',
      'productName stock images size isActive price category subCategory'
    );

    if (!cartItems || cartItems.length === 0) {
      return res.status(httpStatus.OK).json({
        cartItems: [],
        cartPriceTotal: 0,
        total: 0,
        priceChanged: false,
      });
    }

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

    // 6. Correct totals (quantity-aware)
    const { cartPriceTotal, total } = items.reduce(
      (acc, item) => {
        acc.cartPriceTotal += item.cartPrice * item.quantity;
        acc.total += item.price * item.quantity;
        return acc;
      },
      { cartPriceTotal: 0, total: 0 }
    );

    const priceChanged = cartPriceTotal !== total;

    res.status(httpStatus.OK).json({
      cartItems: items,
      cartPriceTotal,
      total,
      priceChanged,
    });
  } catch (error) {
    console.error(error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: 'Something went wrong' });
  }
};

