import React, { useState } from 'react';

const SubCategory = ({ categories }) => {
  const [subCategories, setSubCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentSubCategory, setCurrentSubCategory] = useState({ id: '', name: '', categoryId: '' });

  const handleAddSubCategory = () => {
    setShowModal(true);
    setCurrentSubCategory({ id: '', name: '', categoryId: '' });
  };

  const handleSave = () => {
    setSubCategories([...subCategories, { ...currentSubCategory, id: Date.now() }]);
    setShowModal(false);
  };

  const handleChange = (e) => {
    setCurrentSubCategory({ ...currentSubCategory, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Sub Categories</h1>
      <button 
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        onClick={handleAddSubCategory}
      >
        Add Sub Category
      </button>

      <ul className="mb-4">
        {subCategories.map(subCategory => (
          <li key={subCategory.id} className="flex justify-between items-center py-2">
            <span className="text-lg">{subCategory.name} (Category ID: {subCategory.categoryId})</span>
          </li>
        ))}
      </ul>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-600 bg-opacity-50">
          <div className="bg-white p-5 rounded shadow-lg w-96">
            <h2 className="text-lg font-semibold">Add Sub Category</h2>
            <input 
              type="text" 
              name="name" 
              value={currentSubCategory.name} 
              onChange={handleChange} 
              placeholder="Sub Category Name" 
              className="border border-gray-300 p-2 w-full rounded mt-2"
            />
            <select 
              name="categoryId" 
              value={currentSubCategory.categoryId} 
              onChange={handleChange} 
              className="border border-gray-300 p-2 w-full rounded mt-2"
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <div className="flex justify-between mt-4">
              <button 
                className="bg-gray-400 text-white px-4 py-2 rounded" 
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleSave}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubCategory;
