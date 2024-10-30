const SubCategory = require('../models/SubCategory');
const Category = require('../models/Category');


exports.addSubCategory = async (req, res) => {
    const { subCategory, category} = req.body;
    console.log(req.body)
    console.log(category);

    try {
        const existingcategory = await Category.findById(category);
        console.log('category',category)
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



exports.listSubCategories = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const query = categoryId ? { category: categoryId } : {};
    const subCategories = await SubCategory.find().populate('category', 'category');
    res.status(200).json(subCategories);
  } catch (error) {
      res.status(500).json({ message: 'Server error', error });
  }
};

exports.editSubCategory = async (req, res) => {
  const { id } = req.params;
  const { subCategory, isActive } = req.body;

  try {
      const updatedSubCategory = await SubCategory.findByIdAndUpdate(id, { subCategory, isActive }, { new: true });
      if (!updatedSubCategory) {
          return res.status(404).json({ message: 'Subcategory not found' });
      }
      res.status(200).json({ message: "Subcategory updated successfully", updatedSubCategory });
  } catch (error) {
      res.status(500).json({ message: 'Server error', error });
  }
};

//soft delete mark active status false
exports.deleteSubCategory = async (req, res) => {
  const { id } = req.params;

  try {
      const deletedSubCategory = await SubCategory.findByIdAndUpdate(id, { isActive: false }, { new: true });
      if (!deletedSubCategory) {
          return res.status(404).json({ message: 'Subcategory not found' });
      }
      res.status(200).json({ message: "Subcategory soft deleted successfully", deletedSubCategory });
  } catch (error) {
      res.status(500).json({ message: 'Server error', error });
  }
};
