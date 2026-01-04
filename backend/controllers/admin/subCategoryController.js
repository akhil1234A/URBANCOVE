const SubCategory = require('../../models/SubCategory');
const Category = require('../../models/Category');
const Product = require('../../models/Product');
const httpStatus = require('../../constants/httpStatus');
const Messages = require('../../constants/messages');


/**
 * Admin: Add a Sub Category
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.addSubCategory = async (req, res) => {
    const { subCategory, category} = req.body;


    try {
        const existingcategory = await Category.findById(category);
        if (!existingcategory) {
            return res.status(httpStatus.NOT_FOUND).json({ message: Messages.CATEGORY_NOT_FOUND });
        }

        const newSubCategory = new SubCategory({ subCategory, category});
        await newSubCategory.save();
        res.status(httpStatus.CREATED).json({ message: Messages.SUBCATEGORY_ADDED, newSubCategory });
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.SERVER_ERROR, error });
    }
};



/**
 * Admin: List all Sub Categories
 * @param {*} req
 * @param {*} res
 */
exports.listSubCategories = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const query = categoryId ? { category: categoryId } : {};
    const subCategories = await SubCategory.find(query).populate('category', 'category');
    res.status(httpStatus.OK).json(subCategories);
  } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.SERVER_ERROR, error });
  }
};


/**
 * Admin: Edit a Sub Category
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.editSubCategory = async (req, res) => {
  const { id } = req.params;
  const { subCategory, category, isActive } = req.body;
 
  try {

    const existingSubCategory = await SubCategory.findOne({
      subCategory,
      category,
      _id: { $ne: id }, 
    });
    
    if (existingSubCategory) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'A subcategory with the same name and category already exists.',
      });
    }
    
    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      id,
      { subCategory, category, isActive },
      { new: true }
    ).populate('category', '_id category');
    
      
      if (!updatedSubCategory) {
          return res.status(httpStatus.NOT_FOUND).json({ message: Messages.SUBCATEGORY_NOT_FOUND });
      }
      res.status(httpStatus.OK).json({ message: Messages.SUBCATEGORY_UPDATED, updatedSubCategory });

      if (isActive === false) {
        await Product.updateMany(
          { subCategory: updatedSubCategory._id },
          { isActive: false }
        );
      }
      
  } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.SERVER_ERROR, error });
  }
};

/**
 * Admin: Delete a Sub Category
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.deleteSubCategory = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  try {
  
    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!updatedSubCategory) {
      return res.status(httpStatus.NOT_FOUND).json({ message: Messages.SUBCATEGORY_NOT_FOUND });
    }

    if (isActive === false) {
      await Product.updateMany(
        { subCategory: updatedSubCategory._id },
        { isActive: false }
      );
    }

    res.status(httpStatus.OK).json({
      message: `Subcategory ${isActive ? 'activated' : 'deactivated'} successfully`,
      updatedSubCategory,
    });
  } catch (error) {
    console.error('Error toggling subcategory status:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.SERVER_ERROR, error });
  }
};


/**
 * Admin: List Unique Active Categories
 * @param {*} req
 * @param {*} res
 */
exports.listUniqueActiveCategories = async (req, res) => {
  try {
    const uniqueCategories = await Category.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category" } },
      { $sort: { _id: 1 } }, 
    ]);

    res.status(httpStatus.OK).json(
      uniqueCategories.map((item) => ({ category: item._id }))
    );
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.FAILED_TO_FETCH_CATEGORIES, error });
  }
};

/**
 * Admin: List Unique Active Sub Categories
 * @param {*} req
 * @param {*} res
 */
exports.listUniqueActiveSubCategories = async (req, res) => {
  try {
    const uniqueSubCategories = await SubCategory.aggregate([
      { $match: { isActive: true } }, 
      { $group: { _id: "$subCategory" } }, 
      { $sort: { _id: 1 } }, 
    ]);

    res.status(httpStatus.OK).json(
      uniqueSubCategories.map((item) => ({ subCategory: item._id }))
    );
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.FAILED_TO_FETCH_SUBCATEGORIES, error });
  }
};
