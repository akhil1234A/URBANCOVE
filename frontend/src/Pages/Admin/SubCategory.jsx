import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SubCategory = ({ categories }) => {
  const [subCategories, setSubCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSubCategory, setCurrentSubCategory] = useState({ id: '', subCategory: '', categoryId: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubCategories();
  }, []);

  const fetchSubCategories = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await axios.get('http://localhost:3000/admin/categories/subcategories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Fetched subcategories:", response.data); // Log the fetched data
      setSubCategories(response.data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      toast.error(`Error fetching subcategories: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleAddSubCategory = () => {
    setShowModal(true);
    setIsEditing(false);
    setCurrentSubCategory({ id: '', subCategory: '', categoryId: '' });
  };

  const handleEditSubCategory = (subCategory) => {
    setShowModal(true);
    setIsEditing(true);
    setCurrentSubCategory({ id: subCategory._id, subCategory: subCategory.subCategory, categoryId: subCategory.category?._id || '' });
  };

  const handleSave = async () => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');

    try {
      if (isEditing) {
        // Edit existing subcategory
        const response = await axios.put(
          `http://localhost:3000/admin/categories/subcategories/${currentSubCategory.id}`,
          {
            subCategory: currentSubCategory.subCategory,
            category: currentSubCategory.categoryId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Update the state with the edited subcategory
        setSubCategories(subCategories.map((subCat) => (subCat._id === currentSubCategory.id ? response.data.updatedSubCategory : subCat)));
        toast.success('Sub Category updated successfully');
      } else {
        // Add new subcategory
        const response = await axios.post(
          'http://localhost:3000/admin/categories/subcategories',
          {
            subCategory: currentSubCategory.subCategory,
            category: currentSubCategory.categoryId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Extract the new subcategory from the response
        const newSubCategory = response.data.newSubCategory;

        // Immediately update the subCategories state with the newly added subcategory
        setSubCategories([...subCategories, newSubCategory]);
        toast.success('Sub Category added successfully');
      }
    } catch (error) {
      toast.error(`Error saving subcategory: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentSubCategory((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleVisibility = async (id) => {
    const token = localStorage.getItem('adminToken');
    setLoading(true);
    try {
      const subCategoryToToggle = subCategories.find((subCat) => subCat._id === id);
      const newVisibility = !subCategoryToToggle.isActive; // Toggle the isActive state

      await axios.put(`http://localhost:3000/admin/categories/subcategories/${id}`, {
        isActive: newVisibility,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSubCategories(subCategories.map(subCat => 
        subCat._id === id ? { ...subCat, isActive: newVisibility } : subCat
      ));
      toast.success(`Sub Category ${newVisibility ? 'listed' : 'unlisted'} successfully`);
    } catch (error) {
      toast.error(`Error toggling visibility: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
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

      {loading ? ( 
        <div>Loading subcategories...</div>
      ) : (
        <ul className="mb-4">
          {subCategories.map(subCategory => {
            // Find the corresponding category name using category._id
            const category = categories.find(cat => cat._id === subCategory.category?._id) || { category: 'Unknown' };
            return (
              <li key={subCategory._id} className={`flex justify-between items-center py-2 ${subCategory.isActive ? '' : 'text-gray-400'}`}>
                <span className="text-lg">{subCategory.subCategory} (Category: {category.category})</span>
                <div>
                  <button 
                    className="bg-yellow-500 text-white px-3 py-1 rounded ml-2"
                    onClick={() => handleEditSubCategory(subCategory)}
                  >
                    Edit
                  </button>
                  <button 
                    className={`px-3 py-1 rounded ml-2 ${subCategory.isActive ? 'bg-red-500' : 'bg-green-500'} text-white`}
                    onClick={() => handleToggleVisibility(subCategory._id)} 
                  >
                    {subCategory.isActive ? 'Unlist' : 'List'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-600 bg-opacity-50">
          <div className="bg-white p-5 rounded shadow-lg w-96">
            <h2 className="text-lg font-semibold">{isEditing ? 'Edit Sub Category' : 'Add Sub Category'}</h2>
            <input 
              type="text" 
              name="subCategory" 
              value={currentSubCategory.subCategory} 
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
                <option key={category._id} value={category._id}>{category.category}</option>
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

export default SubCategory;
