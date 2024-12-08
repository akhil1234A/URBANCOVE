import React, { useState, useEffect } from 'react';
import { adminAxios } from '../../utils/api';
import { Users, ShoppingBag, Package, Layers } from 'lucide-react';


function CounterCards() {
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCounters() {
      try {
        const res = await adminAxios.get(`/admin/sales-report/counters`);
        const data = res.data;
        setCounters([
          { title: 'Active Users', value: data.activeUsers, icon: Users, color: 'bg-blue-500' },
          { title: 'Total Orders', value: data.totalOrders, icon: ShoppingBag, color: 'bg-green-500' },
          { title: 'Active Products', value: data.activeProducts, icon: Package, color: 'bg-yellow-500' },
          { title: 'Active Categories', value: data.activeCategories, icon: Layers, color: 'bg-purple-500' },
        ]);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchCounters();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {counters.map((counter) => (
        <div
          key={counter.title}
          className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-500 hover:scale-105"
        >
          <div className={`${counter.color} p-4`}>
            <counter.icon className="h-8 w-8 text-white" />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{counter.title}</h3>
            <div className="text-3xl font-bold text-gray-900">{counter.value.toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CounterCards;