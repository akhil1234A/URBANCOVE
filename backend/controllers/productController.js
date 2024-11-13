const Product = require('../models/Product');
const Category = require('../models/Category');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');


const processImage = async (filePath) => {
    const outputDir = path.join('uploads', 'products');
    const outputFilename = `processed-${Date.now()}.png`;
    const outputPath = path.join(outputDir, outputFilename);

    await sharp(filePath)
        .resize(390, 450) 
        .toFormat('png')  
        .toFile(outputPath);

    fs.unlinkSync(filePath); 
    return outputPath;
};


// list all products
exports.listProducts = async (req, res) => {
    try {
      // console.log(req.query);
      const { type } = req.params;
      const { page = 1, limit = 10, isAdmin = false, productId} = req.query;      

    

      let query = isAdmin === 'true' ? {} : { isActive: true };


      if (productId) {
        query._id = productId;
      } else {
        if (type === 'latest') {
          query = { ...query }; 
        } else if (type === 'bestSeller') {
          query = { ...query, isBestSeller: true };
        }
      }
     

      const options = {
        limit: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit),
        sort: type === 'latest' ? { createdAt: -1 } : {}
    };
  
      const products = await Product.find(query)
        .populate('category subCategory')
        .limit(options.limit)
        .skip(options.skip)
        .sort(options.sort); 
  

      const totalCount = await Product.countDocuments(query);
      
      res.json({
        products,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount
    });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };


  

// add a new product
exports.addProduct = async (req, res) => {
    const { productName, productDescription, category, subCategory, price, stock, size, isBestSeller } = req.body;
    console.log(req.body);
    console.log(req.files);
    try {
        if (req.files.length < 3) return res.status(400).json({ message: 'At least 3 images are required' });
        const images = await Promise.all(req.files.map(async (file) => await processImage(file.path)));
        console.log(images);
        const newProduct = new Product({ 
            productName, 
            productDescription, 
            category, 
            subCategory, 
            price, 
            stock, 
            size: Array.isArray(size) ? size : [size], //ensure size always an array 
            images, 
            isBestSeller 
        });
        console.log(newProduct);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error', error });
    }
};


exports.editProduct = async (req, res) => {
  const { productName, productDescription, category, subCategory, price, stock, size, isBestSeller, isActive } = req.body;
  let images;
  console.log('form body', req.body);
  console.log('form files', req.files);

  try {
    if (req.files) {
      // Ensure at least 3 images are uploaded
      // if (Array.isArray(req.files) && req.files.length < 3) {
      //   return res.status(400).json({ message: 'At least 3 images are required' });
      // }

      // Handle single or multiple file uploads
      if (Array.isArray(req.files) && req.files.length>0) {
        images = await Promise.all(req.files.map(async (file) => await processImage(file.path)));
      } 
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        productName, 
        productDescription, 
        category, 
        subCategory, 
        price, 
        ...(stock && { stock }),
        ...(size && { size: Array.isArray(size) ? size : [size] }), // Ensures size is always an array
        ...(images && { images }), // Only update images if they exist
        isBestSeller,
        ...(typeof isActive !== 'undefined' && { isActive }) // Update isActive only if provided
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log('Updated product:', updatedProduct);
    res.json(updatedProduct);

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// soft delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const { isActive } = req.body;
    const { productId } = req.params;

    

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Update only isActive status
    product.isActive = isActive;
    await product.save();

    res.json({ isActive: product.isActive, message: `Product has been ${isActive ? 'listed' : 'unlisted'}` });
} catch (error) {
    res.status(500).json({ message: 'Server error', error });
}
};
