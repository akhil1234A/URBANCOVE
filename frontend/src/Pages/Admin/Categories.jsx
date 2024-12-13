import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, addCategory, updateCategory, toggleCategoryStatus } from '../../slices/admin/categorySlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ClipLoader } from 'react-spinners';

const Categories = () => {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.categories);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ id: '', name: '', status: 'listed' });
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      dispatch(fetchCategories(token));
    }
  }, [dispatch]);

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
    const token = localStorage.getItem('adminToken');

    const nameRegex = /^[A-Za-z\s]+$/; // Allows letters and spaces only

    if (!currentCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

  if (!nameRegex.test(currentCategory.name)) {
    toast.error('Category name should contain only letters');
    return;
  }

    setLoadingAction(true);
  
    try {
      // Dispatch action based on the `isEditing` state
      if (isEditing) {
        await dispatch(updateCategory({
          token,
          categoryId: currentCategory.id,
          category: { category: currentCategory.name, isActive: currentCategory.status === 'listed' }
        })).unwrap(); // `unwrap` ensures rejection throws an error for `catch`
        toast.success('Category updated successfully');
      } else {
        await dispatch(addCategory({
          token,
          category: { category: currentCategory.name, isActive: currentCategory.status === 'listed' }
        })).unwrap();
        toast.success('Category added successfully');
      }
    } catch (error) {
      toast.error(`Failed to save category: ${error.message || error}`); // Display error
    } finally {
      setLoadingAction(false);
      setShowModal(false);
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

      {loading ? (
        <div className="flex justify-center items-center h-screen">
        <ClipLoader color="#36D7B7" size={50} /> {/* Spinner */}
      </div>
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
              onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
              placeholder="Category Name" 
              className="border border-gray-300 p-2 w-full rounded mt-2"
            />
            <select 
              name="status" 
              value={currentCategory.status} 
              onChange={(e) => setCurrentCategory({ ...currentCategory, status: e.target.value })}
              className="border border-gray-300 p-2 w-full rounded mt-2"
            >
              <option value="listed">Listed</option>
              <option value="unlisted">Unlisted</option>
            </select>
            <div className="flex justify-between mt-4">
              <button 
                className="bg-gray-400 text-white px-4 py-2 rounded" 
                onClick={() => {
                  setShowModal(false);
                  setCurrentCategory({ id: '', name: '', status: 'listed' }); // Reset state on close
                }}
              >
                Close
              </button>
              <button 
                className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${loadingAction ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleSave}
                disabled={loadingAction} // Disable while loading
              >
                {loadingAction ? 'Saving...' : 'Save Changes'}
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
