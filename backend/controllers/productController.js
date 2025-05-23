const Product = require('../models/Product');
const Offer = require('../models/Offer');
const fs = require('fs');
const uploadToCloudinary = require('../utils/cloudinaryUploader')
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');
const logger = require('../utils/logger');


const processImage = async (filePath) => {
  try {
    const url = await uploadToCloudinary(filePath, 'products'); 
    fs.unlinkSync(filePath); 
    return url;
  } catch (error) {
    throw new Error('Image processing failed');
  }
};


// Home: List All Active Products 
exports.listProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, productId, search } = req.query;

    let query = { isActive: true };

    if (productId) {
      query._id = productId;
    }

    // Apply search filter if provided
    if (search) {
      query.productName = { $regex: search, $options: 'i' }; 
    }

    // Define pagination and sorting options
    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      sort: { createdAt: -1 }, 
    };

    const products = await Product.find(query)
      .populate('category subCategory')
      .limit(options.limit) 
      .skip(options.skip)
      .sort(options.sort);

    const totalCount = await Product.countDocuments(query);

    const activeOffers = await Offer.find({
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });

    const updatedProducts = await Promise.all(
      products.map(async (product) => {
        const subCategoryId = product.subCategory?._id || product.subCategory;

        // Identify offers applicable to the product
        const productOffer = activeOffers.find(
          (offer) =>
            offer.type === 'product' &&
            offer.products.some((productId) => productId.toString() === product._id.toString())
        );

        const categoryOffer = activeOffers.find(
          (offer) =>
            offer.type === 'category' &&
            offer.categories.some((categoryId) => categoryId.toString() === subCategoryId?.toString())
        );

        // Calculate discounts
        let productDiscount = 0;
        let categoryDiscount = 0;

        if (productOffer) {
          productDiscount =
            productOffer.discountType === 'percentage'
              ? (product.price * productOffer.discountValue) / 100
              : productOffer.discountValue;
        }

        if (categoryOffer) {
          categoryDiscount =
            categoryOffer.discountType === 'percentage'
              ? (product.price * categoryOffer.discountValue) / 100
              : categoryOffer.discountValue;
        }

        // Apply the highest discount
        const discount = Math.max(productDiscount, categoryDiscount);
        const discountedPrice = product.price - discount;
        const finalDiscountedPrice = discountedPrice < 0 ? 0 : discountedPrice;

        // Optionally update product's discounted price in the database
        try {
          await Product.updateOne(
            { _id: product._id },
            { $set: { discountedPrice: finalDiscountedPrice } }
          );
        } catch (error) {
          console.error(`Failed to update product ID ${product._id}:`, error);
        }

        return {
          ...product.toObject(),
          discountedPrice: finalDiscountedPrice,
        };
      })
    );

    res.json({
      products: updatedProducts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};



//Home: Latest Products 
exports.getLatestProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }) 
      .sort({ createdAt: -1 }) 
      .limit(10)
      .populate('category subCategory');

    const activeOffers = await Offer.find({
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });

    const updatedProducts = await Promise.all(
      products.map(async (product) => {
        const subCategoryId = product.subCategory?._id || product.subCategory;

        // Identify offers applicable to the product
        const productOffer = activeOffers.find(
          (offer) =>
            offer.type === 'product' &&
            offer.products.some((productId) => productId.toString() === product._id.toString())
        );

        const categoryOffer = activeOffers.find(
          (offer) =>
            offer.type === 'category' &&
            offer.categories.some((categoryId) => categoryId.toString() === subCategoryId?.toString())
        );

        // Calculate discounts
        let productDiscount = 0;
        let categoryDiscount = 0;

        if (productOffer) {
          productDiscount =
            productOffer.discountType === 'percentage'
              ? (product.price * productOffer.discountValue) / 100
              : productOffer.discountValue;
        }

        if (categoryOffer) {
          categoryDiscount =
            categoryOffer.discountType === 'percentage'
              ? (product.price * categoryOffer.discountValue) / 100
              : categoryOffer.discountValue;
        }

        // Apply the highest discount
        const discount = Math.max(productDiscount, categoryDiscount);
        const discountedPrice = product.price - discount;
        const finalDiscountedPrice = discountedPrice < 0 ? 0 : discountedPrice;

        return {
          ...product.toObject(),
          discountedPrice: finalDiscountedPrice,
        };
      })
    );

    res.json({ products: updatedProducts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

//Home: Best Seller's
exports.getBestSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, isBestSeller: true })
      .limit(10) 
      .populate('category subCategory');

    const activeOffers = await Offer.find({
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });

    const updatedProducts = await Promise.all(
      products.map(async (product) => {
        const subCategoryId = product.subCategory?._id || product.subCategory;

        // Identify offers applicable to the product
        const productOffer = activeOffers.find(
          (offer) =>
            offer.type === 'product' &&
            offer.products.some((productId) => productId.toString() === product._id.toString())
        );

        const categoryOffer = activeOffers.find(
          (offer) =>
            offer.type === 'category' &&
            offer.categories.some((categoryId) => categoryId.toString() === subCategoryId?.toString())
        );

        // Calculate discounts
        let productDiscount = 0;
        let categoryDiscount = 0;

        if (productOffer) {
          productDiscount =
            productOffer.discountType === 'percentage'
              ? (product.price * productOffer.discountValue) / 100
              : productOffer.discountValue;
        }

        if (categoryOffer) {
          categoryDiscount =
            categoryOffer.discountType === 'percentage'
              ? (product.price * categoryOffer.discountValue) / 100
              : categoryOffer.discountValue;
        }

        // Apply the highest discount
        const discount = Math.max(productDiscount, categoryDiscount);
        const discountedPrice = product.price - discount;
        const finalDiscountedPrice = discountedPrice < 0 ? 0 : discountedPrice;

        return {
          ...product.toObject(),
          discountedPrice: finalDiscountedPrice,
        };
      })
    );

    res.json({ products: updatedProducts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


//Admin: List All Products
exports.adminListProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, productId } = req.query;

    let query = {}; // Admin can see all products

    if (productId) {
      query._id = productId;
    }

    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
    };

    const products = await Product.find(query)
      .populate('category subCategory')
      .limit(options.limit)
      .skip(options.skip);

    const totalCount = await Product.countDocuments(query);

    res.json({
      products,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


// Admin: Add a New Product
exports.addProduct = async (req, res) => {
    const { productName, productDescription, category, subCategory, price, stock, size, isBestSeller } = req.body;
    try {
        if (req.files.length < 3) return res.status(400).json({ message: 'At least 3 images are required' });
        const images = await Promise.all(req.files.map(async (file) => await processImage(file.path)));
        const newProduct = new Product({ 
            productName, 
            productDescription, 
            category, 
            subCategory, 
            price, 
            stock, 
            size: Array.isArray(size) ? size : [size], 
            images, 
            isBestSeller 
        });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        logger.error(error.message);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Admin: Edit a Product
exports.editProduct = async (req, res) => {
  const { 
    productName, 
    productDescription, 
    category, 
    subCategory, 
    price, 
    stock, 
    size, 
    isBestSeller, 
    isActive, 
    removeImages 
  } = req.body;

  let newImages = [];

  try {
    // Process new image uploads
    if (req.files && req.files.length > 0) {
      newImages = await Promise.all(req.files.map(async (file) => await processImage(file.path)));
    }

    // Retrieve the current product
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Filter out images marked for removal
    const imagesToRemove = Array.isArray(removeImages) 
      ? removeImages 
      : JSON.parse(removeImages || '[]');
    
    const updatedImages = product.images.filter(img => !imagesToRemove.includes(img));

    // Combine existing and new images
    const finalImages = [...updatedImages, ...newImages];

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...(productName && { productName }),
        ...(productDescription && { productDescription }),
        ...(category && { category }),
        ...(subCategory && { subCategory }),
        ...(price && { price }),
        ...(stock && { stock }),
        ...(size && { size: Array.isArray(size) ? size : [size] }),
        ...(finalImages.length > 0 && { images: finalImages }), // Set updated images explicitly
        ...(typeof isBestSeller !== "undefined" && { isBestSeller }),
        ...(typeof isActive !== "undefined" && { isActive }),
      },
      { new: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};





// Admin: soft delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const { isActive } = req.body;
    const { productId } = req.params;

    const product = await Product.findById(productId).populate([
      { path: 'category', select: 'isActive' },
      { path: 'subCategory', select: 'isActive' }
    ]);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { category, subCategory } = product;


    if (isActive) {
      if (!category?.isActive) {
        logger.info('Category is inactive');
        return res.status(400).json({ 
          message: 'Cannot list product because the associated category is inactive.' 
        });
      }

      if (!subCategory?.isActive) {
        logger.info('SubCategory is inactive');
        return res.status(400).json({ 
          message: 'Cannot list product because the associated sub-category is inactive.' 
        });
      }
    }

    product.isActive = isActive;
    await product.save();

    res.json({
      isActive: product.isActive,
      message: `Product has been ${isActive ? 'listed' : 'unlisted'}`,
    });

  } catch (error) {
    console.error('Error in deleteProduct:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

