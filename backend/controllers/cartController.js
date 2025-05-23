
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const logger = require('../utils/logger');


const MAX_QUANTITY_PER_USER = 5; 

// User: Add to cart
exports.addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        let cartItem = await Cart.findOne({ userId, productId });
        if (cartItem) {
            return res.status(400).json({ message: 'Product already in cart. Please update the quantity.' });
        }

        if (quantity > MAX_QUANTITY_PER_USER) {
            return res.status(400).json({ message: `Maximum quantity per user for this product is ${MAX_QUANTITY_PER_USER}` });
        }

        cartItem = new Cart({
            userId,
            productId,
            quantity,
        });
        await cartItem.save();

        // Decrease product stock after successful addition to cart
        // product.stock -= quantity;
        // await product.save();

        res.status(201).json({ message: 'Item added to cart', cartItem });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// User: Update cart item quantity
exports.updateCartItemQuantity = async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    try {
        const cartItem = await Cart.findOne({ userId, productId });
        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        const product = await Product.findById(productId);
        if (!product || product.stock + cartItem.quantity < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        if (quantity > MAX_QUANTITY_PER_USER) {
            return res.status(400).json({ message: `Maximum quantity per user for this product is ${MAX_QUANTITY_PER_USER}` });
        }

        // Adjust stock based on quantity change
        // product.stock += cartItem.quantity - quantity;
        // await product.save();

        cartItem.quantity = quantity;
        await cartItem.save();

        res.status(200).json({ message: 'Cart item updated', cartItem });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// User: Remove from cart
exports.removeFromCart = async (req, res) => {
    const { productId } = req.params;
    const userId = req.user.id;

    try {
        
        const cartItem = await Cart.findOne({ userId, productId });
        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }


      
        await Cart.findOneAndDelete({ userId, productId });

        // Re-stock the product
        const product = await Product.findById(productId);
        if (product) {
            product.stock += cartItem.quantity;
            await product.save();
            logger.info('Product stock updated:', product);
        } else {
            logger.error('Product not found for stock update');
        }

        res.status(200).json({ message: 'Item removed from cart' });
    } catch (error) {
        logger.error('Error in removeFromCart:', error);
        res.status(500).json({ message: error.message });
    }
};

// User: Get all cart items for a user
exports.getUserCart = async (req, res) => {
    const userId = req.user.id;

    try {
        const cartItems = await Cart.find({ userId }).populate('productId', 'productName price discountedPrice stock images size isActive');

        const formattedCartItems = cartItems.map(item => ({
            _id: item._id,
            productId: item.productId._id,
            productName: item.productId.productName,
            images: item.productId.images[0],
            price: item.productId.discountedPrice, 
            originalPrice: item.productId.price,
            stock: item.productId.stock,
            quantity: item.quantity,
            size: item.productId.size,
            isActive:item.productId.isActive
        }));

       
        res.status(200).json({ cartItems: formattedCartItems });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
