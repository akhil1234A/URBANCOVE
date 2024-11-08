import React from 'react'
import Hero from '../../components/User/Hero'
import LatestCollection from '../../components/User/LatestCollection'
import BestSeller from '../../components/User/BestSeller'
import OurPolicy from '../../components/User/OurPolicy'
import Newsletter from '../../components/User/Newsletter'


const Home = ({ products }) => {

  const latestCollection = Array.isArray(products) ? [...products] : []
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  .slice(0, 8); 

  console.log(products);
  
  const bestSellers = Array.isArray(products) ? products.filter(product => product.isBestSeller) : [];
  return (
    <div>
      <Hero/>
      <LatestCollection products={latestCollection}/>
      <BestSeller products={bestSellers}/>
      <OurPolicy/>
      <Newsletter/>
    </div>
  )
}

export default Home