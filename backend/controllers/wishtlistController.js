const Wishlist = require('../models/Wishlist');



//User: Add to Wishlist
const addToWishlist = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;



  // Check if the product is already in the wishlist
  const wishlist = await Wishlist.findOne({ userId });
  if (wishlist && wishlist.products.some((item) => item.productId.toString() === productId)) {
    return res.status(400).json({ message: 'Product already in wishlist' });
  }

  // Add product to wishlist
  if (wishlist) {
    wishlist.products.push({ productId });
    await wishlist.save();
  } else {
    await Wishlist.create({ userId, products: [{ productId }] });
  }

  res.status(200).json({ message: 'Product added to wishlist' });
};


//User: Remove From Wishlist
const removeFromWishlist = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  const wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) {
    return res.status(404).json({ message: 'Wishlist not found' });
  }

  wishlist.products = wishlist.products.filter(
    (item) => item.productId.toString() !== productId
  );
  await wishlist.save();



  res.status(200).json({ message: 'Product removed from wishlist' });
};

//User: Get All Items from Wishlist
const getWishlist = async (req, res) => {
  const userId = req.user.id;

  const wishlist = await Wishlist.findOne({ userId }).populate('products.productId', 'productName discountedPrice stock images size isActive');

  

  console.log(wishlist);
  res.status(200).json(wishlist || { products: [] });
};

module.exports = {addToWishlist, removeFromWishlist, getWishlist }