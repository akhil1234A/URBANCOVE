const SubCategory = require('../models/SubCategory');
const Category = require('../models/Category');
const Product = require('../models/Product');


//Admin: Add a Sub Category 
exports.addSubCategory = async (req, res) => {
    const { subCategory, category} = req.body;
    // console.log(req.body)
    // console.log(category);

    try {
        const existingcategory = await Category.findById(category);
        // console.log('category',category)
        if (!existingcategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const newSubCategory = new SubCategory({ subCategory, category});
        await newSubCategory.save();
        res.status(201).json({ message: "Subcategory added successfully", newSubCategory });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


//Admin: List all Sub Categories 
exports.listSubCategories = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const query = categoryId ? { category: categoryId } : {};
    const subCategories = await SubCategory.find(query).populate('category', 'category');
    res.status(200).json(subCategories);
  } catch (error) {
      res.status(500).json({ message: 'Server error', error });
  }
};


//Admin: Edit a Sub Category
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
      return res.status(400).json({
        message: 'A subcategory with the same name and category already exists.',
      });
    }
    
    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      id,
      { subCategory, category, isActive },
      { new: true }
    ).populate('category', '_id category');
    
      console.log(updatedSubCategory);
      if (!updatedSubCategory) {
          return res.status(404).json({ message: 'Subcategory not found' });
      }
      res.status(200).json({ message: "Subcategory updated successfully", updatedSubCategory });

      if (isActive === false) {
        await Product.updateMany(
          { subCategory: updatedSubCategory._id },
          { isActive: false }
        );
      }
      
  } catch (error) {
      res.status(500).json({ message: 'Server error', error });
  }
};

//Admin: Delete a Sub Category
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
      return res.status(404).json({ message: 'Subcategory not found' });
    }

    res.status(200).json({
      message: `Subcategory ${isActive ? 'activated' : 'deactivated'} successfully`,
      updatedSubCategory,
    });
  } catch (error) {
    console.error('Error toggling subcategory status:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};
