import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const ViewProducts = () => {
  const [list, setList] = useState([]);

  // Dummy product data with status field
  const dummyData = [
    {
      "id": 1,
      "title": "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
      "price": 109.95,
      "description": "Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday",
      "category": "men's clothing",
      "subCategory": "backpack",
      "status": "listed",
      "image": "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
      "rating": {
        "rate": 3.9,
        "count": 120
      }
    },
    {
      "id": 2,
      "title": "Mens Casual Premium Slim Fit T-Shirts",
      "price": 22.3,
      "description": "Slim-fitting style, contrast raglan long sleeve...",
      "category": "men's clothing",
      "subCategory": "t-shirt",
      "status": "listed",
      "image": "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
      "rating": {
        "rate": 4.1,
        "count": 259
      }
    },
    {
      "id": 3,
      "title": "Mens Cotton Jacket",
      "price": 55.99,
      "description": "Great outerwear jackets for Spring/Autumn/Winter...",
      "category": "men's clothing",
      "subCategory": "jacket",
      "status": "unlisted",
      "image": "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",
      "rating": {
        "rate": 4.7,
        "count": 500
      }
    },
    {
      "id": 4,
      "title": "Mens Casual Slim Fit",
      "price": 15.99,
      "description": "The color could be slightly different between...",
      "category": "men's clothing",
      "subCategory": "t-shirt",
      "status": "listed",
      "image": "https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg",
      "rating": {
        "rate": 2.1,
        "count": 430
      }
    },
    {
      "id": 5,
      "title": "John Hardy Women's Legends Naga Gold & Silver Dragon Station Chain Bracelet",
      "price": 695,
      "description": "From our Legends Collection, the Naga was inspired by...",
      "category": "jewelery",
      "subCategory": "bracelet",
      "status": "unlisted",
      "image": "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg",
      "rating": {
        "rate": 4.6,
        "count": 400
      }
    },
    {
      "id": 6,
      "title": "Solid Gold Petite Micropave",
      "price": 168,
      "description": "Satisfaction Guaranteed. Return or exchange any order...",
      "category": "jewelery",
      "subCategory": "ring",
      "status": "listed",
      "image": "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg",
      "rating": {
        "rate": 3.9,
        "count": 70
      }
    },
    {
      "id": 7,
      "title": "White Gold Plated Princess",
      "price": 9.99,
      "description": "Classic Created Wedding Engagement Solitaire Diamond...",
      "category": "jewelery",
      "subCategory": "ring",
      "status": "listed",
      "image": "https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_QL65_ML3_.jpg",
      "rating": {
        "rate": 3,
        "count": 400
      }
    },
    
  ]
  

  useEffect(() => {
    setList(dummyData);
  }, []);

  const toggleProductStatus = (id) => {
    setList((prevList) =>
      prevList.map((item) =>
        item.id === id ? { ...item, status: item.status === "listed" ? "unlisted" : "listed" } : item
      )
    );
    toast.success('Product status updated successfully');
  };

  return (
    <>
      <p className='mb-2'>All Products List</p>
      <div className='flex flex-col gap-2'>
        <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className='text-center'>Action</b>
        </div>

        {list.map((item) => (
          <div
            className={`grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm ${
              item.status === "unlisted" ? "opacity-50" : ""
            }`}
            key={item.id}
          >
            <img className='w-12' src={item.image} alt={item.title} />
            <p>{item.title}</p>
            <p>{item.category}</p>
            <p>${item.price}</p>
            <button
              onClick={() => toggleProductStatus(item.id)}
              className={`text-sm py-1 px-3 rounded-md 
               ${item.status === "listed" ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'} 
               transition duration-200 ease-in-out`}
              >
                {item.status === "listed" ? "Unlist" : "List"}
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default ViewProducts;
