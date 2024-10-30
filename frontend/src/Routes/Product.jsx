import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { assets } from '../assets/assets';

const Product = () => {
  const formatPath = (path) => Array.isArray(path) ? path.map(p => p.replace(/\\/g, '/')) : path.replace(/\\/g, '/');
  const { id: productID } = useParams();
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');
  const [zoomPosition, setZoomPosition] = useState({});
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.error("Authorization token not found.");
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/admin/products/${productID}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        if (response.ok) {
          const [data] = await response.json();
          
          // Correct size format
          const parsedSizes = data.size[0].replace(/\"/g, "").split(","); 
          
          // Format image paths for display
          const formattedImages = data.images ? data.images.map(formatPath) : [];

          // Set state with formatted data
          setProductData({ ...data, size: parsedSizes, images: formattedImages });
          setImage(formattedImages[0] || ''); // Default to the first image
          
        } else {
          console.error('Failed to fetch product:', response.statusText);
        }
      } catch (error) {
        console.error('An error occurred:', error);
      }
    };

    fetchProductData();
  }, [productID]);

  const handleMouseMove = (e) => {
    const { top, left, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setZoomPosition({
      backgroundImage: `url(http://localhost:3000/${image})`,
      backgroundPosition: `${x}% ${y}%`,
    });
  };

  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {/* Breadcrumbs */}
      <nav className="text-gray-600 text-sm mb-6">
        <Link to="/" className="hover:text-gray-800">Home</Link>
        <span> / </span>
        <Link to={`/collection`} className="hover:text-gray-800">{productData.category?.category}</Link>
        <span> / </span>
        <span className="text-gray-800">{productData.productName}</span>
      </nav>

      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
        
        {/* Product Images */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
            {productData.images && productData.images.map((img, index) => (
              <img onClick={() => setImage(img)} src={`http://localhost:3000/${img}`} key={index} className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer' alt={productData.productName} />
            ))}
          </div>
          <div className='w-full sm:w-[80%] relative flex'>
            <div
              className="w-full h-auto cursor-crosshair relative"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <img className='w-full h-auto' src={`http://localhost:3000/${image}`} alt={productData.productName} />
            </div>

            {/* Zoomed Image Display */}
            {isZoomed && (
              <div
                className="zoom-box hidden sm:block absolute w-[200px] h-[200px] ml-4 mt-12 bg-no-repeat bg-cover border border-gray-200 shadow-lg"
                style={{
                  ...zoomPosition,
                  backgroundSize: '200%',  // Adjust zoom level
                }}
              ></div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.productName}</h1>
          <div className='flex item-center gap-1 mt-2'>
            <img className='w-5 h-5' src={assets.star_icon} alt="star"/>
            <img className='w-5 h-5' src={assets.star_icon} alt="star" />
            <img className='w-5 h-5' src={assets.star_icon} alt="star" />
            <img className='w-5 h-5' src={assets.star_icon} alt="star" />
            <img className='w-5 h-5' src={assets.star_dull_icon} alt="star" />
            <p className='pl-2'>(122)</p>
          </div>
          <p className='mt-5 text-3xl font-medium'>${productData.price}</p>
          <p className='mt-5 text-gray-500 md:w-4/5'>{productData.productDescription}</p>
          <div className='flex flex-col gap-4 my-8'>
            <p>Select Size</p>
            <div className='flex gap-2'>
              {productData.size && productData.size.map((s, index) => (
                <button onClick={() => setSize(s)} className={`border py-2 px-4 bg-gray-100 ${s === size ? 'border-orange-500' : ''}`} key={index}>{s}</button>
              ))}
            </div>
          </div>
          <button className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'>ADD TO CART</button>
          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
            <p>100% Original product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* Description & Review Section */}
      <div className='mt-20'>
        <div className='flex'>
          <b className='border px-5 py-3 text-sm'>Description</b>
          <p className='border px-5 py-3 text-sm'>Reviews (122)</p>
        </div>
        <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
          <p>An e-commerce website is an online platform where businesses sell goods and services directly to consumers...</p>
          <p>With the growth of online shopping, e-commerce websites have become essential for retailers...</p>
        </div>
      </div>
    </div>
  ) : <div>Product not found</div>;
};

export default Product;
