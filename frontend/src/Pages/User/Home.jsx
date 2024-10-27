import React from 'react'
import Hero from '../../components/User/Hero'
import LatestCollection from '../../components/User/LatestCollection'
import BestSeller from '../../components/User/BestSeller'
import OurPolicy from '../../components/User/OurPolicy'
import Newsletter from '../../components/User/Newsletter'


const Home = () => {
  return (
    <div>
      <Hero/>
      <LatestCollection/>
      <BestSeller/>
      <OurPolicy/>
      <Newsletter/>
    </div>
  )
}

export default Home