import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeProvider';
import {
  ShoppingCart,
  TrendingUp,
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
              forecastDays: 7,
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
  }, []);


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
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <h2 className="text-2xl lg:text-3xl font-bold transition-colors"
              style={{ color: isDark ? 'white' : '#111827' }}>
              Product Types Performance
            </h2>
            <div className="flex items-center space-x-2 text-sm lg:text-base font-medium transition-colors"
              style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
              <TrendingUp className="w-5 h-5" />
              <span>Weekly Analysis</span>
            </div>
          </div>

          {/* Product Type Trend Charts with ARIMA Predictions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {productType.map((type: string, index: number) => {
              // Get forecast data for this product type
              const typeForecast = forecastData?.forecasts?.[type]?.ARIMA;
              const performance = forecastData?.model_performance?.[type]?.ARIMA;
              
              // Transform forecast data for chart
              const chartData = typeForecast ? typeForecast.dates.map((date: string, idx: number) => ({
                day: `Day ${idx + 1}`,
                date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                prediction: Math.round(typeForecast.predictions[idx] * 100) / 100,
                upper: Math.round(typeForecast.upper_confidence[idx] * 100) / 100,
                lower: Math.round(typeForecast.lower_confidence[idx] * 100) / 100
              })) : [];

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
                        {typeForecast ? '7-day ARIMA forecast' : 'Loading prediction...'}
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
                            tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#64748b' }}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#64748b' }}
                          />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="p-3 border rounded-lg shadow-lg transition-colors"
                                    style={{
                                      backgroundColor: isDark ? '#374151' : 'white',
                                      borderColor: isDark ? '#4b5563' : '#e5e7eb'
                                    }}>
                                    <p className="text-sm font-medium transition-colors"
                                      style={{ color: isDark ? 'white' : '#111827' }}>
                                      {label}
                                    </p>
                                    <p className="text-sm" style={{ color: color }}>
                                      Forecast: {payload[0].value} units
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="prediction"
                            stroke={color}
                            strokeWidth={3}
                            dot={{ fill: color, strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, fill: color }}
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
                    <div className="text-center">
                      <p className="text-xs transition-colors"
                        style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                        Avg Forecast
                      </p>
                      <p className="text-sm font-semibold transition-colors"
                        style={{ color: isDark ? 'white' : '#111827' }}>
                        {avgPrediction > 0 ? Math.round(avgPrediction * 10) / 10 : '—'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs transition-colors"
                        style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                        Peak Day
                      </p>
                      <p className="text-sm font-semibold transition-colors"
                        style={{ color: isDark ? 'white' : '#111827' }}>
                        {peakPrediction > 0 ? Math.round(peakPrediction * 10) / 10 : '—'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs transition-colors"
                        style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                        Accuracy
                      </p>
                      <p className="text-sm font-semibold transition-colors"
                        style={{ color: isDark ? 'white' : '#111827' }}>
                        {performance ? Math.round((100 - performance.MAPE) * 10) / 10 + '%' : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Model Performance Details */}
                  {performance && (
                    <div className="mt-4 p-3 rounded-lg"
                      style={{
                        backgroundColor: isDark ? '#4b5563' : '#f9fafb'
                      }}>
                      <p className="text-xs font-medium mb-2 transition-colors"
                        style={{ color: isDark ? '#d1d5db' : '#4b5563' }}>
                        Model Performance:
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="transition-colors"
                            style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                            MAE: </span>
                          <span className="font-semibold transition-colors"
                            style={{ color: isDark ? 'white' : '#111827' }}>
                            {Math.round(performance.MAE * 100) / 100}
                          </span>
                        </div>
                        <div>
                          <span className="transition-colors"
                            style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                            RMSE: </span>
                          <span className="font-semibold transition-colors"
                            style={{ color: isDark ? 'white' : '#111827' }}>
                            {Math.round(performance.RMSE * 100) / 100}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
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
                  AI-powered inventory insights using sales history analysis
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
                  <th className="px-6 py-4 text-left text-sm font-semibold transition-colors"
                    style={{ color: isDark ? '#e5e7eb' : '#374151' }}>Group</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold transition-colors"
                    style={{ color: isDark ? '#e5e7eb' : '#374151' }}>Product Type</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold transition-colors"
                    style={{ color: isDark ? '#e5e7eb' : '#374151' }}>Current Stock</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold transition-colors"
                    style={{ color: isDark ? '#e5e7eb' : '#374151' }}>Recommended Stock</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold transition-colors"
                    style={{ color: isDark ? '#e5e7eb' : '#374151' }}>Restock Needed</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold transition-colors"
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
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 font-mono font-bold text-sm rounded-full"
                        style={{
                          backgroundColor: isDark ? '#6b7280' : '#f3f4f6',
                          color: isDark ? '#e5e7eb' : '#374151'
                        }}>
                        {item.group}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium"
                      style={{ color: isDark ? '#f3f4f6' : '#111827' }}>
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-center text-sm transition-colors"
                      style={{ color: isDark ? '#f3f4f6' : '#111827' }}>
                      {item.available?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 text-center text-sm transition-colors"
                      style={{ color: isDark ? '#f3f4f6' : '#111827' }}>
                      {item.expected?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-sm font-bold ${item.restock > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {item.restock > 0 ? item.restock.toLocaleString() : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${item.color}`}>
                        {item.priority === 'high' ? 'High' : item.priority === 'medium' ? 'Medium' : item.priority === 'low' ? 'Low' : 'None'}
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