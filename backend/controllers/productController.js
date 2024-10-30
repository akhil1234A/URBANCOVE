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
        .resize(390, 450) // Resize to the specified dimensions
        .toFormat('png')  // Convert to PNG format
        .toFile(outputPath);

    fs.unlinkSync(filePath); // Remove the original file after processing
    return outputPath;
};


// list all products
exports.listProducts = async (req, res) => {
    try {
        const {productId} = req.params;
        const query = productId? {_id:productId} : {};
        const products = await Product.find(query).populate('category subCategory');  //populating the category and sub category details
        res.json(products);
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

// edit an existing product
exports.editProduct = async (req, res) => {
    const { productName, productDescription, category, subCategory, price, stock, size, isBestSeller } = req.body;
    let images;

    try {
        if (req.files) {
            if (req.files.length < 3) return res.status(400).json({ message: 'At least 3 images are required' });
            
            images = await Promise.all(req.files.map(async (file) => await processImage(file.path)));
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { 
                productName, 
                productDescription, 
                category, 
                subCategory, 
                price, 
                stock, 
                size: Array.isArray(size) ? size : [size], //size always an array  
                ...(images && { images }), // Only update images if they exist
                isBestSeller 
            },
            { new: true }
        );

        if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });

        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// soft delete a product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        product.isActive = !product.isActive;  // soft deleting
        await product.save();

        res.json({ message: 'Product has been soft deleted' });
    } catch (error) {
      
        res.status(500).json({ message: 'Server error', error });
    }
};
