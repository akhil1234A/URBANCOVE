import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  fetchSubCategoriesThunk,
  addSubCategoryThunk,
  updateSubCategoryThunk,
  toggleSubCategoryStatusThunk,
} from '../../slices/admin/subCategorySlice';
import { fetchCategories } from '../../slices/admin/categorySlice';
import { ClipLoader } from 'react-spinners';

const SubCategory = () => {
  const dispatch = useDispatch();
  const { list: subCategories, loading, error } = useSelector((state) => state.subCategories);
  const { categories = [] } = useSelector((state) => state.categories); 


  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSubCategory, setCurrentSubCategory] = useState({ id: '', subCategory: '', categoryId: '' });
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    dispatch(fetchCategories(token));
    dispatch(fetchSubCategoriesThunk(token));
  }, [dispatch, token]);

  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`);
    }
  }, [error]);

  const handleAddSubCategory = () => {
    setShowModal(true);
    setIsEditing(false);
    setCurrentSubCategory({ id: '', subCategory: '', categoryId: '' });
  };

  const handleEditSubCategory = (subCategory) => {
    setShowModal(true);
    setIsEditing(true);
    setCurrentSubCategory({
      id: subCategory._id,
      subCategory: subCategory.subCategory,
      categoryId: subCategory.category?._id || '',
    });
  };

  const handleSave = () => {
    if (!currentSubCategory.subCategory.trim()) {
      toast.error("Sub Category name cannot be empty.");
      return;
    }
    
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(currentSubCategory.subCategory)) {
      toast.error("Sub Category name must contain only letters.");
      return;
    }
  
    const data = {
      subCategory: currentSubCategory.subCategory,
      category: currentSubCategory.categoryId,
    };
  
    const action = isEditing
      ? updateSubCategoryThunk({ id: currentSubCategory.id, data, token })
      : addSubCategoryThunk({ data, token });
  
    dispatch(action)
      .unwrap()
      .then(() => {
        toast.success(`Sub Category ${isEditing ? 'updated' : 'added'} successfully`);
        setShowModal(false);
        if (!isEditing) dispatch(fetchSubCategoriesThunk(token));
      })
      .catch((error) => {
        toast.error(`Error: ${error}`);
      });
  };
  
  const handleToggleVisibility = (id) => {
    const subCategoryToToggle = subCategories.find((subCat) => subCat._id === id);
    if (!subCategoryToToggle) return; // Exit if not found to avoid errors

    const newVisibility = !subCategoryToToggle.isActive;
    dispatch(toggleSubCategoryStatusThunk({ id, isActive: newVisibility, token }))
      .unwrap()
      .then(() => toast.success(`Sub Category ${newVisibility ? 'listed' : 'unlisted'} successfully`))
      .catch((error) => toast.error(`Error: ${error}`));
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Sub Categories</h1>
      <button className="bg-blue-500 text-white px-4 py-2 rounded mb-4" onClick={handleAddSubCategory}>
        Add Sub Category
      </button>

      {loading ? (
         <div className="flex justify-center items-center h-screen">
         <ClipLoader color="#36D7B7" size={50} /> {/* Spinner */}
       </div>
      ) : (
        <ul className="mb-4">
          {Array.isArray(subCategories) && subCategories.map((subCategory) => {
            const category = categories.find((cat) => cat._id === subCategory.category?._id) || { category: 'Unknown' };
            return (
              <li key={subCategory._id} className={`flex justify-between items-center py-2 ${subCategory.isActive ? '' : 'text-gray-400'}`}>
                <span className="text-lg">{subCategory.category.category}'s {subCategory.subCategory} </span>
                <div>
                  <button className="bg-yellow-500 text-white px-3 py-1 rounded ml-2" onClick={() => handleEditSubCategory(subCategory)}>
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
              onChange={(e) => setCurrentSubCategory({ ...currentSubCategory, subCategory: e.target.value })}
              placeholder="Sub Category Name"
              className="border border-gray-300 p-2 w-full rounded mt-2"
            />
            <select
              name="categoryId"
              value={currentSubCategory.categoryId}
              onChange={(e) => {
                setCurrentSubCategory((prev) => ({ ...prev, categoryId: e.target.value }));
              }}
              className="border border-gray-300 p-2 w-full rounded mt-2"
            >
              <option value="">Select Category</option>
              {Array.isArray(categories) &&
                categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.category}
                  </option>
                ))}
            </select>

            <div className="flex justify-between mt-4">
              <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setShowModal(false)}>
                Close
              </button>
              <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default SubCategory;
