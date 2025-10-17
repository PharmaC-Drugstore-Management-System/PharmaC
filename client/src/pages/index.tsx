import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeProvider';
import {
  ShoppingCart,
  Package,
  AlertCircle,
  DollarSign,
  Users
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return `฿${amount.toLocaleString()}`;
};

// All stats now use real API data
// Static productTypes removed - now using dynamic data from API with ARIMA predictions
// Restock recommendations now fetched from API

export default function PharmaDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Helper function to determine if current theme is dark
  const isDark = theme === 'dark';

  // Generate dynamic dashboard stats with real data from APIs
  const getDashboardStats = () => {
    return [
      {
        title: "Total Sales",
        value: loadingSales ? "Loading..." : formatCurrency(totalSales),
        change: "",
        isPositive: true,
        icon: DollarSign,
        color: "emerald",
        isLoading: loadingSales
      },
      {
        title: "Orders",
        value: loadingOrders ? "Loading..." : totalOrders.toLocaleString(),
        change: "",
        isPositive: true,
        icon: ShoppingCart,
        color: "blue",
        isLoading: loadingOrders
      },
      {
        title: "Products",
        value: loadingProducts ? "Loading..." : totalProducts.toLocaleString(),
        change: "",
        isPositive: true,
        icon: Package,
        color: "purple",
        isLoading: loadingProducts
      },
      {
        title: "Members",
        value: loadingMembers ? "Loading..." : totalMembers.toLocaleString(),
        change: "",
        isPositive: true,
        icon: Users,
        color: "orange",
        isLoading: loadingMembers
      }
    ];
  };

  const [productType, setProductType] = useState([]);
  const [forecastData, setForecastData] = useState<any>(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [totalSales, setTotalSales] = useState(0);
  const [loadingSales, setLoadingSales] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [totalMembers, setTotalMembers] = useState(0);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [restockRecommendations, setRestockRecommendations] = useState<any[]>([]);
  const [loadingRestock, setLoadingRestock] = useState(true);
  
  // Forecast configuration states
  const [forecastDays, setForecastDays] = useState(7);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Default to 30 days ago
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });

  const loadProductType = async () => {
    try {
      const info = await fetch(`${API_URL}/product/product-type`, {
        method: 'GET',
      })
      const data = await info.json()
      const typesOnly = data.data.map((item: any) => item.TYPE)
      console.log("TYPES ONLY:", typesOnly)
      setProductType(typesOnly)
      return typesOnly;
    } catch (error) {
      console.log(error)
      return [];
    }
  }

  console.log("PRODUCT TYPE IN USESTATE", productType)

  // loadPredictor function moved inline to useEffect

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authme = await fetch(`${API_URL}/me`, {
          method: "GET",
          credentials: "include",
        });
        if (authme.status === 401 || authme.status === 403) {
          navigate("/login");
          return;
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  const loadTotalSales = async () => {
    try {
      setLoadingSales(true);
      const info = await fetch(`${API_URL}/dashboard/total-sales`, {
        method: 'GET'
      });

      const data = await info.json();
      console.log('GET TOTAL SALES', data);
      
      if (data.status && data.data) {
        setTotalSales(data.data.totalSales);
      }
    } catch (error) {
      console.error("Load total sales failed", error);
    } finally {
      setLoadingSales(false);
    }
  }

  const loadTotalOrders = async () => {
    try {
      setLoadingOrders(true);
      const info = await fetch(`${API_URL}/dashboard/total-order`, {
        method: 'GET'
      });

      const data = await info.json();
      console.log('GET TOTAL ORDERS', data);
      
      if (data.status && data.data) {
        setTotalOrders(data.data.totalOrder);
      }
    } catch (error) {
      console.error("Load total orders failed", error);
    } finally {
      setLoadingOrders(false);
    }
  }

  const loadTotalProducts = async () => {
    try {
      setLoadingProducts(true);
      const info = await fetch(`${API_URL}/dashboard/total-product`, {
        method: 'GET'
      });

      const data = await info.json();
      console.log('GET TOTAL PRODUCTS', data);
      
      if (data.status && data.data) {
        setTotalProducts(data.data.totalProduct);
      }
    } catch (error) {
      console.error("Load total products failed", error);
    } finally {
      setLoadingProducts(false);
    }
  }

  const loadTotalMembers = async () => {
    try {
      setLoadingMembers(true);
      const info = await fetch(`${API_URL}/dashboard/total-member`, {
        method: 'GET'
      });

      const data = await info.json();
      console.log('GET TOTAL MEMBERS', data);
      
      if (data.status && data.data) {
        setTotalMembers(data.data.totalMember);
      }
    } catch (error) {
      console.error("Load total members failed", error);
    } finally {
      setLoadingMembers(false);
    }
  }

  const loadRestockRecommendations = async () => {
    try {
      setLoadingRestock(true);
      const info = await fetch(`${API_URL}/dashboard/restock-recommendations`, {
        method: 'GET'
      });

      const data = await info.json();
      console.log('GET RESTOCK RECOMMENDATIONS', data);
      
      if (data.status && data.data) {
        setRestockRecommendations(data.data);
      }
    } catch (error) {
      console.error("Load restock recommendations failed", error);
    } finally {
      setLoadingRestock(false);
    }
  }

  const loadForecastData = async () => {
    try {
      setLoadingForecast(true);
      
      // Get product types if not already loaded
      let types = productType;
      if (types.length === 0) {
        types = await loadProductType();
      }
      
      if (types.length > 0) {
        const info = await fetch(`${API_URL}/predictor/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            forecastDays: forecastDays,
            drugFilter: types,
            model: "arima",
            startDate: startDate,
            endDate: endDate
          })
        });

        const data = await info.json();
        console.log("Forecast response:", data);
        
        if (data.status && data.data.results.success) {
          setForecastData(data.data.results);
        }
      }
    } catch (error) {
      console.error("Error loading forecast:", error);
    } finally {
      setLoadingForecast(false);
    }
  }

  useEffect(() => {
    loadTotalSales();
    loadTotalOrders();
    loadTotalProducts();
    loadTotalMembers();
    loadRestockRecommendations();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const types = await loadProductType();
      if (types.length > 0) {
        // Load predictor with the types we just fetched
        try {
          setLoadingForecast(true);
          const info = await fetch(`${API_URL}/predictor/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              forecastDays: forecastDays,
              drugFilter: types,
              model: "arima"
            })
          });

          const data = await info.json();
          console.log("Predictor response:", data);
          
          if (data.status && data.data.results.success) {
            setForecastData(data.data.results);
          }
        } catch (error) {
          console.error("Error loading predictor:", error);
        } finally {
          setLoadingForecast(false);
        }
      }
    };
    loadData();
  }, [forecastDays]);


  return (
    <div className="min-h-screen bg-gradient-to-br transition-colors duration-300"
      style={{
        background: isDark
          ? 'linear-gradient(to bottom right, #111827, #374151)'
          : 'linear-gradient(to bottom right, #f9fafb, white)'
      }}>
      {/* Main Container */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">

        {/* Header Section */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold transition-colors"
              style={{ color: isDark ? 'white' : '#111827' }}>
              {t('Dashboard')}
            </h1>
            <p className="mt-2 text-sm lg:text-base transition-colors"
              style={{ color: isDark ? '#d1d5db' : '#4b5563' }}>
              Monitor your pharmacy analytics and performance
            </p>
          </div>
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => navigate("/pos")}
              className="bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{t("openSalePOS")}</span>
            </button>
            <span className="text-sm lg:text-base font-medium transition-colors"
              style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          {getDashboardStats().map((stat: any, index: number) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="rounded-2xl p-6 shadow-lg border"
                style={{
                  backgroundColor: isDark ? '#374151' : 'white',
                  borderColor: isDark ? '#4b5563' : '#e5e7eb'
                }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium mb-1 transition-colors"
                      style={{ color: isDark ? '#d1d5db' : '#4b5563' }}>
                      {stat.title}
                    </p>
                    <div className="flex items-center">
                      {stat.isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 mr-2"
                            style={{ borderColor: stat.color === 'emerald' ? '#10b981' : '#3b82f6' }}>
                          </div>
                          <span className="text-lg font-bold transition-colors"
                            style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                            Loading...
                          </span>
                        </div>
                      ) : (
                        <p className="text-2xl lg:text-3xl font-bold transition-colors"
                          style={{ color: isDark ? 'white' : '#111827' }}>
                          {stat.value}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl shadow-md ${stat.color === 'emerald' ? (isDark ? 'bg-emerald-900 bg-opacity-50 text-emerald-400' : 'bg-emerald-100 text-emerald-600') :
                    stat.color === 'blue' ? (isDark ? 'bg-blue-900 bg-opacity-50 text-blue-400' : 'bg-blue-100 text-blue-600') :
                      stat.color === 'purple' ? (isDark ? 'bg-purple-900 bg-opacity-50 text-purple-400' : 'bg-purple-100 text-purple-600') :
                        (isDark ? 'bg-orange-900 bg-opacity-50 text-orange-400' : 'bg-orange-100 text-orange-600')
                    }`}>
                    <IconComponent className="w-6 h-6 lg:w-7 lg:h-7" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Product Types Analysis */}
        <div className="space-y-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <h2 className="text-2xl lg:text-3xl font-bold transition-colors"
              style={{ color: isDark ? 'white' : '#111827' }}>
              Product Types Performance
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Forecast Days Selector */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium transition-colors"
                  style={{ color: isDark ? '#d1d5db' : '#374151' }}>
                  Forecast Days:
                </label>
                <select 
                  value={forecastDays} 
                  onChange={(e) => setForecastDays(Number(e.target.value))}
                  className="px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: isDark ? '#374151' : 'white',
                    borderColor: isDark ? '#4b5563' : '#d1d5db',
                    color: isDark ? 'white' : '#111827'
                  }}>
                  <option value={3}>3 Days</option>
                  <option value={7}>7 Days</option>
                  <option value={14}>14 Days</option>
                  <option value={30}>30 Days</option>
                </select>
              </div>
              {/* Date Range Selector */}
              <div className="flex items-center space-x-2">
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: isDark ? '#374151' : 'white',
                    borderColor: isDark ? '#4b5563' : '#d1d5db',
                    color: isDark ? 'white' : '#111827'
                  }}
                />
                <span className="text-sm transition-colors"
                  style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>to</span>
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: isDark ? '#374151' : 'white',
                    borderColor: isDark ? '#4b5563' : '#d1d5db',
                    color: isDark ? 'white' : '#111827'
                  }}
                />
              </div>
              <button
                onClick={() => loadForecastData()}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Update Forecast
              </button>
            </div>
          </div>

          {/* Product Type Trend Charts with ARIMA Predictions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {productType.map((type: string, index: number) => {
              // Get forecast data for this product type
              const typeForecast = forecastData?.forecasts?.[type]?.ARIMA;
              
              // Transform forecast data for chart with better day labels
              const chartData = typeForecast ? typeForecast.dates.map((date: string, idx: number) => {
                const dateObj = new Date(date);
                const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                
                return {
                  day: dayNames[dateObj.getDay()],
                  date: `${monthNames[dateObj.getMonth()]} ${dateObj.getDate()}`,
                  fullDate: date,
                  forecast: Math.round(typeForecast.predictions[idx] * 100) / 100,
                  upper: Math.round(typeForecast.upper_confidence[idx] * 100) / 100,
                  lower: Math.round(typeForecast.lower_confidence[idx] * 100) / 100,
                  // Add historical data if available (mock for now - you can integrate real historical API)
                  historical: idx === 0 ? Math.round(typeForecast.predictions[idx] * 0.9 * 100) / 100 : null
                };
              }) : [];

              // Add some mock historical data points for better visualization
              if (chartData.length > 0) {
                const historicalDays = 3; // Show 3 days of historical data
                for (let i = 0; i < historicalDays; i++) {
                  const histDate = new Date(chartData[0].fullDate);
                  histDate.setDate(histDate.getDate() - (historicalDays - i));
                  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  
                  chartData.unshift({
                    day: dayNames[histDate.getDay()],
                    date: `${monthNames[histDate.getMonth()]} ${histDate.getDate()}`,
                    fullDate: histDate.toISOString().split('T')[0],
                    forecast: null,
                    upper: null,
                    lower: null,
                    historical: Math.round((chartData[0].forecast || 0) * (0.8 + Math.random() * 0.4) * 100) / 100
                  });
                }
              }

              // Calculate stats
              const avgPrediction = typeForecast ? 
                typeForecast.predictions.reduce((a: number, b: number) => a + b, 0) / typeForecast.predictions.length : 0;
              const peakPrediction = typeForecast ? Math.max(...typeForecast.predictions) : 0;

              // Color scheme for different product types
              const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
              const color = colors[index % colors.length];

              return (
                <div key={type} className="rounded-2xl shadow-lg border p-6"
                  style={{
                    backgroundColor: isDark ? '#374151' : 'white',
                    borderColor: isDark ? '#4b5563' : '#e5e7eb'
                  }}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-semibold text-lg transition-colors"
                        style={{ color: isDark ? 'white' : '#111827' }}>
                        {type}
                      </h3>
                      <p className="text-sm transition-colors"
                        style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                        {typeForecast ? `${forecastDays}-day ARIMA forecast` : 'Loading prediction...'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Package className="w-6 h-6" style={{ color: color }} />
                      {avgPrediction > 0 && (
                        <span className="text-sm font-semibold" style={{ color: color }}>
                          {Math.round(avgPrediction * 10) / 10}/day
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ARIMA Forecast Chart */}
                  <div className="h-48 mb-4">
                    {loadingForecast ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2"
                          style={{ borderColor: color }}></div>
                        <span className="ml-2 text-sm" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                          Loading forecast...
                        </span>
                      </div>
                    ) : chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" 
                            stroke={isDark ? '#4b5563' : '#f0f4f8'} />
                          <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#64748b' }}
                            interval={0}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#64748b' }}
                          />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="p-3 border rounded-lg shadow-lg transition-colors"
                                    style={{
                                      backgroundColor: isDark ? '#374151' : 'white',
                                      borderColor: isDark ? '#4b5563' : '#e5e7eb'
                                    }}>
                                    <p className="text-sm font-medium transition-colors"
                                      style={{ color: isDark ? 'white' : '#111827' }}>
                                      {label} - {data.date}
                                    </p>
                                    {data.historical !== null && (
                                      <p className="text-sm" style={{ color: '#6b7280' }}>
                                        Historical: {data.historical} units
                                      </p>
                                    )}
                                    {data.forecast !== null && (
                                      <p className="text-sm" style={{ color: color }}>
                                        Forecast: {data.forecast} units
                                      </p>
                                    )}
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          {/* Historical Data Line */}
                          <Line
                            type="monotone"
                            dataKey="historical"
                            stroke="#6b7280"
                            strokeWidth={2}
                            dot={{ fill: '#6b7280', strokeWidth: 2, r: 3 }}
                            connectNulls={false}
                            name="Historical"
                          />
                          {/* Forecast Data Line */}
                          <Line
                            type="monotone"
                            dataKey="forecast"
                            stroke={color}
                            strokeWidth={3}
                            strokeDasharray="5 5"
                            dot={{ fill: color, strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, fill: color }}
                            connectNulls={false}
                            name="Forecast"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-sm" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                          No forecast data available
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Forecast Statistics */}
                  <div className="flex justify-between items-center pt-4 border-t"
                    style={{
                      borderColor: isDark ? '#4b5563' : '#e5e7eb'
                    }}>
                    <div className="text-center flex-1">
                      <p className="text-xs transition-colors"
                        style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                        Avg Forecast
                      </p>
                      <p className="text-sm font-semibold transition-colors"
                        style={{ color: isDark ? 'white' : '#111827' }}>
                        {avgPrediction > 0 ? Math.round(avgPrediction * 10) / 10 : '—'} units/day
                      </p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-xs transition-colors"
                        style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                        Peak Day
                      </p>
                      <p className="text-sm font-semibold transition-colors"
                        style={{ color: isDark ? 'white' : '#111827' }}>
                        {peakPrediction > 0 ? Math.round(peakPrediction * 10) / 10 : '—'} units
                      </p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-xs transition-colors"
                        style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                        Trend
                      </p>
                      <p className="text-sm font-semibold transition-colors"
                        style={{ color: avgPrediction > peakPrediction * 0.8 ? '#10b981' : '#f59e0b' }}>
                        {avgPrediction > peakPrediction * 0.8 ? '↗ Rising' : '↘ Declining'}
                      </p>
                    </div>
                  </div>

                  {/* Legend for Chart Lines */}
                  <div className="mt-4 flex justify-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-0.5 bg-gray-500"></div>
                      <span className="text-xs transition-colors"
                        style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                        Historical
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-0.5 border-t-2 border-dashed" 
                           style={{ borderColor: color }}></div>
                      <span className="text-xs transition-colors"
                        style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                        Forecast
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Restock Recommendations */}
        <div className="rounded-2xl shadow-lg border overflow-hidden transition-all duration-300"
          style={{
            backgroundColor: isDark ? '#374151' : 'white',
            borderColor: isDark ? '#4b5563' : '#e5e7eb'
          }}>
          <div className="p-6 border-b transition-colors"
            style={{
              backgroundColor: isDark ? '#4b5563' : '#fef2f2',
              borderColor: isDark ? '#6b7280' : '#e5e7eb'
            }}>
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl shadow-md transition-colors"
                style={{
                  backgroundColor: isDark ? '#dc2626' : '#fed7d7'
                }}>
                <AlertCircle className="w-6 h-6"
                  style={{ color: isDark ? '#fca5a5' : '#dc2626' }} />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold transition-colors"
                  style={{ color: isDark ? 'white' : '#111827' }}>
                  Restock Recommendations
                </h2>
                <p className="text-sm lg:text-base mt-1 transition-colors"
                  style={{ color: isDark ? '#d1d5db' : '#4b5563' }}>
                  Advanced analytics with ABC classification, sales velocity trends, and safety stock calculations
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{
                backgroundColor: isDark ? '#4b5563' : '#f9fafb'
              }}>
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold transition-colors"
                    style={{ color: isDark ? '#e5e7eb' : '#374151' }}>Group</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold transition-colors"
                    style={{ color: isDark ? '#e5e7eb' : '#374151' }}>Product Type</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold transition-colors"
                    style={{ color: isDark ? '#e5e7eb' : '#374151' }}>Available</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold transition-colors"
                    style={{ color: isDark ? '#e5e7eb' : '#374151' }}>Expected</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold transition-colors"
                    style={{ color: isDark ? '#e5e7eb' : '#374151' }}>Restock</th>
                  <th className="px-4 py-4 text-center text-sm font-semibold transition-colors"
                    style={{ color: isDark ? '#e5e7eb' : '#374151' }}>Priority</th>
                </tr>
              </thead>
              <tbody style={{
                borderColor: isDark ? '#4b5563' : '#f3f4f6'
              }}>
                {loadingRestock ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span style={{ color: isDark ? '#d1d5db' : '#4b5563' }}>
                          Loading restock recommendations...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : restockRecommendations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center" 
                      style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                      No restock recommendations available
                    </td>
                  </tr>
                ) : restockRecommendations.map((item, index) => (
                  <tr key={index} className="transition-colors duration-300 border-b hover:bg-opacity-50"
                    style={{
                      borderColor: isDark ? '#4b5563' : '#f3f4f6'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isDark ? '#4b5563' : '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 font-mono font-bold text-sm rounded-full"
                        style={{
                          backgroundColor: isDark ? '#6b7280' : '#f3f4f6',
                          color: isDark ? '#e5e7eb' : '#374151'
                        }}>
                        {item.group}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium"
                      style={{ color: isDark ? '#f3f4f6' : '#111827' }}>
                      {item.name}
                    </td>
                    <td className="px-4 py-4 text-center text-sm font-medium"
                      style={{ color: isDark ? '#f3f4f6' : '#111827' }}>
                      {item.available?.toLocaleString() || 0}
                    </td>
                    <td className="px-4 py-4 text-center text-sm font-medium"
                      style={{ color: isDark ? '#f3f4f6' : '#111827' }}>
                      {item.expected?.toLocaleString() || 0}
                    </td>
                    <td className="px-4 py-4 text-center text-sm font-bold text-blue-600">
                      {item.restock?.toLocaleString() || 0}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${item.color}`}>
                        {item.priority === 'critical' ? 'Critical' : 
                         item.priority === 'high' ? 'High' : 
                         item.priority === 'medium' ? 'Medium' : 
                         item.priority === 'low' ? 'Low' : 'None'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}