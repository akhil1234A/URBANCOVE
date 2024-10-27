import React, { useState } from 'react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ id: '', name: '', status: 'listed' });

  const handleAddCategory = () => {
    setShowModal(true);
    setIsEditing(false);
    setCurrentCategory({ id: '', name: '', status: 'listed' }); // Default to listed
  };

  const handleEditCategory = (category) => {
    setShowModal(true);
    setIsEditing(true);
    setCurrentCategory(category);
  };

  const handleSave = () => {
    if (isEditing) {
      setCategories(categories.map(cat => (cat.id === currentCategory.id ? currentCategory : cat)));
    } else {
      setCategories([...categories, { id: Date.now(), name: currentCategory.name, status: currentCategory.status }]);
    }
    setShowModal(false);
  };

  const handleChange = (e) => {
    setCurrentCategory({ ...currentCategory, [e.target.name]: e.target.value });
  };

  const toggleStatus = (categoryId) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId ? { ...cat, status: cat.status === 'listed' ? 'unlisted' : 'listed' } : cat
    ));
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      <button 
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        onClick={handleAddCategory}
      >
        Add Category
      </button>

      <ul className="mb-4">
        {categories.map(category => (
          <li key={category.id} className="flex justify-between items-center py-2">
            <span className="text-lg">{category.name} ({category.status})</span>
            <div>
              <button 
                className={`text-white px-3 py-1 rounded ${category.status === 'listed' ? 'bg-red-500' : 'bg-green-500'}`}
                onClick={() => toggleStatus(category.id)}
              >
                {category.status === 'listed' ? 'Unlist' : 'List'}
              </button>
              <button 
                className="bg-yellow-500 text-white px-3 py-1 rounded ml-2"
                onClick={() => handleEditCategory(category)}
              >
                Edit
              </button>
            </div>
          </li>
        ))}
      </ul>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-600 bg-opacity-50">
          <div className="bg-white p-5 rounded shadow-lg w-96">
            <h2 className="text-lg font-semibold">{isEditing ? 'Edit Category' : 'Add Category'}</h2>
            <input 
              type="text" 
              name="name" 
              value={currentCategory.name} 
              onChange={handleChange} 
              placeholder="Category Name" 
              className="border border-gray-300 p-2 w-full rounded mt-2"
            />
            <select 
              name="status" 
              value={currentCategory.status} 
              onChange={handleChange} 
              className="border border-gray-300 p-2 w-full rounded mt-2"
            >
              <option value="listed">Listed</option>
              <option value="unlisted">Unlisted</option>
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

export default Categories;
