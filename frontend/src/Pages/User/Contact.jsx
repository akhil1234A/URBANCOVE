import React from 'react'
import Title from '../../components/User/Title'
import { assets } from '../../assets/assets'
import Newsletter from '../../components/User/Newsletter'

const Contact = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-10 border-t'>
         <Title text1={'CONTACT'} text2={'US'}/>
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-20'>
       <img className='w-full md:max-w-[480px]' src={assets.contact_img} alt="" />
       <div className='flex flex-col justify-center items-start gap-6'>
         <p className='font-semibold text-xl texxt-gray-600'>Our Store</p>
         <p className='text-gray-500'>54670 RK's villa <br/> suite 450 , London </p>
         <p className='text-gray-500'>Tel: (+91) 9876543210 <br/> Email: urban.cove@gmail.com</p>
         <p className='font-semibold text-xl text-gray-600'>Careers at Urbancove</p>
         <p className='text-gray-500'>Learn more about our teams and jon openings.</p>
         <button className='border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500'>Explore Jobs</button>
       </div>
      </div>
      <Newsletter/>
    </div>
  )
}

export default Contact