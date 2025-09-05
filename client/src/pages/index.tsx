import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type InventoryItem = {
  id: number;
  name: string;
  amount: string;
  status: string;
  image?: string;
};

export default function PharmaDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  // Define the chart data type
  type ChartDataPoint = {
    name: string;
    actual?: number;
    forecast?: number;
  };

  // Define forecast model configurations
  type ForecastOption = {
    id: string;
    name: string;
    forecastPeriods: number;
    testSizeMonths: number;
    description: string;
  };

  type ForecastModel = {
    id: string;
    name: string;
    model: string;
  };

  const forecastModels: ForecastModel[] = [
    {
      id: "arima",
      name: "ARIMA",
      model: "ARIMA",
    },
    {
      id: "sarima",
      name: "SARIMA",
      model: "SARIMA",
    },
  ];

  const forecastOptions: ForecastOption[] = [
    {
      id: "short_term",
      name: t('shortTerm'),
      forecastPeriods: 3,
      testSizeMonths: 6,
      description: t('quickForecast'),
    },
    {
      id: "medium_term",
      name: t('mediumTerm'),
      forecastPeriods: 6,
      testSizeMonths: 6,
      description: t('balancedForecast'),
    },
    {
      id: "long_term",
      name: t('longTerm'),
      forecastPeriods: 12,
      testSizeMonths: 6,
      description: t('extendedForecast'),
    },
  ];

  const [revenueChartData, setRevenueChartData] = useState<ChartDataPoint[]>([]);
  const [filteredChartData, setFilteredChartData] = useState<ChartDataPoint[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('medium_term');
  const [selectedForecastModel, setSelectedForecastModel] = useState<string>('arima');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Current year date range for filtering (hidden from UI)
  const currentYear = new Date().getFullYear();
  const { startDate, endDate } = useMemo(() => ({
    startDate: new Date(currentYear, 0, 1), // January 1st of current year
    endDate: new Date(currentYear, 11, 31), // December 31st of current year
  }), [currentYear]);

  // Filter data to show only current year
  const filterDataByDateRange = useCallback((data: ChartDataPoint[]) => {
    return data.filter(item => {
      // Parse the date from the "Mon YYYY" format
      const itemDate = new Date(item.name + " 01"); // Add day to make it a valid date
      return itemDate >= startDate && itemDate <= endDate;
    });
  }, [startDate, endDate]);

  const forecastMonthly = async (modelId?: string, forecastModelId?: string) => {
    try {
      setIsLoading(true);
      const currentOptions = forecastOptions.find(
        (model) => model.id === (modelId || selectedModel)
      );
      if (!currentOptions) return;

      const modelToSend = forecastModelId || selectedForecastModel;

      console.log(`Running forecast with ${currentOptions.name} using model ${modelToSend.toUpperCase()}`);

      const info = await fetch(`${API_URL}/arima/forecast`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          forecastPeriods: currentOptions.forecastPeriods,
          testSizeMonths: currentOptions.testSizeMonths,
          model_type: modelToSend.toUpperCase()
        })
      });

      const data = await info.json();
      console.log("Forecast data:", data);

      if (info.ok && data.historical && data.forecast) {
        const combinedData: ChartDataPoint[] = [];

        // Add historical data
        data.historical.forEach((item: any) => {
          const date = new Date(item.date);
          const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          combinedData.push({
            name: monthYear,
            actual: Math.round(item.revenue),
          });
        });

        // Add forecast data
        data.forecast.forEach((item: any) => {
          const date = new Date(item.date);
          const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          combinedData.push({
            name: monthYear,
            forecast: Math.round(item.revenue),
          });
        });

        setRevenueChartData(combinedData);
        
        // Filter data for current year and update filtered chart data
        const filtered = filterDataByDateRange(combinedData);
        setFilteredChartData(filtered);
      } else {
        // POST request error - show error alert
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to generate forecast data',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
      }
    } catch (error) {
      console.error("Error fetching forecast data:", error);
      // POST request network error - show error alert
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Network error occurred. Please try again.',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inventoryShortageData = async () => {
    try {
      const info = await fetch(`${API_URL}/lot/getLotProduct`, {
        method: "GET",
        credentials: "include",
      })
      const infoData = await info.json();
      console.log("Lot with product data:", infoData.data);
      
      if (infoData.status && infoData.data) {
        // Process the lot data to create inventory items
        const processedInventory: InventoryItem[] = infoData.data.map((lot: any, index: number) => {
          const amount = lot.init_amount || 0;
          let status: string;
          
          // Determine status based on amount
          if (amount === 0) {
            status = t("outOfStock");
          } else if (amount < 10) {
            status = t("lowStock");
          } else {
            status = t("inStock");
          }
          
          // Get product image if available
          const productImage = lot.product?.product_picture ? 
            `${API_URL}/uploads/${lot.product.product_picture}` : 
            null;
          
          return {
            id: lot.lot_id || index + 1,
            name: lot.product?.product_name || "Unknown Product",
            amount: `${amount} pcs`,
            status: status,
            image: productImage
          };
        });
        
        setInventoryData(processedInventory);
      }
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: `Failed to load inventory data: ${error}`,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
    }
  }

  const handleModelChange = async (modelId: string) => {
    setSelectedModel(modelId);
    await forecastMonthly(modelId);
  };

  const handleForecastModelChange = async (modelId: string) => {
    setSelectedForecastModel(modelId);
    await forecastMonthly(selectedModel, modelId);
  };

  const trendData = [
    { name: "Amoxicillin", value: 40 },
    { name: "Ibuprofen", value: 30 },
    { name: "Alprazolam", value: 13.3 },
    { name: "Benzonatate", value: 10 },
    { name: "Cephalexin", value: 6.7 },
  ];

  const COLORS = ["#79e2f2", "#7ab8f2", "#4d82bf", "#38618c", "#213559"];

  const checkme = async () => {
    try {
      const authme = await fetch(`${API_URL}/api/me`, {
        method: "GET",
        credentials: "include",
      });
      const data = await authme.json();
      if (authme.status === 401 || authme.status === 403) {
        navigate("/login");
        return;
      }

      console.log("Authme data:", data);
    } catch (error) {
      console.log("Error", error);
    }
  };

  useEffect(() => {
    checkme();
    forecastMonthly();
    inventoryShortageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update filtered data when chart data changes
  useEffect(() => {
    if (revenueChartData.length > 0) {
      const filtered = filterDataByDateRange(revenueChartData);
      setFilteredChartData(filtered);
    }
  }, [revenueChartData, filterDataByDateRange]);

  return (
    <div
      className="min-h-screen p-6"
      style={{
        backgroundColor: document.documentElement.classList.contains("dark")
          ? "#111827"
          : "#f9fafb",
      }}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="w-1 h-8 bg-green-600 mr-3"></div>
          <h1
            className="text-3xl font-bold"
            style={{
              color: document.documentElement.classList.contains("dark")
                ? "white"
                : "#111827",
            }}
          >
            {t("menu")}
          </h1>
        </div>
        
        {/* Quick POS Access - Enhanced */}
        <button
          onClick={() => navigate("/pos")}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-xl font-semibold flex items-center space-x-3 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="text-lg">{t("openSalePOS")}</span>
        </button>
      </div>

      {/* Charts Section - Improved Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        {/* Revenue Chart - Enhanced */}
        <div className="xl:col-span-2">
          <div
            className="rounded-xl shadow-lg border p-6"
            style={{
              backgroundColor: document.documentElement.classList.contains("dark")
                ? "#374151"
                : "white",
              borderColor: document.documentElement.classList.contains("dark")
                ? "#4b5563"
                : "#e5e7eb",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3
                className="text-xl font-bold"
                style={{
                  color: document.documentElement.classList.contains("dark")
                    ? "white"
                    : "#111827",
                }}
              >
                {t("revenueForecast")}
              </h3>
              <div className="flex items-center space-x-3">
                {isLoading && (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="text-sm text-blue-600 font-medium">
                      {t("loadingForecast")}
                    </span>
                  </div>
                )}

                {/* Forecast Options Dropdown - Enhanced */}
                <select
                  value={selectedModel}
                  onChange={(e) => handleModelChange(e.target.value)}
                  disabled={isLoading}
                  className="px-4 py-2 border rounded-lg shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:shadow-md"
                  style={{
                    backgroundColor: document.documentElement.classList.contains("dark")
                      ? "#4b5563"
                      : "white",
                    borderColor: document.documentElement.classList.contains("dark")
                      ? "#6b7280"
                      : "#d1d5db",
                    color: document.documentElement.classList.contains("dark")
                      ? "white"
                      : "#111827",
                  }}
                >
                  {forecastOptions.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>

                {/* Forecast Model Dropdown - Enhanced */}
                <select
                  value={selectedForecastModel}
                  onChange={(e) => handleForecastModelChange(e.target.value)}
                  disabled={isLoading}
                  className="px-4 py-2 border rounded-lg shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:shadow-md"
                  style={{
                    backgroundColor: document.documentElement.classList.contains("dark")
                      ? "#4b5563"
                      : "white",
                    borderColor: document.documentElement.classList.contains("dark")
                      ? "#6b7280"
                      : "#d1d5db",
                    color: document.documentElement.classList.contains("dark")
                      ? "white"
                      : "#111827",
                  }}
                >
                  {forecastModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Model Description - Enhanced */}
            <div
              className="mb-4 p-3 rounded-lg text-sm"
              style={{
                backgroundColor: document.documentElement.classList.contains("dark")
                  ? "#4b5563"
                  : "#f8fafc",
                color: document.documentElement.classList.contains("dark")
                  ? "#d1d5db"
                  : "#64748b",
              }}
            >
              {forecastOptions.find((option) => option.id === selectedModel)?.description}
            </div>

            <Link to="/revenue-detail">
              <div className="cursor-pointer hover:shadow-lg transition-all duration-300 rounded-lg p-4"
                   style={{
                     backgroundColor: document.documentElement.classList.contains("dark")
                       ? "#4b5563"
                       : "#f8fafc",
                   }}>
                <div className="flex justify-center">
                  <LineChart width={600} height={300} data={filteredChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `₿${value.toLocaleString()}`}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        `${value?.toLocaleString() || 0} ฿`,
                        name === 'actual' ? 'Historical Revenue' : 'Forecast Revenue'
                      ]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#2563eb"
                      strokeWidth={3}
                      name={t("historicalRevenue")}
                      dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      stroke="#dc2626"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      name={t("forecastRevenue")}
                      dot={{ fill: "#dc2626", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Trend Pie Chart - Enhanced */}
        <div
          className="rounded-xl shadow-lg border p-6"
          style={{
            backgroundColor: document.documentElement.classList.contains("dark")
              ? "#374151"
              : "white",
            borderColor: document.documentElement.classList.contains("dark")
              ? "#4b5563"
              : "#e5e7eb",
          }}
        >
          <h3
            className="text-xl font-bold mb-6"
            style={{
              color: document.documentElement.classList.contains("dark")
                ? "white"
                : "#111827",
            }}
          >
            {t("trend")}
          </h3>
          <div className="flex justify-center">
            <PieChart width={350} height={300}>
              <Pie
                data={trendData}
                cx={175}
                cy={150}
                innerRadius={0}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {trendData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </div>
      </div>

      {/* Stats Cards Section - Redesigned */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Sales Stats Cards */}
        <div className="rounded-xl shadow-lg border p-6 hover:shadow-xl transition-all duration-300"
             style={{
               backgroundColor: document.documentElement.classList.contains("dark")
                 ? "#374151"
                 : "white",
               borderColor: document.documentElement.classList.contains("dark")
                 ? "#4b5563"
                 : "#e5e7eb",
             }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium"
                 style={{
                   color: document.documentElement.classList.contains("dark")
                     ? "#9ca3af"
                     : "#6b7280",
                 }}>
                {t("amountSales")}
              </p>
              <p className="text-3xl font-bold mt-2"
                 style={{
                   color: document.documentElement.classList.contains("dark")
                     ? "white"
                     : "#111827",
                 }}>
                200
              </p>
              <p className="text-sm text-green-600 mt-1 font-medium">+2.00%</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl shadow-lg border p-6 hover:shadow-xl transition-all duration-300"
             style={{
               backgroundColor: document.documentElement.classList.contains("dark")
                 ? "#374151"
                 : "white",
               borderColor: document.documentElement.classList.contains("dark")
                 ? "#4b5563"
                 : "#e5e7eb",
             }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium"
                 style={{
                   color: document.documentElement.classList.contains("dark")
                     ? "#9ca3af"
                     : "#6b7280",
                 }}>
                {t("totalSales")}
              </p>
              <p className="text-3xl font-bold mt-2"
                 style={{
                   color: document.documentElement.classList.contains("dark")
                     ? "white"
                     : "#111827",
                 }}>
                ฿70,000
              </p>
              <p className="text-sm text-green-600 mt-1 font-medium">+2.00%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <ShoppingCart className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl shadow-lg border p-6 hover:shadow-xl transition-all duration-300"
             style={{
               backgroundColor: document.documentElement.classList.contains("dark")
                 ? "#374151"
                 : "white",
               borderColor: document.documentElement.classList.contains("dark")
                 ? "#4b5563"
                 : "#e5e7eb",
             }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium"
                 style={{
                   color: document.documentElement.classList.contains("dark")
                     ? "#9ca3af"
                     : "#6b7280",
                 }}>
                {t("totalItemsInStock")}
              </p>
              <p className="text-3xl font-bold mt-2"
                 style={{
                   color: document.documentElement.classList.contains("dark")
                     ? "white"
                     : "#111827",
                 }}>
                1,500
              </p>
              <p className="text-sm text-blue-600 mt-1 font-medium">Items</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <ShoppingCart className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl shadow-lg border p-6 hover:shadow-xl transition-all duration-300"
             style={{
               backgroundColor: document.documentElement.classList.contains("dark")
                 ? "#374151"
                 : "white",
               borderColor: document.documentElement.classList.contains("dark")
                 ? "#4b5563"
                 : "#e5e7eb",
             }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium"
                 style={{
                   color: document.documentElement.classList.contains("dark")
                     ? "#9ca3af"
                     : "#6b7280",
                 }}>
                {t("profit")}
              </p>
              <p className="text-3xl font-bold mt-2"
                 style={{
                   color: document.documentElement.classList.contains("dark")
                     ? "white"
                     : "#111827",
                 }}>
                ฿50,000
              </p>
              <p className="text-sm text-green-600 mt-1 font-medium">Profit</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <ShoppingCart className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Shortage Section - Enhanced Design */}
      <div className="rounded-xl shadow-lg border p-8"
           style={{
             backgroundColor: document.documentElement.classList.contains("dark")
               ? "#374151"
               : "white",
             borderColor: document.documentElement.classList.contains("dark")
               ? "#4b5563"
               : "#e5e7eb",
           }}>
        
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold flex items-center"
              style={{
                color: document.documentElement.classList.contains("dark")
                  ? "white"
                  : "#111827",
              }}>
            <div className="w-1 h-6 bg-red-500 mr-3 rounded-full"></div>
            {t("inventoryShortage")}
          </h3>
          <div className="text-sm font-medium px-3 py-1 rounded-full bg-red-100 text-red-800">
            {inventoryData.length} items
          </div>
        </div>

        {/* Modern Table Design */}
        <div className="overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 rounded-t-lg font-semibold text-sm"
               style={{
                 backgroundColor: document.documentElement.classList.contains("dark")
                   ? "#4b5563"
                   : "#f8fafc",
                 color: document.documentElement.classList.contains("dark")
                   ? "#d1d5db"
                   : "#475569",
               }}>
            <div className="col-span-2 text-center">Image</div>
            <div className="col-span-5">Product Name</div>
            <div className="col-span-2 text-center">Amount</div>
            <div className="col-span-3 text-center">Status</div>
          </div>

          {/* Table Body */}
          <div className="divide-y"
               style={{
                 borderColor: document.documentElement.classList.contains("dark")
                   ? "#4b5563"
                   : "#e2e8f0",
               }}>
            {(() => {
              const startIndex = (currentPage - 1) * itemsPerPage;
              const endIndex = startIndex + itemsPerPage;
              const paginatedItems = inventoryData.slice(startIndex, endIndex);
              
              if (paginatedItems.length === 0) {
                return (
                  <div className="p-8 text-center"
                       style={{
                         color: document.documentElement.classList.contains("dark")
                           ? "#9ca3af"
                           : "#6b7280",
                       }}>
                    <p className="text-lg">No inventory shortage items found</p>
                  </div>
                );
              }
              
              return paginatedItems.map((item) => {
                const isInStock = item.status === t("inStock");
                const isLowStock = item.status === t("lowStock");
                
                const rawImage = item.image ?? "";
                const imgSrc = rawImage
                  ? rawImage.startsWith("http")
                    ? rawImage
                    : `${API_URL}${rawImage}`
                  : null;

                return (
                  <div key={item.id}
                       className="grid grid-cols-12 gap-4 p-4 hover:shadow-md transition-all duration-300"
                       style={{
                         backgroundColor: document.documentElement.classList.contains("dark")
                           ? "#374151"
                           : "white",
                       }}
                       onMouseEnter={(e) => {
                         e.currentTarget.style.backgroundColor = document.documentElement.classList.contains("dark")
                           ? "#4b5563"
                           : "#f8fafc";
                       }}
                       onMouseLeave={(e) => {
                         e.currentTarget.style.backgroundColor = document.documentElement.classList.contains("dark")
                           ? "#374151"
                           : "white";
                       }}>
                    
                    {/* Image Column */}
                    <div className="col-span-2 flex justify-center">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border"
                           style={{
                             borderColor: document.documentElement.classList.contains("dark")
                               ? "#6b7280"
                               : "#d1d5db",
                           }}>
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-medium"
                               style={{
                                 backgroundColor: document.documentElement.classList.contains("dark")
                                   ? "#4b5563"
                                   : "#f1f5f9",
                                 color: document.documentElement.classList.contains("dark")
                                   ? "#9ca3af"
                                   : "#64748b",
                               }}>
                            No Image
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Name Column */}
                    <div className="col-span-5 flex items-center">
                      <div>
                        <h4 className="font-semibold text-lg"
                            style={{
                              color: document.documentElement.classList.contains("dark")
                                ? "white"
                                : "#1e293b",
                            }}>
                          {item.name}
                        </h4>
                        <p className="text-sm"
                           style={{
                             color: document.documentElement.classList.contains("dark")
                               ? "#9ca3af"
                               : "#64748b",
                           }}>
                          Lot ID: {item.id}
                        </p>
                      </div>
                    </div>

                    {/* Amount Column */}
                    <div className="col-span-2 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-bold"
                             style={{
                               color: document.documentElement.classList.contains("dark")
                                 ? "white"
                                 : "#1e293b",
                             }}>
                          {item.amount}
                        </div>
                      </div>
                    </div>

                    {/* Status Column */}
                    <div className="col-span-3 flex items-center justify-center">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        isInStock
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : isLowStock
                          ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                          : "bg-red-100 text-red-800 border border-red-200"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* Enhanced Pagination */}
          {inventoryData.length > itemsPerPage && (
            <div className="flex justify-between items-center p-6 border-t"
                 style={{
                   backgroundColor: document.documentElement.classList.contains("dark")
                     ? "#4b5563"
                     : "#f8fafc",
                   borderColor: document.documentElement.classList.contains("dark")
                     ? "#6b7280"
                     : "#e2e8f0",
                 }}>
              <div className="text-sm font-medium"
                   style={{
                     color: document.documentElement.classList.contains("dark")
                       ? "#d1d5db"
                       : "#475569",
                   }}>
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, inventoryData.length)} to {Math.min(currentPage * itemsPerPage, inventoryData.length)} of {inventoryData.length} items
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                  style={{
                    backgroundColor: document.documentElement.classList.contains("dark")
                      ? "#374151"
                      : "white",
                    borderColor: document.documentElement.classList.contains("dark")
                      ? "#6b7280"
                      : "#d1d5db",
                    color: document.documentElement.classList.contains("dark")
                      ? "white"
                      : "#374151",
                  }}>
                  Previous
                </button>
                
                <div className="flex items-center px-3 py-2 rounded-lg font-semibold"
                     style={{
                       backgroundColor: document.documentElement.classList.contains("dark")
                         ? "#4b5563"
                         : "#f1f5f9",
                       color: document.documentElement.classList.contains("dark")
                         ? "white"
                         : "#1e293b",
                     }}>
                  Page {currentPage} of {Math.ceil(inventoryData.length / itemsPerPage)}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage * itemsPerPage >= inventoryData.length}
                  className="px-4 py-2 rounded-lg border font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                  style={{
                    backgroundColor: document.documentElement.classList.contains("dark")
                      ? "#374151"
                      : "white",
                    borderColor: document.documentElement.classList.contains("dark")
                      ? "#6b7280"
                      : "#d1d5db",
                    color: document.documentElement.classList.contains("dark")
                      ? "white"
                      : "#374151",
                  }}>
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
