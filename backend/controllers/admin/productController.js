const Product = require("../../models/Product");
const fs = require("fs");
const uploadToCloudinary = require("../../utils/cloudinaryUploader");
const logger = require("../../utils/logger");
const httpStatus = require("../../constants/httpStatus");
const Messages = require("../../constants/messages");
const productService = require("../../services/product.service");
const pricingService = require("../../services/pricing.service");
const HttpStatus = require("../../constants/httpStatus");

const processImage = async (filePath) => {
  try {
    const url = await uploadToCloudinary(filePath, "products");
    fs.unlinkSync(filePath);
    return url;
  } catch (error) {
    throw new Error(Messages.IMAGE_PROCESSING_FAILED);
  }
};

/**
 * Home: List Products with Pagination, Search, and Offers
 * @param {*} req
 * @param {*} res
 */
exports.listProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, productId, search, inStock, min, max, sort, categoryNames, subCategoryNames} = req.query;

    const { products, totalCount } = await productService.listActiveProducts({
      page: Number(page),
      limit: Number(limit),
      productId,
      search,
      inStock,
      min,
      max,
      sort,
      categoryName: categoryNames,
      subCategoryName: subCategoryNames
    });


    const updatedProducts = await pricingService.calculatePriceForProducts(products)

    res.json({
      products: updatedProducts,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
    });
  } catch (error) {
    res.status(500).json({ message: Messages.SERVER_ERROR });
  }
};

/**
 * Home: Get Latest Products
 * @param {*} req
 * @param {*} res
 */
exports.getLatestProducts = async (req, res) => {
  const products = await productService.getLatestProducts();
  const updatedPrice = await pricingService.calculatePriceForProducts(products)

  res.json({
    products: updatedPrice
  });
};

/**
 * Home: Get Best Seller Products
 * @param {*} req
 * @param {*} res
 */
exports.getBestSellerProducts = async (req, res) => {
  try {
    const products = await productService.getBestSellerProducts();
    const updatedPrice = await pricingService.calculatePriceForProducts(products)

    return res.status(HttpStatus.OK).json({
      products: updatedPrice
    })

  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: Messages.SERVER_ERROR, error });
  }
};

// Admin: List Products with Pagination, Search, and Filtering
exports.adminListProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, productId } = req.query;

    let query = {};

    if (productId) {
      query._id = productId;
    }

    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
    };

    const products = await Product.find(query)
      .populate("category subCategory")
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
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: Messages.SERVER_ERROR, error });
  }
};

/**
 * Admin: Add a Product
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.addProduct = async (req, res) => {
  const {
    productName,
    productDescription,
    category,
    subCategory,
    price,
    stock,
    size,
    isBestSeller,
  } = req.body;
  try {
    if (req.files.length < 3)
      return res
        .status(400)
        .json({ message: "At least 3 images are required" });
    const images = await Promise.all(
      req.files.map(async (file) => await processImage(file.path))
    );
    const newProduct = new Product({
      productName,
      productDescription,
      category,
      subCategory,
      price,
      stock,
      size: Array.isArray(size) ? size : [size],
      images,
      isBestSeller,
    });
    await newProduct.save();
    res.status(httpStatus.CREATED).json(newProduct);
  } catch (error) {
    logger.error(error.message);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: Messages.SERVER_ERROR, error });
  }
};

/**
 * Admin: Edit a Product
 * @param {*} req
 * @param {*} res
 * @returns
 */
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
    removeImages,
  } = req.body;

  let newImages = [];

  try {
    // Process new image uploads
    if (req.files && req.files.length > 0) {
      newImages = await Promise.all(
        req.files.map(async (file) => await processImage(file.path))
      );
    }

    // Retrieve the current product
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: Messages.PRODUCT_NOT_FOUND });
    }

    // Filter out images marked for removal
    const imagesToRemove = Array.isArray(removeImages)
      ? removeImages
      : JSON.parse(removeImages || "[]");

    const updatedImages = product.images.filter(
      (img) => !imagesToRemove.includes(img)
    );

    // Combine existing and new images
    const finalImages = [...updatedImages, ...newImages];

    if (finalImages.length == 0) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: "Select atleast one image" });
    }

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
        ...(finalImages.length > 0 && { images: finalImages }),
        ...(typeof isBestSeller !== "undefined" && { isBestSeller }),
        ...(typeof isActive !== "undefined" && { isActive }),
      },
      { new: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    console.error("Server error:", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: Messages.SERVER_ERROR, error: error.message });
  }
};

/**
 * Admin: Delete a Product (Soft Delete)
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { isActive } = req.body;
    const { productId } = req.params;

    const product = await Product.findById(productId).populate([
      { path: "category", select: "isActive" },
      { path: "subCategory", select: "isActive" },
    ]);

    if (!product) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: Messages.PRODUCT_NOT_FOUND });
    }

    const { category, subCategory } = product;

    if (isActive) {
      if (!category?.isActive) {
        logger.info("Category is inactive");
        return res.status(httpStatus.BAD_REQUEST).json({
          message: Messages.CATEGORY_INACTIVE,
        });
      }

      if (!subCategory?.isActive) {
        logger.info("SubCategory is inactive");
        return res.status(httpStatus.BAD_REQUEST).json({
          message: Messages.SUBCATEGORY_INACTIVE,
        });
      }
    }

    product.isActive = isActive;
    await product.save();

    res.json({
      isActive: product.isActive,
      message: `Product has been ${isActive ? "listed" : "unlisted"}`,
    });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: Messages.SERVER_ERROR, error });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: Messages.PRODUCT_NOT_FOUND });
    }
    const products = await Product.find({
      category: product.category,
      subCategory: product.subCategory,
    })

    const relatedProducts = products.filter((item) => item._id.toString() !== product._id.toString()).slice(0, 4);


    res.json({ product, relatedProducts });
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: Messages.SERVER_ERROR, error });
  }
};