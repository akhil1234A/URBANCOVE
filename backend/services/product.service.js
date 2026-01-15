const Product = require('../models/Product');
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");

class ProductService {
  async listActiveProducts({ page, limit, search, productId, inStock = true, min=0, max=Infinity, sort, categoryName, subCategoryName }) {
    let query = { isActive: true };
    let sortQuery = { createdAt: -1 };
    const emptyResult = { products: [], totalCount: 0 };


    if (productId) {
      query._id = productId;
    }

    if (search) {
      query.productName = { $regex: search, $options: 'i' };
    }

    if (inStock == "true") {
      query.stock = { $gt: 0 };
    }
    
    if (min > 0 || max < Infinity) {
      query.price = {};
      if (min > 0) query.price.$gte = min;
      if (max < Infinity) query.price.$lte = max;
    }

    switch(sort){
      case 'price-low-high':
        sortQuery = { price: 1 };
        break;
      case 'price-high-low':
        sortQuery = { price: -1 };
        break;
      case 'name-a-z':
        sortQuery = { productName: 1 };
        break;
      case 'name-z-a':
        sortQuery = { productName: -1 };
        break;
      case 'newest':
        sortQuery = { createdAt: -1 };
        break;
      case 'oldest':
        sortQuery = { createdAt: 1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    const categoryNames = categoryName
      ? categoryName.split(",").map((c) => c.trim())
      : [];

    const subCategoryNames = subCategoryName
      ? subCategoryName.split(",").map((s) => s.trim())
      : [];


    // CASE 1: category + subCategory (MULTI)
    if (categoryNames.length && subCategoryNames.length) {
      const categories = await Category.find({
        category: { $in: categoryNames.map(n => new RegExp(`^${n}$`, "i")) }
      });

      if (!categories.length) return emptyResult;

      const subCategories = await SubCategory.find({
        subCategory: { $in: subCategoryNames.map(n => new RegExp(`^${n}$`, "i")) },
        category: { $in: categories.map(c => c._id) }
      });

      if (!subCategories.length) return emptyResult;

      query.category = { $in: categories.map(c => c._id) };
      query.subCategory = { $in: subCategories.map(sc => sc._id) };
    }

    // CASE 2: only categories (MULTI)
    else if (categoryNames.length) {
      const categories = await Category.find({
        category: { $in: categoryNames.map(n => new RegExp(`^${n}$`, "i")) }
      });


      if (!categories.length) return emptyResult;

      query.category = { $in: categories.map(c => c._id) };
    }

    // CASE 3: only subCategories (MULTI, BROAD)
    else if (subCategoryNames.length) {
      const subCategories = await SubCategory.find({
        subCategory: { $in: subCategoryNames.map(n => new RegExp(`^${n}$`, "i")) }
      });

      if (!subCategories.length) return emptyResult;

      query.subCategory = { $in: subCategories.map(sc => sc._id) };
    }


    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate('category subCategory')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);
  

    const totalCount = await Product.countDocuments(query);

    return { products, totalCount };
  }

  async getLatestProducts(limit = 10) {
    return Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('category subCategory');
  }

  async getBestSellerProducts(limit = 10) {
    return Product.find({ isActive: true, isBestSeller: true })
      .limit(limit)
      .populate('category subCategory');
  }
}

module.exports = new ProductService();
