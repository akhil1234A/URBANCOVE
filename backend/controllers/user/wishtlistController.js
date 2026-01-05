const Wishlist = require("../../models/Wishlist");
const httpStatus = require("../../constants/httpStatus");
const pricingService = require("../../services/pricing.service");

/**
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
const addToWishlist = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  // Check if the product is already in the wishlist
  const wishlist = await Wishlist.findOne({ userId });
  if (
    wishlist &&
    wishlist.products.some((item) => item.productId.toString() === productId)
  ) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Product already in wishlist" });
  }

  // Add product to wishlist
  if (wishlist) {
    wishlist.products.push({ productId });
    await wishlist.save();
  } else {
    await Wishlist.create({ userId, products: [{ productId }] });
  }

  res.status(httpStatus.OK).json({ message: "Product added to wishlist" });
};

/**
 * User: remove from wishlist
 * @param {*} req
 * @param {*} res
 * @returns
 */
const removeFromWishlist = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  const wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) {
    return res
      .status(httpStatus.NOT_FOUND)
      .json({ message: "Wishlist not found" });
  }

  wishlist.products = wishlist.products.filter(
    (item) => item.productId.toString() !== productId
  );
  await wishlist.save();

  res.status(httpStatus.OK).json({ message: "Product removed from wishlist" });
};

/**
 * User: Get All Items from Wishlist
 * @param {*} req
 * @param {*} res
 */
const getWishlist = async (req, res) => {
  const userId = req.user.id;

  const wishlist = await Wishlist.findOne({ userId }).populate(
    "products.productId",
    "productName stock images size price isActive"
  );

  if (!wishlist || wishlist.products.length === 0) {
    return res.status(httpStatus.OK).json({ products: [] });
  }

  const products = wishlist.products.map((p) => p.productId);

  const updatedProducts = await pricingService.calculatePriceForProducts(
    products
  );

  // wishlist.products = await pricingService.calculateProductPrice(wishlist.products)

  res
    .status(httpStatus.OK)
    .json({ products: updatedProducts });
};

module.exports = { addToWishlist, removeFromWishlist, getWishlist };
