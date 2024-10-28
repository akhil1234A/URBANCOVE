import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ id: '', name: '', status: 'listed' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const token = localStorage.getItem('adminToken');
    console.log("Token retrieved:", token); // Log the token

    try {
      const response = await axios.get('http://localhost:3000/admin/categories', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("Fetched categories:", response.data); // Log the fetched data
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error); // Log the error details
      toast.error(`Error fetching categories: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleAddCategory = () => {
    setShowModal(true);
    setIsEditing(false);
    setCurrentCategory({ id: '', name: '', status: 'listed' });
  };

  const handleEditCategory = (category) => {
    setShowModal(true);
    setIsEditing(true);
    setCurrentCategory({ id: category._id, name: category.category, status: category.isActive ? 'listed' : 'unlisted' });
  };

  const handleSave = async () => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');

    try {
      if (isEditing) {
        const response = await axios.put(`http://localhost:3000/admin/categories/${currentCategory.id}`, {
          category: currentCategory.name,
          isActive: currentCategory.status === 'listed'
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        // Update the existing category in state
        setCategories(prevCategories => 
          prevCategories.map(cat => (cat._id === currentCategory.id ? response.data : cat))
        );
        toast.success('Category updated successfully');
      } else {
        const response = await axios.post('http://localhost:3000/admin/categories', {
          category: currentCategory.name,
          isActive: currentCategory.status === 'listed'
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Log the entire response to ensure correct structure
        console.log("Response from adding category:", response.data);
        
        // Extract the new category from the response
        const newCategory = response.data.newCategory;

        // Immediately update the categories state with the newly added category
        setCategories(prevCategories => [...prevCategories, newCategory]);
        toast.success('Category added successfully');
      }
    } catch (error) {
      toast.error(`Error saving category: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  const handleChange = (e) => {
    setCurrentCategory({ ...currentCategory, [e.target.name]: e.target.value });
  };

  const toggleStatus = async (categoryId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken'); // Use the correct token
      const updatedCategory = categories.find(cat => cat._id === categoryId);
      const response = await axios.put(`http://localhost:3000/admin/categories/${categoryId}`, {
        ...updatedCategory,
        isActive: !updatedCategory.isActive
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCategories(prevCategories => 
        prevCategories.map(cat => (cat._id === categoryId ? response.data : cat))
      );
      toast.success(`Category ${response.data.isActive ? 'listed' : 'unlisted'} successfully`);
    } catch (error) {
      toast.error(`Error updating category status: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
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

      {loading ? ( // Show loading state
        <div>Loading categories...</div>
      ) : (
        <ul className="mb-4">
          {categories.map(category => (
            <li 
              key={category._id} 
              className={`flex justify-between items-center py-2 ${category.isActive ? '' : 'text-gray-400'}`}
            >
              <span className="text-lg">{category.category} ({category.isActive ? 'Listed' : 'Unlisted'})</span>
              <div>
                <button 
                  className={`text-white px-3 py-1 rounded ${category.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                  onClick={() => toggleStatus(category._id)}
                >
                  {category.isActive ? 'Unlist' : 'List'}
                </button>
                <button 
                  className="bg-yellow-500 text-white px-3 py-1 rounded ml-2 hover:bg-yellow-600"
                  onClick={() => handleEditCategory(category)}
                >
                  Edit
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

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
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <ToastContainer />
    </div>
  );
};

export default Categories;
