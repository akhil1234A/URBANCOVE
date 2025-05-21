import React, { useState } from 'react';
import { adminAxios } from '../../utils/api';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx'; 
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ChartBarIcon, DocumentDownloadIcon, ExclamationCircleIcon } from '@heroicons/react/outline';
import { formatDate } from '../../utils/dateFormatter';
import { toast } from 'react-toastify';

const SalesReport = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [period, setPeriod] = useState('daily');
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalProductsSold: 0,
    totalAmount: 0,
    totalDiscount: 0,
  });
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);

  const fetchSalesReport = async () => {
    setLoading(true);
    setError(null);

    if (period === 'custom' && (!startDate || !endDate)) {
      setLoading(false);
      toast.error('Please select both start and end dates for the custom period.');
      return;
    }
  
    if (period === 'custom' && startDate > endDate) {
      setLoading(false);
      toast.error('Start date cannot be later than the end date.');
      return;
    }
    try {
      const payload = {
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        period,
      };
      const response = await adminAxios.post(
        `/admin/sales-report/generate-sales-report`,
        payload);
      const { salesSummary, allOrders } = response.data;

      setSummary({
        totalOrders: allOrders.length,
        totalProductsSold: salesSummary.totalProductsSold,
        totalAmount: parseFloat(salesSummary.totalAmount).toFixed(2),
        totalDiscount: parseFloat(salesSummary.totalDiscount).toFixed(2),
      });
      setAllOrders(allOrders);
      setDataFetched(true);
    } catch (error) {
      setError('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = () => {
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

    const dataForExcel = [
      ...summaryData,
      ...allOrders.map((order) => ({
        OrderID: order.orderReference,
        Product: order.items.map((item) => item?.productId?.productName || "New Product-1").join(', '),
        Quantity: order.items.reduce((acc, item) => acc + item.quantity, 0),
        Amount: `₹${order.totalAmount}`,
        Discount: `₹${order.discountAmount}`,
        Date: formatDate(order.placedAt),
      })),
    ];

    const ws = XLSX.utils.json_to_sheet(dataForExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');
    XLSX.writeFile(wb, 'sales_report.xlsx');
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'normal');
    doc.text('Sales Report', 14, 15);

    const summaryContent = [
      ['Total Orders', summary.totalOrders],
      ['Total Products Sold', summary.totalProductsSold],
      ['Total Revenue', `Rs.${summary.totalAmount}`],
      ['Total Discounts', `Rs.${summary.totalDiscount}`],
    ];

    doc.autoTable({
      head: [['Description', 'Value']],
      body: summaryContent,
      startY: 25,
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    const reportContent = allOrders.map((order) => [
      order.orderReference,
      order.items.map((item) => item?.productId?.productName || "New Product-1").join(', '),
      order.items.reduce((acc, item) => acc + item.quantity, 0),
      `Rs.${order.totalAmount}`,
      `Rs.${order.discountAmount}`,
      formatDate(order.placedAt),
    ]);

    doc.autoTable({
      head: [['Order ID', 'Product', 'Quantity', 'Amount', 'Discount', 'Date']],
      body: reportContent,
      startY: doc.lastAutoTable.finalY + 10,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    doc.save('sales_report.pdf');
  };

  const renderSummary = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-blue-100 p-4 rounded-lg shadow-md">
        <h4 className="text-blue-600 font-bold text-lg mb-2">Total Orders</h4>
        <p className="text-2xl font-semibold">{summary.totalOrders}</p>
      </div>
      <div className="bg-green-100 p-4 rounded-lg shadow-md">
        <h4 className="text-green-600 font-bold text-lg mb-2">Total Products Sold</h4>
        <p className="text-2xl font-semibold">{summary.totalProductsSold}</p>
      </div>
      <div className="bg-yellow-100 p-4 rounded-lg shadow-md">
        <h4 className="text-yellow-600 font-bold text-lg mb-2">Total Revenue</h4>
        <p className="text-2xl font-semibold">₹{summary.totalAmount}</p>
      </div>
      <div className="bg-red-100 p-4 rounded-lg shadow-md">
        <h4 className="text-red-600 font-bold text-lg mb-2">Total Discounts</h4>
        <p className="text-2xl font-semibold">₹{summary.totalDiscount}</p>
      </div>
    </div>
  );

  const renderReportTable = () => {
    if (!dataFetched) {
      return (
        <div className="text-center py-12">
          <ExclamationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by generating a report.</p>
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={fetchSalesReport}
            >
              <ChartBarIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Generate Report
            </button>
          </div>
        </div>
      );
    }

    if (allOrders.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ExclamationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">There are no orders for the selected period.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto shadow-md rounded-lg mt-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allOrders.map((order, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderReference}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.items.map((item, idx) => (
                    <p key={idx}>{item?.productId?.productName || "New Product-1"}</p>
                  ))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.items.reduce((acc, item) => acc + item.quantity, 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{order.totalAmount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{order.discountAmount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(order.placedAt)}
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

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-wrap items-end gap-4 mb-4">
          <div>
            <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">Report Period</label>
            <select
              id="period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {period === 'custom' && (
            <>
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <DatePicker
                  id="start-date"
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  maxDate={new Date()}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  placeholderText="Select start date"
                  dateFormat="yyyy/MM/dd"
                />
              </div>
              <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <DatePicker
                  id="end-date"
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  maxDate={new Date()}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  placeholderText="Select end date"
                  dateFormat="yyyy/MM/dd"
                />
              </div>
            </>
          )}

          <button
            onClick={fetchSalesReport}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Generate Report
          </button>
        </div>

        {dataFetched && (
          <div className="flex flex-wrap gap-4 mt-4">
            <button
              onClick={handleDownloadExcel}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <DocumentDownloadIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Download Excel
            </button>
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <DocumentDownloadIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Download PDF
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {dataFetched && renderSummary()}
      {renderReportTable()}
    </div>
  );
};

export default SalesReport;

