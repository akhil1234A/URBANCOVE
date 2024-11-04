import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsForUser, selectProductById, selectProducts, selectLoading } from '../../slices/admin/productSlice';
import { assets } from '../../assets/assets';
import RelatedProducts from '../../components/User/RelatedProducts';
// import './zoom.css';

const Product = () => {
  const { productID } = useParams();
  const dispatch = useDispatch();

  const productData = useSelector((state) => selectProductById(state, productID));
  const products = useSelector(selectProducts);
  const loading = useSelector(selectLoading);

  const [image, setImage] = useState('');
  const [activeSection, setActiveSection] = useState('description');
  const [size, setSize] = useState('');

  // Dummy reviews array
  const dummyReviews = [
    {
      username: 'JohnDoe',
      rating: 5,
      comment: 'Excellent product, highly recommend!',
    },
    {
      username: 'JaneSmith',
      rating: 4,
      comment: 'Good quality but slightly overpriced.',
    },
    {
      username: 'MikeJohnson',
      rating: 3,
      comment: 'Average product, you get what you pay for.',
    },
  ];

  useEffect(() => {
    if (!productData) {
      dispatch(fetchProductsForUser());
    } else if (productData.images) {
      setImage(productData.images[0]);
    }
  }, [dispatch, productData]);


  const renderStars = (rating) => (
    <div className="flex">
      {[...Array(5)].map((_, index) => (
        <img
          key={index}
          src={index < rating ? assets.star_icon : assets.star_dull_icon}
          alt="star"
          className="w-5 h-5"
        />
      ))}
    </div>
  );

  // Function to render reviews
  const renderReviews = () => (
    <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
      {dummyReviews.length > 0 ? (
        dummyReviews.map((review, index) => (
          <div key={index} className="border-b pb-4">
            <div className="flex justify-between">
              <p className="font-semibold">{review.username}</p>
              <div>{renderStars(review.rating)}</div>
            </div>
            <p className="mt-2">{review.comment}</p>
          </div>
        ))
      ) : (
        <p>No reviews yet.</p>
      )}
    </div>
  );

  return loading ? (
    <div>Loading product details...</div>
  ) : productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      <nav className="text-gray-600 text-sm mb-6">
        <Link to="/" className="hover:text-gray-800">Home</Link>
        <span> / </span>
        <Link to={`/collection`} className="hover:text-gray-800">{productData.category?.category}</Link>
        <span> / </span>
        <span className="text-gray-800">{productData.productName}</span>
      </nav>

      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/* Product Images */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {productData.images && productData.images.map((img, index) => (
              <img
                key={index}
                onClick={() => setImage(img)}
                src={`http://localhost:3000/${img}`}
                onError={(e) => (e.target.src = 'path/to/fallback-image.jpg')}
                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
                alt={productData.productName}
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%] relative flex">
            <img className="w-full h-auto" src={`http://localhost:3000/${image}`} alt={productData.productName} />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.productName}</h1>
          <div className="flex item-center gap-1 mt-2">
            {renderStars(4)}
            <p className="pl-2">(122)</p>
          </div>
          <p className="mt-5 text-3xl font-medium">${productData.price}</p>
          <p className="mt-5 text-gray-500 md:w-4/5">{productData.productDescription}</p>
          <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2">
              {productData.size && productData.size.map((s, index) => (
                <button
                  onClick={() => setSize(s)}
                  className={`border py-2 px-4 bg-gray-100 ${s === size ? 'border-orange-500' : ''}`}
                  key={index}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700">ADD TO CART</button>
          <hr className="mt-8 sm:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* Description & Review Section */}
      <div className="mt-20">
        <div className="flex">
          <b
            className="border px-5 py-3 text-sm cursor-pointer"
            onClick={() => setActiveSection('description')}
          >
            Description
          </b>
          <p
            className="border px-5 py-3 text-sm cursor-pointer"
            onClick={() => setActiveSection('reviews')}
          >
            Reviews ({dummyReviews.length})
          </p>
        </div>
        {activeSection === 'description' ? (
          <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
            <p>An e-commerce website is an online platform where businesses sell goods...</p>
          </div>
        ) : (
          renderReviews() // Render the dummy reviews here
        )}
      </div>

      {/* Related Products */}
      <RelatedProducts 
        category={productData.category?._id} 
        subCategory={productData.subCategory?._id} 
        products={products} 
        currentProductId={productID}
      />
    </div>
 

  ) : (
    <div>Product not found</div>
  );
};

export default Product;
