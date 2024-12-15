import Hero from '../../components/User/Hero'
import LatestCollection from '../../components/User/LatestCollection'
import BestSeller from '../../components/User/BestSeller'
import OurPolicy from '../../components/User/OurPolicy'
import Newsletter from '../../components/User/Newsletter'



const Home = ({latest, best}) => {

  return (
    <div>
      <Hero/>
      <LatestCollection products={latest}/>
      <BestSeller products={best}/>
      <OurPolicy/>
      <Newsletter/>
    </div>
  )
}

export default Home