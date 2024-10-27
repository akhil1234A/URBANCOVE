import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { products } from '../../assets/assets';
import RelatedProducts from '../../components/User/RelatedProducts';

const Product = () => {
  const { productID } = useParams();
  const currency = '$';
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');
  const [zoomPosition, setZoomPosition] = useState({});
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const fetchProductData = () => {
      const product = products.find((item) => item._id === productID);
      if (product) {
        setProductData(product);
        setImage(product.image[0]);
      }
    };
    fetchProductData();
  }, [productID]);

  const handleMouseMove = (e) => {
    const { top, left, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setZoomPosition({
      backgroundImage: `url(${image})`,
      backgroundPosition: `${x}% ${y}%`,
    });
  };

  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      <nav className="text-gray-600 text-sm mb-6">
        <Link to="/" className="hover:text-gray-800">Home</Link>
        <span> / </span>
        <Link to={`/category/${productData.category}`} className="hover:text-gray-800">{productData.category}</Link>
        {productData.subCategory && (
          <>
            <span> / </span>
            <Link to={`/category/${productData.category}/${productData.subCategory}`} className="hover:text-gray-800">
              {productData.subCategory}
            </Link>
          </>
        )}
        <span> / </span>
        <span className="text-gray-800">{productData.name}</span>
      </nav>

      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
        
        {/* Product Images */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
            {productData.image.map((item, index) => (
              <img onClick={() => setImage(item)} src={item} key={index} className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer' />
            ))}
          </div>
          <div className='w-full sm:w-[80%] relative flex'>
            <div
              className="w-full h-auto cursor-crosshair relative"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <img className='w-full h-auto' src={image} alt={productData.name} />
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
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
          <div className='flex item-center gap-1 mt-2'>
            <img className='w-5 h-5' src={assets.star_icon} alt="star"/>
            <img className='w-5 h-5' src={assets.star_icon} alt="star" />
            <img className='w-5 h-5' src={assets.star_icon} alt="star" />
            <img className='w-5 h-5' src={assets.star_icon} alt="star" />
            <img className='w-5 h-5' src={assets.star_dull_icon} alt="star" />
            <p className='pl-2'>(122)</p>
          </div>
          <p className='mt-5 text-3xl font-medium'>{currency}{productData.price}</p>
          <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>
          <div className='flex flex-col gap-4 my-8'>
            <p>Select Size</p>
            <div className='flex gap-2'>
              {productData.sizes.map((item, index) => (
                <button onClick={() => setSize(item)} className={`border py-2 px-4 bg-gray-100 ${item === size ? 'border-orange-500' : ''}`} key={index}>{item}</button>
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

      {/* Related Products */}
      <RelatedProducts category={productData.category} subCategory={productData.subCategory} products={products}/>
    </div>
  ) : <div>Product not found</div>;
};

export default Product;
