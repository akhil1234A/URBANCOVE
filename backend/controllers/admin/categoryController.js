const Category = require('../../models/Category');
const Product = require('../../models/Product');
const logger = require('../../utils/logger');


//Admin: Get All Categories
exports.listCategories = async (req, res) => {
  try {
   
    const isActive = req.query.isActive === 'true';
    
    
    const categories = isActive 
      ? await Category.find({ isActive: true })
      : await Category.find();

    res.status(200).json(categories);
  } catch (error) {
    logger.error(error.message)
    res.status(500).json({ message: 'Server error', error });
  }
};

// Admin: Add a new category
exports.addCategory = async(req,res)=>{
  const {category} = req.body;

   
   if (!category || !category.trim()) {
    return res.status(400).json({ message: 'Category name is required' });
  }

 
  const nameRegex = /^[A-Za-z\s]+$/;
  if (!nameRegex.test(category)) {
    return res.status(400).json({ message: 'Category name should contain only letters' });
  }

  try{
    const existingCategory = await Category.findOne({ category });
    if (existingCategory) {
      return res.status(409).json({ message: 'Category already exists' });
    }

    const newCategory = new Category({category});
    await newCategory.save();
    res.status(201).json({message:"new category added successfully",newCategory});
  }
  catch(error){
    logger.error(error.message);
    res.status(500).json({message: 'Server error', error: error.message});
  }

};

//Admin: edit an existing category

exports.editCategory = async (req, res) => {
  const { category, isActive } = req.body;

   
   if (!category || !category.trim()) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  
  const nameRegex = /^[A-Za-z\s]+$/;
  if (!nameRegex.test(category)) {
    return res.status(400).json({ message: 'Category name should contain only letters' });
  }

  try {

    const existingCategory = await Category.findOne({ category });
    if (existingCategory && existingCategory._id.toString() !== req.params.id) {
      return res.status(409).json({ message: 'Category name already exists' });
    }
    
     const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { category, isActive },
      { new: true, runValidators: true } 
    );

      if (!updatedCategory) return res.status(404).json({ message: 'Category not found' });

      if (isActive === false) {
        await Product.updateMany(
          { category: updatedCategory._id },
          { isActive: false }
        );
      }

      res.json(updatedCategory);
  } catch (error) {
      res.status(500).json({ message: 'Server error', error });
  }
};

//Admin: soft delete an category
exports.deleteCategory = async (req, res) => {
  try {
     
      const category = await Category.findById(req.params.id);
      if (!category) return res.status(404).json({ message: 'Category not found' });

      category.isActive = !category.isActive;  
      await category.save();

      res.json({ message: 'Category has been soft deleted' });
  } catch (error) {
      res.status(500).json({ message: 'Server error', error });
  }
};