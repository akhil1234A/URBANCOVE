import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import Title from '../components/User/Title';
import ProductItem from './ProductItem';

const Test = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error("Authorization token not found. Please log in again.");
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/admin/products/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        const data = await response.json();
        console.log('data',data)

        if (response.ok) {
          setProducts(data);
        } else {
          console.error('Failed to fetch products:', data.message);
        }
      } catch (error) {
        console.error('An error occurred:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      {/* Filter options */}
      <div className='min-w-60'>
        {/* Filter sections as before */}
      </div>

      {/* Right side */}
      <div className='flex-1'>
        <div className='flex justify-between text-base sm:text-2xl mb-4'>
          <Title text1={'ALL'} text2={'COLLECTIONS'} />
          {/* Product sort */}
          <select className='border-2 border-gray-300 text-sm px-2'>
            <option value="relevant">Sort by : Relevant</option>
            <option value="low-high">Sort by : Low to High</option>
            <option value="high-low">Sort by : High to Low</option>
          </select>
        </div>

        {/* Map products */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {products.map((item) => (
            <ProductItem
              key={item._id}
              name={item.productName}
              id={item._id}
              price={item.price}
              image={item.images[0]}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Test;
