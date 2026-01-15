const Product = require('../models/Product');

class ProductService {
  async listActiveProducts({ page, limit, search, productId, inStock = true, min=0, max=Infinity }) {
    let query = { isActive: true };

    if (productId) {
      query._id = productId;
    }

    if (search) {
      query.productName = { $regex: search, $options: 'i' };
    }

    if (inStock == "true") {
      query.stock = { $gt: 0 };
    }
    
    if (min > 0) {
      query.price = { $gte: min };
    }

    if (max < Infinity) {
      query.price = { $lte: max };
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate('category subCategory')
      .sort({ createdAt: -1 })
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
