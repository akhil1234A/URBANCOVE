import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProductsForUser, selectProducts, selectLoading, setCurrentPage } from '../../slices/admin/productSlice';
import { fetchWishlist } from '../../slices/user/wishlistSlice';
import { assets } from '../../assets/assets';
import Title from '../../components/User/Title';
import ProductItem from '../../components/User/ProductItem';
import { ClipLoader } from 'react-spinners';
import { isTokenExpired } from '../../utils/jwtdecode';
import { userAxios } from '../../utils/api';
import { toast } from 'react-toastify';

const Collection = () => {
  const dispatch = useDispatch();
  const currency = '₹';

  const { items: wishlistItems, error: wishlistError } = useSelector((state) => state.wishlist);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isTokenExpired(token)) {
      dispatch(fetchWishlist());
    }
  }, [dispatch]);

  const isInWishlist = (productId) => {
    return wishlistItems.some((wishlistItem) => wishlistItem._id === productId);
  };

  const productList = useSelector(selectProducts);
  const loading = useSelector(selectLoading);

  const currentPage = useSelector((state) => state.products.currentPage);
  const totalPages = useSelector((state) => state.products.totalPages);
  const itemsPerPage = 12;
  const search = useSelector((state) => state.products.search);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inStock, setInStock] = useState(true);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(Infinity);
  const [sort, setSort] = useState('newest');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);


  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setIsLoading(true);
        const [categoriesResponse, subCategoriesResponse] = await Promise.all([
          userAxios.get('/collection/categories'),
          userAxios.get('/collection/subcategories'),
        ]);
        setCategories(categoriesResponse.data);
        setSubCategories(subCategoriesResponse.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch collections.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, []);

  useEffect(() => {
    dispatch(fetchProductsForUser({ page: currentPage, limit: itemsPerPage, search, inStock, min, max, sort, categoryNames: selectedCategories.join(','), subCategoryNames: selectedSubCategories.join(',') }));
    console.log("triggred");
  }, [dispatch, currentPage, search, sort]);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      dispatch(setCurrentPage(page));
    }
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
  };


  const handleInStockChange = () => {
    setInStock(prev => !prev);
  };

  const handlePriceRangeChange = (min, max) => {
    if (min > max) {
      toast.error('Invalid price range');
      return;
    }
    setMin(min);
    setMax(max);
  };

  const handleCategoryFilterChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSubCategoryFilterChange = (subCategory) => {
    setSelectedSubCategories((prev) =>
      prev.includes(subCategory)
        ? prev.filter((s) => s !== subCategory)
        : [...prev, subCategory]
    );
  };


  const applyFilters = async () => {
    dispatch(fetchProductsForUser({ page: currentPage, limit: itemsPerPage, search, inStock, min, max, sort, categoryNames: selectedCategories.join(','), subCategoryNames: selectedSubCategories.join(',') }));
    dispatch(setCurrentPage(1));
  };


  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader color="#36D7B7" size={50} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-center text-red-500">
          {error.message || 'An unexpected error occurred.'} <br />
          <span className="text-sm text-gray-600">
            Please try reloading the page or contact support if the problem persists.
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>

      {/* Filter options */}
      <div className='min-w-60'>
        <p className='my-2 text-xl flex items-center cursor-pointer gap-2'>FILTERS
          <img className={`h-3 sm:hidden`} src={assets.dropdown_icon} alt="" />
        </p>


        {/* Category filter */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 sm:block`}>
          <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            {categories.map((category) => (
              <p key={category._id} className='flex gap-2'>
                <input
                  className='w-3'
                  type="checkbox"
                  value={category.category}
                  checked={selectedCategories.includes(category.category)}
                  onChange={() => handleCategoryFilterChange(category.category)}
                />
                {category.category}
              </p>
            ))}
          </div>
        </div>

        {/* Subcategory filter */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 sm:block`}>
          <p className='mb-3 text-sm font-medium'>TYPE</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            {subCategories.map((subCategory) => (
              <p key={subCategory._id} className='flex gap-2'>
                <input
                  className='w-3'
                  type="checkbox"
                  value={subCategory.subCategory}
                  checked={selectedSubCategories.includes(subCategory.subCategory)}
                  onChange={() => handleSubCategoryFilterChange(subCategory.subCategory)}
                />
                {subCategory.subCategory}
              </p>
            ))}
          </div>
        </div>

        {/* Price range filter */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 sm:block`}>
          <p className='mb-3 text-sm font-medium'>PRICE RANGE</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <input
              type="number"
              placeholder="Min Price"
              value={min}
              onChange={(e) => handlePriceRangeChange(Number(e.target.value), max)}
              className="border rounded px-2 py-1"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={max === Infinity ? '' : max}
              onChange={(e) => handlePriceRangeChange(min, Number(e.target.value) || Infinity)}
              className="border rounded px-2 py-1"
            />
          </div>
        </div>

        {/* In Stock filter */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 sm:block`}>
          <p className='flex gap-2'>
            <input
              className='w-3'
              type="checkbox"
              checked={inStock}
              onChange={handleInStockChange}
            /> In Stock Only
          </p>
        </div>

        <button
          onClick={applyFilters}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
        >
          Apply Filters
        </button>
      </div>

      {/* Right side */}
      <div className='flex-1'>
        <div className='flex justify-between text-base sm:text-2xl mb-4'>
          <Title text1={'ALL'} text2={'COLLECTIONS'} />
          {/* Product sort */}
          <select
            className='border-2 border-gray-300 text-sm px-2'
            value={sort}
            onChange={handleSortChange}
          >
            <option value="">Sort by</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="name-a-z">Name: A to Z</option>
            <option value="name-z-a">Name: Z to A</option>
          </select>
        </div>

        {productList.length === 0 && (
          <p className="text-center text-gray-500">No products found for "{search}"</p>
        )}

        {/* Map products */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {Array.isArray(productList) && productList.map((item) => (
            <ProductItem
              key={item._id}
              id={item._id}
              name={item.productName}
              price={item.price}
              image={item.images[0]}
              currency={currency}
              discountedPrice={item?.discountedPrice || 0}
              wishlist={isInWishlist(item._id)}
            />
          ))}
        </div>
        <div className="pagination flex justify-center items-center mt-4 space-x-2">
          <button
            onClick={() => handlePageChange(Number(currentPage) - 1)}
            disabled={currentPage === 1}
            className={`py-2 px-4 bg-gray-200 rounded-lg ${currentPage === 1 ? 'cursor-not-allowed text-gray-400' : 'hover:bg-gray-300'} transition duration-300`}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`py-2 px-4 rounded-lg ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition duration-300`}
            >
              {index + 1}
            </button>
          ))}


          <button
            onClick={() => handlePageChange(Number(currentPage) + 1)}
            disabled={currentPage === totalPages}
            className={`py-2 px-4 bg-gray-200 rounded-lg ${currentPage === totalPages ? 'cursor-not-allowed text-gray-400' : 'hover:bg-gray-300'} transition duration-300`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Collection;
