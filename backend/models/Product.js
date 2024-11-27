const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    productDescription: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, 
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', required: false }, 
    price: { type: Number, required: true },
    discountedPrice: {type: Number, required:false},
    stock: { type: Number, required: true },
    size: { type: [String], required: true }, 
    images: { type: [String], required: true }, 
    isBestSeller: { type: Boolean, default: false }, 
    isActive:{type:Boolean, default: true},
}, { timestamps: true }); 

module.exports = mongoose.model('Product', ProductSchema);
