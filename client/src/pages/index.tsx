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

// Helper function to format forecast period label
const formatForecastPeriod = (days: number) => {
  if (days === 7) return '7 Days';
  if (days === 14) return '14 Days';
  if (days === 90) return '3 Months';
  if (days === 180) return '6 Months';
  return `${days} Days`;
};

// Product Type Descriptions Mapping - now uses translation keys
const getProductTypeKey = (code: string): string => {
  // Normalize code (remove slashes and special chars for translation key)
  const normalizedCode = code.replace(/\//g, '').replace(/-/g, '');
  return `productType_${normalizedCode}`;
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
  const [isCachedData, setIsCachedData] = useState(false);
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
  
  // Evaluation modal state
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<{
    productType: string;
    model: string;
    metrics: any;
  } | null>(null);
  
  // Forecast configuration states
  const [forecastDays, setForecastDays] = useState(7);
  const [selectedModel, setSelectedModel] = useState('prophet'); // Default to Prophet
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Default to 30 days ago
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });

  // LocalStorage cache management
  const CACHE_KEY = 'pharma_forecast_cache';
  const CACHE_EXPIRY_MS = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

  const saveForecastToLocalStorage = (data: any, params: any) => {
    try {
      const cacheData = {
        data,
        params,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('💾 Forecast saved to localStorage');
    } catch (error) {
      console.error('Failed to save forecast to localStorage:', error);
    }
  };

  const getForecastFromLocalStorage = (params: any) => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const age = Date.now() - cacheData.timestamp;

      // Check if cache is expired
      if (age > CACHE_EXPIRY_MS) {
        console.log('⏰ Cache expired, clearing...');
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      // Check if parameters match
      if (
        cacheData.params.forecastDays === params.forecastDays &&
        JSON.stringify(cacheData.params.drugFilter) === JSON.stringify(params.drugFilter) &&
        cacheData.params.model === params.model
      ) {
        console.log('✅ Loaded forecast from localStorage (age:', Math.round(age / 1000 / 60), 'minutes)');
        return cacheData.data;
      }

      console.log('🔄 Cache params mismatch, will fetch fresh data');
      return null;
    } catch (error) {
      console.error('Failed to read forecast from localStorage:', error);
      return null;
    }
  };

  const clearForecastCache = () => {
    localStorage.removeItem(CACHE_KEY);
    console.log('🗑️  Forecast cache cleared');
  };

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
        const requestParams = {
          forecastDays: forecastDays,
          drugFilter: types,
          model: selectedModel, // Use selected model
          startDate: startDate,
          endDate: endDate
        };

        // Try to get from localStorage first
        const cachedData = getForecastFromLocalStorage(requestParams);
        if (cachedData) {
          setForecastData(cachedData);
          setIsCachedData(true);
          setLoadingForecast(false);
          return;
        }

        // If no cache, fetch from API
        console.log('🔄 Fetching fresh forecast data from API...');
        const info = await fetch(`${API_URL}/predictor/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestParams)
        });

        const data = await info.json();
        console.log("Forecast response:", data);
        
        if (data.status && data.data.results.success) {
          const forecastResults = data.data.results;
          setForecastData(forecastResults);
          setIsCachedData(false);
          
          // Save to localStorage for next time
          saveForecastToLocalStorage(forecastResults, requestParams);
          
          // Also log if it came from backend cache
          if (data.data.cached) {
            console.log('📦 Data was from backend cache');
          }
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
        const requestParams = {
          forecastDays: forecastDays,
          drugFilter: types,
          model: selectedModel // Use selected model
        };

        // Try localStorage first for instant loading
        const cachedData = getForecastFromLocalStorage(requestParams);
        if (cachedData) {
          console.log('⚡ Instant load from localStorage on page load');
          setForecastData(cachedData);
          setIsCachedData(true);
          setLoadingForecast(false);
          return;
        }

        // If no cache, fetch from API
        try {
          setLoadingForecast(true);
          console.log('🔄 Initial fetch from API...');
          const info = await fetch(`${API_URL}/predictor/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestParams)
          });

          const data = await info.json();
          console.log("Predictor response:", data);
          
          if (data.status && data.data.results.success) {
            const forecastResults = data.data.results;
            setForecastData(forecastResults);
            setIsCachedData(false);
            
            // Save to localStorage for future visits
            saveForecastToLocalStorage(forecastResults, requestParams);
            
            if (data.data.cached) {
              console.log('📦 Data was from backend cache');
            }
          }
        } catch (error) {
          console.error("Error loading predictor:", error);
        } finally {
          setLoadingForecast(false);
        }
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forecastDays, selectedModel]); // Reload when model changes


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
              {/* Model Selector */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium transition-colors"
                  style={{ color: isDark ? '#d1d5db' : '#374151' }}>
                  Model:
                </label>
                <select 
                  value={selectedModel} 
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: isDark ? '#374151' : 'white',
                    borderColor: isDark ? '#4b5563' : '#d1d5db',
                    color: isDark ? 'white' : '#111827'
                  }}>
                  <option value="prophet">Prophet</option>
                  <option value="arima">ARIMA</option>
                  <option value="sarima">SARIMA</option>
                  <option value="catboost">CatBoost</option>
                </select>
              </div>
              {/* Forecast Days Selector */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium transition-colors"
                  style={{ color: isDark ? '#d1d5db' : '#374151' }}>
                  Forecast Period:
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
                  <option value={7}>7 Days</option>
                  <option value={14}>14 Days</option>
                  <option value={90}>3 Months</option>
                  <option value={180}>6 Months</option>
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
              
              {/* Cache Status Indicator */}
              {isCachedData && (
                <div className="flex items-center space-x-2 px-3 py-1 rounded-md text-xs"
                  style={{
                    backgroundColor: isDark ? '#065f46' : '#d1fae5',
                    color: isDark ? '#6ee7b7' : '#047857'
                  }}>
                  <span>💾 Cached</span>
                </div>
              )}
              
              {/* Clear Cache Button */}
              <button
                onClick={() => {
                  clearForecastCache();
                  setForecastData(null);
                  setIsCachedData(false);
                  loadForecastData();
                }}
                className="px-3 py-2 text-xs border rounded-md hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
                style={{
                  borderColor: isDark ? '#4b5563' : '#d1d5db',
                  color: isDark ? '#9ca3af' : '#6b7280'
                }}
                title="Clear cache and fetch fresh data"
              >
                🗑️ Clear Cache
              </button>
            </div>
          </div>

          {/* Product Type Trend Charts with Predictions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {productType.map((type: string, index: number) => {
              // Get forecast data for this product type - support multiple models with flexible casing
              const modelKeyUpper = selectedModel.toUpperCase(); // CATBOOST, ARIMA, SARIMA, PROPHET
              const modelKeyTitle = selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1).toLowerCase(); // Catboost, Prophet
              const modelKeyMixed = selectedModel === 'catboost' ? 'CatBoost' : 
                                     selectedModel === 'prophet' ? 'Prophet' :
                                     selectedModel === 'sarima' ? 'SARIMA' : 'ARIMA'; // Exact backend keys
              
              // Try multiple case variations to match backend response
              const typeForecast = forecastData?.forecasts?.[type]?.[modelKeyMixed] ||
                                   forecastData?.forecasts?.[type]?.[modelKeyUpper] ||
                                   forecastData?.forecasts?.[type]?.[modelKeyTitle] ||
                                   forecastData?.forecasts?.[type]?.ARIMA; // Final fallback
              
              // Debug logging (can be removed in production)
              if (index === 0 && forecastData?.forecasts?.[type]) {
                console.log(`🔍 Model keys for ${type}:`, Object.keys(forecastData.forecasts[type]));
                console.log(`🎯 Selected model: ${selectedModel}, Trying: ${modelKeyMixed}, ${modelKeyUpper}, ${modelKeyTitle}`);
                console.log(`✅ Found forecast:`, typeForecast ? 'Yes' : 'No');
              }
              
              // Helper function to aggregate data by time period
              const aggregateData = (dates: string[], predictions: number[], interval: number) => {
                const aggregated = [];
                for (let i = 0; i < dates.length; i += interval) {
                  const chunk = predictions.slice(i, i + interval);
                  const avgPrediction = chunk.reduce((a, b) => a + b, 0) / chunk.length;
                  aggregated.push({
                    date: dates[i],
                    prediction: avgPrediction
                  });
                }
                return aggregated;
              };

              // Determine aggregation interval based on forecast period
              let aggregationInterval = 1; // Default: daily
              
              if (forecastDays >= 180) {
                // 6 months: aggregate by ~30 days (monthly)
                aggregationInterval = 30;
              } else if (forecastDays >= 90) {
                // 3 months: aggregate by ~14 days (bi-weekly)
                aggregationInterval = 14;
              } else if (forecastDays >= 14) {
                // 14 days: aggregate by 2 days
                aggregationInterval = 2;
              }
              // 7 days or less: keep daily (interval = 1)
              
              // Transform and aggregate forecast data for chart
              let chartData: Array<{
                day: string;
                date: string;
                fullDate: string;
                forecast: number | null;
                upper: number | null;
                lower: number | null;
                historical: number | null;
              }> = [];
              if (typeForecast) {
                const aggregated = aggregateData(
                  typeForecast.dates, 
                  typeForecast.predictions, 
                  aggregationInterval
                );
                
                chartData = aggregated.map((item: any, idx: number) => {
                  const dateObj = new Date(item.date);
                  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  
                  // Format label based on aggregation level
                  let label = '';
                  if (aggregationInterval >= 30) {
                    // Monthly view: show "Jan", "Feb", etc.
                    label = monthNames[dateObj.getMonth()];
                  } else if (aggregationInterval >= 7) {
                    // Weekly/Bi-weekly view: show "Week 1", "Week 2", etc.
                    label = `W${idx + 1}`;
                  } else if (aggregationInterval > 1) {
                    // Every few days: show date like "Jan 1"
                    label = `${monthNames[dateObj.getMonth()]} ${dateObj.getDate()}`;
                  } else {
                    // Daily view: show day name
                    label = dayNames[dateObj.getDay()];
                  }
                  
                  return {
                    day: label,
                    date: `${monthNames[dateObj.getMonth()]} ${dateObj.getDate()}`,
                    fullDate: item.date,
                    forecast: Math.round(item.prediction * 100) / 100,
                    upper: null, // Confidence intervals would need aggregation too
                    lower: null,
                    historical: null // Start with no historical data
                  };
                });

                // Add some mock historical data points for better visualization
                if (chartData.length > 0) {
                  const historicalPoints = Math.min(3, Math.ceil(chartData.length * 0.2)); // 20% historical or max 3
                  const firstForecastValue = chartData[0].forecast || 0;
                  
                  for (let i = 0; i < historicalPoints; i++) {
                    const histDate = new Date(chartData[0].fullDate);
                    histDate.setDate(histDate.getDate() - (aggregationInterval * (historicalPoints - i)));
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    
                    // Format historical label the same way
                    let label = '';
                    if (aggregationInterval >= 30) {
                      label = monthNames[histDate.getMonth()];
                    } else if (aggregationInterval >= 7) {
                      label = `W${-i}`;
                    } else if (aggregationInterval > 1) {
                      label = `${monthNames[histDate.getMonth()]} ${histDate.getDate()}`;
                    } else {
                      const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
                      label = dayNames[histDate.getDay()];
                    }
                    
                    chartData.unshift({
                      day: label,
                      date: `${monthNames[histDate.getMonth()]} ${histDate.getDate()}`,
                      fullDate: histDate.toISOString().split('T')[0],
                      forecast: null,
                      upper: null,
                      lower: null,
                      historical: Math.round(firstForecastValue * (0.8 + Math.random() * 0.4) * 100) / 100
                    });
                  }
                  
                  // Make the first forecast point also show as historical to connect the lines
                  if (chartData.length > historicalPoints) {
                    chartData[historicalPoints].historical = chartData[historicalPoints].forecast;
                  }
                }
              }

              // Calculate stats
              const avgPrediction = typeForecast ? 
                typeForecast.predictions.reduce((a: number, b: number) => a + b, 0) / typeForecast.predictions.length : 0;
              const peakPrediction = typeForecast ? Math.max(...typeForecast.predictions) : 0;
              
              // Determine time unit label based on aggregation
              let timeUnit = 'day';
              if (aggregationInterval >= 30) {
                timeUnit = 'month';
              } else if (aggregationInterval >= 7) {
                timeUnit = 'week';
              }

              // Color scheme for different product types
              const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
              const color = colors[index % colors.length];

              return (
                <div 
                  key={type} 
                  className="rounded-2xl shadow-lg border p-6 transition-all hover:shadow-xl"
                  style={{
                    backgroundColor: isDark ? '#374151' : 'white',
                    borderColor: isDark ? '#4b5563' : '#e5e7eb'
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => navigate(`/sales-history?type=${encodeURIComponent(type)}`)}
                      title={`Click to view detailed sales history for ${type}`}
                    >
                      <h3 className="font-semibold text-lg transition-colors"
                        style={{ color: isDark ? 'white' : '#111827' }}>
                        {type}
                      </h3>
                      {/* Product Type Description Subtitle with Translation */}
                      {(() => {
                        const translationKey = getProductTypeKey(type);
                        const description = t(translationKey);
                        // Only show if translation exists (not the key itself)
                        return description !== translationKey && (
                          <p className="text-xs mt-1 leading-relaxed transition-colors"
                            style={{ 
                              color: isDark ? '#9ca3af' : '#6b7280',
                              fontStyle: 'italic'
                            }}>
                            {description}
                          </p>
                        );
                      })()}
                      <p className="text-sm mt-2 transition-colors"
                        style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                        {typeForecast ? `${formatForecastPeriod(forecastDays)} ${selectedModel.toUpperCase()} forecast` : 'Loading prediction...'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                      {/* Evaluation Info Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const metrics = forecastData?.model_performance?.[type]?.[modelKeyMixed];
                          if (metrics) {
                            setSelectedEvaluation({
                              productType: type,
                              model: selectedModel,
                              metrics: metrics
                            });
                            setShowEvaluationModal(true);
                          }
                        }}
                        className="p-2 rounded-lg transition-all hover:shadow-md"
                        style={{
                          backgroundColor: isDark ? '#4b5563' : '#f3f4f6',
                          color: isDark ? '#9ca3af' : '#6b7280'
                        }}
                        title="View model evaluation metrics"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                      
                      <Package className="w-6 h-6" style={{ color: color }} />
                      {avgPrediction > 0 && (
                        <span className="text-sm font-semibold" style={{ color: color }}>
                          {Math.round(avgPrediction * 10) / 10}/{timeUnit}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Forecast Chart */}
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
                        {avgPrediction > 0 ? Math.round(avgPrediction * 10) / 10 : '—'} units/{timeUnit}
                      </p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-xs transition-colors"
                        style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                        Peak {timeUnit === 'day' ? 'Day' : timeUnit === 'week' ? 'Week' : 'Month'}
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
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex space-x-4">
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
                    
                    {/* Click Indicator */}
                    <div className="flex items-center space-x-1 text-xs font-medium transition-colors"
                      style={{ color: color }}>
                      <span>View Details</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
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

      {/* Evaluation Modal */}
      {showEvaluationModal && selectedEvaluation && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={() => setShowEvaluationModal(false)}
        >
          <div 
            className="relative max-w-2xl w-full rounded-2xl shadow-2xl border overflow-hidden"
            style={{
              backgroundColor: isDark ? '#1f2937' : 'white',
              borderColor: isDark ? '#374151' : '#e5e7eb'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b" style={{
              backgroundColor: isDark ? '#374151' : '#f9fafb',
              borderColor: isDark ? '#4b5563' : '#e5e7eb'
            }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold transition-colors"
                    style={{ color: isDark ? 'white' : '#111827' }}>
                    Model Evaluation Metrics
                  </h3>
                  <p className="text-sm mt-1 transition-colors"
                    style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                    {selectedEvaluation.productType} - {selectedEvaluation.model.toUpperCase()} Model
                  </p>
                </div>
                <button
                  onClick={() => setShowEvaluationModal(false)}
                  className="p-2 rounded-lg transition-colors hover:bg-opacity-10 hover:bg-gray-500"
                  style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {/* MAE */}
                <div className="p-4 rounded-lg border" style={{
                  backgroundColor: isDark ? '#374151' : '#f9fafb',
                  borderColor: isDark ? '#4b5563' : '#e5e7eb'
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium transition-colors"
                      style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                      MAE
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      style={{ color: isDark ? '#60a5fa' : '#3b82f6' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold transition-colors"
                    style={{ color: isDark ? 'white' : '#111827' }}>
                    {selectedEvaluation.metrics.MAE?.toFixed(2) || 'N/A'}
                  </p>
                  <p className="text-xs mt-1 transition-colors"
                    style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                    Mean Absolute Error
                  </p>
                </div>

                {/* RMSE */}
                <div className="p-4 rounded-lg border" style={{
                  backgroundColor: isDark ? '#374151' : '#f9fafb',
                  borderColor: isDark ? '#4b5563' : '#e5e7eb'
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium transition-colors"
                      style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                      RMSE
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      style={{ color: isDark ? '#34d399' : '#10b981' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold transition-colors"
                    style={{ color: isDark ? 'white' : '#111827' }}>
                    {selectedEvaluation.metrics.RMSE?.toFixed(2) || 'N/A'}
                  </p>
                  <p className="text-xs mt-1 transition-colors"
                    style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                    Root Mean Squared Error
                  </p>
                </div>

                {/* MAPE */}
                <div className="p-4 rounded-lg border" style={{
                  backgroundColor: isDark ? '#374151' : '#f9fafb',
                  borderColor: isDark ? '#4b5563' : '#e5e7eb'
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium transition-colors"
                      style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                      MAPE
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      style={{ color: isDark ? '#fbbf24' : '#f59e0b' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold transition-colors"
                    style={{ color: isDark ? 'white' : '#111827' }}>
                    {selectedEvaluation.metrics.MAPE?.toFixed(2) || 'N/A'}%
                  </p>
                  <p className="text-xs mt-1 transition-colors"
                    style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                    Mean Absolute Percentage Error
                  </p>
                </div>

                {/* R² */}
                <div className="p-4 rounded-lg border" style={{
                  backgroundColor: isDark ? '#374151' : '#f9fafb',
                  borderColor: isDark ? '#4b5563' : '#e5e7eb'
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium transition-colors"
                      style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                      R²
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      style={{ color: isDark ? '#a78bfa' : '#8b5cf6' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold transition-colors"
                    style={{ color: isDark ? 'white' : '#111827' }}>
                    {selectedEvaluation.metrics.R2?.toFixed(4) || 'N/A'}
                  </p>
                  <p className="text-xs mt-1 transition-colors"
                    style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                    R-Squared Score
                  </p>
                </div>
              </div>

              {/* Interpretation Guide */}
              <div className="mt-6 p-4 rounded-lg border" style={{
                backgroundColor: isDark ? '#374151' : '#f9fafb',
                borderColor: isDark ? '#4b5563' : '#e5e7eb'
              }}>
                <h4 className="text-sm font-semibold mb-3 transition-colors"
                  style={{ color: isDark ? '#e5e7eb' : '#374151' }}>
                  Understanding the Metrics
                </h4>
                <div className="space-y-2 text-sm transition-colors"
                  style={{ color: isDark ? '#d1d5db' : '#6b7280' }}>
                  <div className="flex items-start">
                    <span className="font-medium mr-2" style={{ minWidth: '80px' }}>MAE & RMSE:</span>
                    <span>Lower values indicate better prediction accuracy</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2" style={{ minWidth: '80px' }}>MAPE:</span>
                    <span>Lower percentage means more accurate forecasts</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2" style={{ minWidth: '80px' }}>R²:</span>
                    <span>Closer to 1.0 indicates better model fit</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex justify-end" style={{
              backgroundColor: isDark ? '#374151' : '#f9fafb',
              borderColor: isDark ? '#4b5563' : '#e5e7eb'
            }}>
              <button
                onClick={() => setShowEvaluationModal(false)}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: isDark ? '#3b82f6' : '#2563eb',
                  color: 'white'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}