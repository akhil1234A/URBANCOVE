const Category = require('../../models/Category');
const Product = require('../../models/Product');
const logger = require('../../utils/logger');
const httpStatus = require('../../constants/httpStatus');
const Messages = require('../../constants/messages');

 /**
  * List all categories 
  * @param {*} req 
  * @param {*} res 
  */
exports.listCategories = async (req, res) => {
  try {
   
    const isActive = req.query.isActive === 'true';
    
    
    const categories = isActive 
      ? await Category.find({ isActive: true })
      : await Category.find();

    res.status(httpStatus.OK).json(categories);
  } catch (error) {
    logger.error(error.message)
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.SERVER_ERROR, error });
  }
};

/**
 * Add a category 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.addCategory = async(req,res)=>{
  const {category} = req.body;

   if (!category || !category.trim()) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: Messages.CATEGORY_REQUIRED });
  }

 
  const nameRegex = /^[A-Za-z\s]+$/;
  if (!nameRegex.test(category)) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: Messages.CATEGORY_INVALID });
  }

  try{
    const existingCategory = await Category.findOne({ category });
    if (existingCategory) {
      return res.status(httpStatus.CONFLICT).json({ message: Messages.CATEGORY_EXISTS });
    }

    const newCategory = new Category({category});
    await newCategory.save();
    res.status(httpStatus.CREATED).json({message: Messages.CATEGORY_ADDED, newCategory});
  }
  catch(error){
    logger.error(error.message);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: Messages.SERVER_ERROR, error: error.message});
  }

};

/**
 * Admin: Edit a category
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.editCategory = async (req, res) => {
  const { category, isActive } = req.body;

   
   if (!category || !category.trim()) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: Messages.CATEGORY_REQUIRED });
  }

  
  const nameRegex = /^[A-Za-z\s]+$/;
  if (!nameRegex.test(category)) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: Messages.CATEGORY_INVALID });
  }

  try {

    const existingCategory = await Category.findOne({ category });
    if (existingCategory && existingCategory._id.toString() !== req.params.id) {
      return res.status(httpStatus.CONFLICT).json({ message: Messages.CATEGORY_EXISTS });
    }
    
     const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { category, isActive },
      { new: true, runValidators: true } 
    );

      if (!updatedCategory) return res.status(httpStatus.NOT_FOUND).json({ message: Messages.CATEGORY_NOT_FOUND });

      if (isActive === false) {
        await Product.updateMany(
          { category: updatedCategory._id },
          { isActive: false }
        );
      }

      res.json(updatedCategory);
  } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.SERVER_ERROR, error });
  }
};

/**
 * Admin: Delete a category (soft delete)
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.deleteCategory = async (req, res) => {
  try {
      const category = await Category.findById(req.params.id);
      if (!category) return res.status(httpStatus.NOT_FOUND).json({ message: Messages.CATEGORY_NOT_FOUND });

      category.isActive = !category.isActive;
      await category.save();

      res.json({ message: Messages.CATEGORY_SOFT_DELETED });
  } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.SERVER_ERROR, error });
  }
};