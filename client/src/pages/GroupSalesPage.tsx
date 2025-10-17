import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar, TrendingUp, Package } from 'lucide-react';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL;

type DateRange = '7days' | '14days' | '1month' | '3months' | '6months';

type ProductSale = {
  product_id: number;
  product_name: string;
  brand?: string;
  total_quantity: number;
  total_sales: number;
  sale_count: number;
};

export default function ProductSalesHistory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productType = searchParams.get('type') || 'Unknown';
  
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('7days');
  const [salesData, setSalesData] = useState<ProductSale[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [useCustomDate, setUseCustomDate] = useState(false);

  // Calculate date range based on selection
  const calculateDateRange = (range: DateRange) => {
    const end = new Date();
    const start = new Date();

    switch (range) {
      case '7days':
        start.setDate(end.getDate() - 7);
        break;
      case '14days':
        start.setDate(end.getDate() - 14);
        break;
      case '1month':
        start.setMonth(end.getMonth() - 1);
        break;
      case '3months':
        start.setMonth(end.getMonth() - 3);
        break;
      case '6months':
        start.setMonth(end.getMonth() - 6);
        break;
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  };

  // Load sales data
  const loadSalesData = async () => {
    setLoading(true);
    try {
      let start, end;
      
      if (useCustomDate && customStartDate) {
        start = customStartDate;
        end = new Date().toISOString().split('T')[0];
      } else {
        const dates = calculateDateRange(dateRange);
        start = dates.start;
        end = dates.end;
      }
      
      setStartDate(start);
      setEndDate(end);

      // Adjust this API endpoint according to your backend
      const response = await fetch(
        `${API_URL}/sales/history?type=${productType}&start=${start}&end=${end}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch sales data');
      }

      const result = await response.json();
      
      if (result.status && result.data) {
        setSalesData(result.data);
      } else {
        setSalesData([]);
      }
    } catch (error) {
      console.error('Error loading sales data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load sales data',
        timer: 2000,
        showConfirmButton: false
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomDateChange = (date: string) => {
    if (date) {
      setCustomStartDate(date);
      setUseCustomDate(true);
    }
  };

  const handlePresetDateRange = (range: DateRange) => {
    setDateRange(range);
    setUseCustomDate(false);
    setCustomStartDate('');
  };

  const clearCustomDate = () => {
    setUseCustomDate(false);
    setCustomStartDate('');
    setDateRange('7days');
  };

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_URL}/api/me`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.status === 401 || response.status === 403) {
        navigate('/login');
        return;
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (useCustomDate && customStartDate) {
      loadSalesData();
    } else if (!useCustomDate) {
      loadSalesData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, customStartDate, useCustomDate]);

  // Calculate totals
  const getTotals = () => {
    return {
      totalQuantity: salesData.reduce((sum, item) => sum + item.total_quantity, 0),
      totalSales: salesData.reduce((sum, item) => sum + item.total_sales, 0),
      totalProducts: salesData.length
    };
  };

  const totals = getTotals();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const dateRangeOptions = [
    { value: '7days', label: '7 Days' },
    { value: '14days', label: '14 Days' },
    { value: '1month', label: '1 Month' },
    { value: '3months', label: '3 Months' },
    { value: '6months', label: '6 Months' }
  ];

  return (
    <div className="min-h-screen p-6"
         style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#f9fafb'}}>
      
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </button>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-1 h-8 bg-blue-600 mr-3"></div>
            <div>
              <h1 className="text-2xl font-bold"
                  style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                Sales History - {productType}
              </h1>
              <p className="text-sm mt-1"
                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                {startDate && endDate && `${formatDate(startDate)} - ${formatDate(endDate)}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="mb-6 rounded-lg border p-6"
           style={{
             backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
             borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
           }}>
        <div className="flex items-center mb-4">
          <Calendar className="h-5 w-5 mr-2"
                    style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}} />
          <h2 className="text-lg font-semibold"
              style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
            Select Time Period
          </h2>
        </div>
        
        {/* Preset Date Ranges */}
        <div className="flex flex-wrap gap-3 mb-4">
          {dateRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handlePresetDateRange(option.value as DateRange)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                !useCustomDate && dateRange === option.value
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'hover:bg-gray-200'
              }`}
              style={useCustomDate || dateRange !== option.value ? {
                backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f3f4f6',
                color: document.documentElement.classList.contains('dark') ? 'white' : '#374151'
              } : {}}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Custom Date Picker */}
        <div className="border-t pt-4"
             style={{
               borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
             }}>
          <label className="block text-sm font-medium mb-2"
                 style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
            Or select custom start date (end date will be today):
          </label>
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={customStartDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => handleCustomDateChange(e.target.value)}
              className="px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{
                backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
                color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'
              }}
            />
            {useCustomDate && customStartDate && (
              <div className="flex items-center gap-2">
                <span style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                  to
                </span>
                <input
                  type="date"
                  value={new Date().toISOString().split('T')[0]}
                  disabled
                  className="px-4 py-3 rounded-lg border bg-gray-100"
                  style={{
                    backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#f3f4f6',
                    borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
                    color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
                  }}
                />
                <button
                  onClick={clearCustomDate}
                  className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="rounded-lg border p-6"
             style={{
               backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
               borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
             }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium mb-1"
                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                Total Products
              </p>
              <p className="text-3xl font-bold"
                 style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                {totals.totalProducts}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6"
             style={{
               backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
               borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
             }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium mb-1"
                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                Total Units Sold
              </p>
              <p className="text-3xl font-bold"
                 style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                {totals.totalQuantity.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6"
             style={{
               backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
               borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
             }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium mb-1"
                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                Total Sales
              </p>
              <p className="text-3xl font-bold"
                 style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                {formatCurrency(totals.totalSales)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl font-bold text-green-600">฿</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="rounded-lg shadow-sm overflow-hidden"
           style={{
             backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
             borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
           }}>
        
        {/* Table Header */}
        <div className="px-6 py-4 border-b"
             style={{
               backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f9fafb',
               borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#e5e7eb'
             }}>
          <h2 className="text-lg font-semibold"
              style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
            Product Sales Details
          </h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b"
                  style={{
                    backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f9fafb',
                    borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#e5e7eb'
                  }}>
                <th className="px-6 py-4 text-left text-sm font-semibold"
                    style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                  Product Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold"
                    style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                  Brand
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold"
                    style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                  Units Sold
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold"
                    style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                  Total Sales
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold"
                    style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                  Number of Sales
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold"
                    style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                  Avg Sale Price
                </th>
              </tr>
            </thead>
            <tbody className="divide-y"
                   style={{
                     borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
                   }}>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                      <span style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                        Loading sales data...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : salesData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center"
                      style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                    No sales data available for the selected period
                  </td>
                </tr>
              ) : (
                salesData.map((item) => (
                  <tr key={item.product_id}
                      className="hover:bg-gray-50 transition-colors"
                      style={{
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#4b5563' : '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#374151' : 'white';
                      }}>
                    <td className="px-6 py-4">
                      <div className="font-medium"
                           style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                        {item.product_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm"
                            style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                        {item.brand || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold"
                            style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                        {item.total_quantity.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-green-600">
                        {formatCurrency(item.total_sales)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                        {item.sale_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                        {formatCurrency(item.total_sales / item.total_quantity)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
