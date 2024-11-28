import  { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProductsForUser, selectProducts, selectLoading, setCurrentPage, setSort, setFilters, setSearch } from '../../slices/admin/productSlice';
import { assets } from '../../assets/assets';
import Title from '../../components/User/Title';
import ProductItem from '../../components/User/ProductItem';

const Collection = () => {
  const dispatch = useDispatch();
  const currency = '₹';


  const productList = useSelector(selectProducts);
  const loading = useSelector(selectLoading);

  const currentPage = useSelector((state) => state.products.currentPage); 
  const totalPages = useSelector((state) => state.products.totalPages); 
  const itemsPerPage = 12; 
  const search = useSelector((state) => state.products.search);
  const sort = useSelector((state) => state.products.sort);
  const filters = useSelector((state) => state.products.filters);
  

  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    dispatch(fetchProductsForUser({ page: currentPage, limit: itemsPerPage, search }));
  }, [dispatch, currentPage, search]);
  
  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      dispatch(setCurrentPage(page));  
    }
  };

  const handleSortChange = (e) => {
    dispatch(setSort(e.target.value));
  };

  const handleCategoryFilterChange = (category) => {
    const updatedCategories = localFilters.categories.includes(category)
      ? localFilters.categories.filter(c => c !== category)
      : [...localFilters.categories, category];
    
    setLocalFilters(prev => ({
      ...prev,
      categories: updatedCategories
    }));
  };

  const handleSubCategoryFilterChange = (subCategory) => {
    const updatedSubCategories = localFilters.subCategories.includes(subCategory)
      ? localFilters.subCategories.filter(sc => sc !== subCategory)
      : [...localFilters.subCategories, subCategory];
    
    setLocalFilters(prev => ({
      ...prev,
      subCategories: updatedSubCategories
    }));
  };

  const handleInStockChange = () => {
    setLocalFilters(prev => ({
      ...prev,
      inStock: !prev.inStock
    }));
  };

  const handlePriceRangeChange = (min, max) => {
    setLocalFilters(prev => ({
      ...prev,
      priceRange: { min, max }
    }));
  };

  const applyFilters = () => {
    dispatch(setFilters(localFilters));
  };

  if (loading) {
    return <div>Loading products...</div>;
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
            {['Men', 'Women', 'Kids'].map(category => (
              <p key={category} className='flex gap-2'>
                <input
                  className='w-3'
                  type="checkbox"
                  value={category}
                  checked={localFilters.categories.includes(category)}
                  onChange={() => handleCategoryFilterChange(category)}
                /> {category}
              </p>
            ))}
          </div>
        </div>

        {/* Subcategory filter */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 sm:block`}>
          <p className='mb-3 text-sm font-medium'>TYPE</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            {['Topwear', 'Bottomwear', 'Winterwear'].map(subCategory => (
              <p key={subCategory} className='flex gap-2'>
                <input
                  className='w-3'
                  type="checkbox"
                  value={subCategory}
                  checked={localFilters.subCategories.includes(subCategory)}
                  onChange={() => handleSubCategoryFilterChange(subCategory)}
                /> {subCategory}
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
              value={localFilters.priceRange.min}
              onChange={(e) => handlePriceRangeChange(Number(e.target.value), localFilters.priceRange.max)}
              className="border rounded px-2 py-1"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={localFilters.priceRange.max === Infinity ? '' : localFilters.priceRange.max}
              onChange={(e) => handlePriceRangeChange(localFilters.priceRange.min, Number(e.target.value) || Infinity)}
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
              checked={localFilters.inStock}
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
           />
          ))}
        </div>
        <div className="pagination flex justify-center items-center mt-4 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
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
            onClick={() => handlePageChange(currentPage + 1)}
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
