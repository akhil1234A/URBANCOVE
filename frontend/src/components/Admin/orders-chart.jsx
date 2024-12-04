"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getAdminToken } from "../../utils/auth";
import { ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';

async function getOrdersData(period) {
  const token = getAdminToken();
  const res = await fetch(
    `http://localhost:3000/admin/sales-report/orders-chart?period=${period}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) throw new Error("Failed to fetch orders data");
  const { data } = await res.json();
  return data;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-800">{label}</p>
        <p className="text-blue-600">
          Orders: {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export function OrdersChart() {
  const [period, setPeriod] = useState("monthly");
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setError(null);
    setLoading(true);
    getOrdersData(period)
      .then((newData) => {
        setData(newData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load chart data");
        setLoading(false);
      });
  }, [period]);

  const latestValue = data[data.length - 1]?.value || 0;
  const previousValue = data[data.length - 2]?.value || 0;
  const percentageChange = ((latestValue - previousValue) / previousValue) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Orders Over Time</h2>
          <p className="text-gray-600 mt-1">Track your order trends</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 transition-all duration-300 hover:bg-gray-100"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
        </div>
      ) : error ? (
        <div className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>
      ) : (
        <>
          <div className="mb-6 flex items-center">
            <span className="text-3xl font-bold text-gray-800 mr-2">
              {latestValue.toLocaleString()}
            </span>
            <span
              className={`flex items-center ${
                percentageChange >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {percentageChange >= 0 ? (
                <ArrowUpRight className="h-5 w-5 mr-1" />
              ) : (
                <ArrowDownRight className="h-5 w-5 mr-1" />
              )}
              {Math.abs(percentageChange).toFixed(2)}%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="name"
                stroke="#6B7280"
                tick={{ fill: "#6B7280" }}
              />
              <YAxis stroke="#6B7280" tick={{ fill: "#6B7280" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ r: 4, fill: "#3B82F6" }}
                activeDot={{ r: 6, fill: "#2563EB" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}