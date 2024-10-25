const mongoose = require('mongoose');

const SubCategorySchema = new mongoose.Schema({
    subCategory: { type: String, required: true, unique:true},
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },  
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

//compound index to ensure that each subCategory is unique per category
SubCategorySchema.index({ subCategory: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('SubCategory', SubCategorySchema);
