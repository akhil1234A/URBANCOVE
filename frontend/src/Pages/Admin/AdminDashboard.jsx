import './css/Admin.css';
import { Suspense } from 'react'
import CounterCards  from '../../components/Admin/counter-cards'
import { OrdersChart } from '../../components/Admin/orders-chart'
import { TopSellingProducts } from '../../components/Admin/top-selling-products'
import { TopSellingCategories } from '../../components/Admin/top-selling-categories'

const AdminDashboard = () => {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <Suspense fallback={<div>Loading counters...</div>}>
        <CounterCards />
      </Suspense>
      
      <Suspense fallback={<div>Loading orders chart...</div>}>
        <OrdersChart />
      </Suspense>
      
      <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-5">
            <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>}>
              <TopSellingProducts />
            </Suspense>
          </div>
          <div className="lg:col-span-5">
            <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>}>
              <TopSellingCategories />
            </Suspense>
          </div>
      </div>


    </div>
  )
};

export default AdminDashboard;
