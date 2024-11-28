import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { viewAllOrders } from '../../slices/admin/orderSlice';

import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'
import * as XLSX from 'xlsx';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const SalesReport = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [period, setPeriod] = useState('daily');
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState({
    totalOrders: 0, 
    totalProductsSold: 0,
    totalAmount: 0,
    totalDiscount: 0,
  });
  const { orders, successMessage, errorMessage } = useSelector((state) => state.orders);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    dispatch(viewAllOrders()); 
  }, [dispatch]);

  useEffect(() => {
    fetchSalesReport();
  }, [startDate, endDate, period]);

  
  const filteredOrders = orders.filter((order) => order.status === 'Delivered');

  const fetchSalesReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        'http://localhost:3000/admin/sales-report/generate-sales-report',
        { startDate, endDate, period },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );
  
      const { salesReport, totalProductsSold, totalAmount, totalDiscount } = response.data;

      

      setReportData(salesReport);
      setSummary({
        totalOrders: filteredOrders.length, // Set the total number of orders
        totalProductsSold,
        totalAmount: parseFloat(totalAmount).toFixed(2),
        totalDiscount: parseFloat(totalDiscount).toFixed(2),
      });
    } catch (error) {
      setError('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = () => {
    // Include the summary data as the first row in Excel
    const summaryData = [
      {
        OrderID: 'Total Orders',
        Product: 'Total Products Sold',
        Quantity: 'Total Revenue',
        Amount: 'Total Discount',
        Discount: '',
        Date: '',
      },
      {
        OrderID: summary.totalOrders,
        Product: summary.totalProductsSold,
        Quantity: `₹${summary.totalAmount}`,
        Amount: `₹${summary.totalDiscount}`,
        Discount: '',
        Date: '',
      },
    ];
  
    // Combine the summary data and filteredOrders into the final data
    const dataForExcel = [...summaryData, ...filteredOrders.map((order) => ({
      OrderID: order._id,
      Product: order.items.map((item) => item.productId.productName).join(', '),
      Quantity: order.items.reduce((acc, item) => acc + item.quantity, 0),
      Amount: `₹${order.totalAmount}`,
      Discount: `₹${order.discountAmount}`,
      Date: order.placedAt ? new Date(order.placedAt[0]).toLocaleString() : 'N/A',
    }))];
  
    const ws = XLSX.utils.json_to_sheet(dataForExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');
    XLSX.writeFile(wb, 'sales_report.xlsx');
  };
  
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont('Arial', 'normal');
    doc.text('Sales Report', 14, 10);
  
    // Create summary content
    const summaryContent = [
      ['Total Orders', summary.totalOrders],
      ['Total Products Sold', summary.totalProductsSold],
      ['Total Revenue', `₹${summary.totalAmount}`],
      ['Total Discounts', `₹${summary.totalDiscount}`],
    ];
  
    // Add summary content to PDF
    doc.autoTable({
      head: [['Description', 'Value']],
      body: summaryContent,
      startY: 20,
    });
  
    // Report data for the table (filtered orders)
    const reportContent = filteredOrders.map((order) => [
      order._id,
      order.items.map((item) => item.productId.productName).join(', '),
      order.items.reduce((acc, item) => acc + item.quantity, 0),
      `₹${order.totalAmount}`,
      `₹${order.discountAmount}`,
      order.placedAt ? new Date(order.placedAt[0]).toLocaleString() : 'N/A',
    ]);
  
    // Add the report data to PDF
    doc.autoTable({
      head: [['Order ID', 'Product', 'Quantity', 'Amount', 'Discount', 'Date']],
      body: reportContent,
      startY: doc.lastAutoTable.finalY + 10, // Ensure the report starts after the summary table
    });
  
    doc.save('sales_report.pdf');
  };
  

  const renderSummary = () => (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-blue-100 p-4 rounded-lg shadow-md">
        <h4 className="text-blue-600 font-bold text-lg">Total Orders</h4>
        <p className="text-2xl font-semibold">{summary.totalOrders}</p>
      </div>
      <div className="bg-blue-100 p-4 rounded-lg shadow-md">
        <h4 className="text-blue-600 font-bold text-lg">Total Products Sold</h4>
        <p className="text-2xl font-semibold">{summary.totalProductsSold}</p>
      </div>
      <div className="bg-green-100 p-4 rounded-lg shadow-md">
        <h4 className="text-green-600 font-bold text-lg">Total Revenue</h4>
        <p className="text-2xl font-semibold">₹{summary.totalAmount}</p>
      </div>
      <div className="bg-red-100 p-4 rounded-lg shadow-md">
        <h4 className="text-red-600 font-bold text-lg">Total Discounts</h4>
        <p className="text-2xl font-semibold">₹{summary.totalDiscount}</p>
      </div>
    </div>
  );

  const renderReportTable = () => {
    if (!filteredOrders.length) {
      return (
        <div className="text-center text-gray-500 py-4">
          <p>No sales data is available for the selected period.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto shadow-md rounded-lg mt-6">
        <table className="min-w-full bg-white table-auto">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Quantity</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Discount</th>
              <th className="py-3 px-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, index) => (
              <tr key={index} className="border-t">
                <td className="py-2 px-4">{order._id}</td>
                <td className="py-2 px-4">
                  {order.items.map((item, idx) => (
                    <p key={idx}>{item.productId.productName}</p>
                  ))}
                </td>
                <td className="py-2 px-4">
                  {order.items.reduce((acc, item) => acc + item.quantity, 0)}
                </td>
                <td className="py-2 px-4">₹{order.totalAmount}</td>
                <td className="py-2 px-4">₹{order.discountAmount}</td>
                <td className="py-2 px-4">
                  {order.placedAt && order.placedAt.length > 0
                    ? new Date(order.placedAt[0]).toLocaleString()
                    : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Sales Report Dashboard</h2>

      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom Date Range</option>
          </select>

          {period === 'custom' && (
            <div className="flex space-x-4">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                className="p-2 border rounded"
                placeholderText="Start Date"
                dateFormat="yyyy/MM/dd"
              />
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                className="p-2 border rounded"
                placeholderText="End Date"
                dateFormat="yyyy/MM/dd"
              />
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleDownloadExcel}
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Download Excel
          </button>
          <button
            onClick={handleDownloadPDF}
            className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
          >
            Download PDF
          </button>
        </div>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {renderSummary()}
      {renderReportTable()}
    </div>
  );
};

export default SalesReport;
