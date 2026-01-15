const Product = require('../models/Product');

class ProductService {
  async listActiveProducts({ page, limit, search, productId, inStock = true, min=0, max=Infinity, sort }) {
    let query = { isActive: true };
    let sortQuery = { createdAt: -1 };

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
