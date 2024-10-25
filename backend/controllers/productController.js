const Product = require('../models/Product');
const Category = require('../models/Category'); 

// list all products
exports.listProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('category subCategory');  //populating the category and sub category details
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// add a new product
exports.addProduct = async (req, res) => {
    const { productName, productDescription, category, subCategory, price, stock, size, color, isBestSeller } = req.body;
    const images = req.files.map(file => file.path); // upload images

    try {
        const newProduct = new Product({ 
            productName, 
            productDescription, 
            category, 
            subCategory, 
            price, 
            stock, 
            size: Array.isArray(size) ? size : [size], //ensure size always an array 
            color, 
            images, 
            isBestSeller 
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
      console.log(error)
        res.status(500).json({ message: 'Server error', error });
    }
};

// edit an existing product
exports.editProduct = async (req, res) => {
    const { productName, productDescription, category, subCategory, price, stock, size, color, isBestSeller } = req.body;
    const images = req.files ? req.files.map(file => file.path) : undefined; //upload images if any 

    try {
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
                color, 
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
