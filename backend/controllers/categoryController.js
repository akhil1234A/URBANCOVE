const Category = require('../models/Category');

//list all categories

exports.listCategories = async(req,res)=>{
  try{
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch(error){
    console.log(error);
    res.status(500).json({message: 'Server error', error});
  }
}

// add a new category
exports.addCategory = async(req,res)=>{
  const {category} = req.body;

  try{
    const newCategory = new Category({category});
    await newCategory.save();
    res.status(201).json({message:"new category added successfully",newCategory});
  }
  catch(error){
    console.log(error);
    res.status(500).json({message: 'Server error', error});
  }

};

//edit an existing category

exports.editCategory = async (req, res) => {
  const { category, isActive } = req.body;

  try {
      const updatedCategory = await Category.findByIdAndUpdate(
          req.params.id,
          { category, isActive },
          { new: true }  
      );

      if (!updatedCategory) return res.status(404).json({ message: 'Category not found' });

      res.json(updatedCategory);
  } catch (error) {
      res.status(500).json({ message: 'Server error', error });
  }
};

//soft delete an category
exports.deleteCategory = async (req, res) => {
  try {
      const category = await Category.findById(req.params.id);
      if (!category) return res.status(404).json({ message: 'Category not found' });

      category.isActive = !category.isActive;  //soft delete
      await category.save();

      res.json({ message: 'Category has been soft deleted' });
  } catch (error) {
      res.status(500).json({ message: 'Server error', error });
  }
};