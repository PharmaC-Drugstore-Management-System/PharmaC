import { useEffect, useState } from "react";
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

  // Current year date range for filtering (hidden from UI)
  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear, 0, 1); // January 1st of current year
  const endDate = new Date(currentYear, 11, 31); // December 31st of current year

  // Filter data to show only current year
  const filterDataByDateRange = (data: ChartDataPoint[]) => {
    return data.filter(item => {
      // Parse the date from the "Mon YYYY" format
      const itemDate = new Date(item.name + " 01"); // Add day to make it a valid date
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

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

      if (data.historical && data.forecast) {
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
      }
    } catch (error) {
      console.error("Error fetching forecast data:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const inventoryData = [
    { id: 1, name: "Amoxilin", amount: "15 pcs", status: t("inStock") },
    { id: 2, name: "Amoxilin", amount: "15 pcs", status: t("inStock") },
    { id: 3, name: "Amoxilin", amount: "15 pcs", status: t("inStock") },
    { id: 4, name: "Amoxilin", amount: "0 pcs", status: t("outOfStock") },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update filtered data when chart data changes
  useEffect(() => {
    if (revenueChartData.length > 0) {
      const filtered = filterDataByDateRange(revenueChartData);
      setFilteredChartData(filtered);
    }
  }, [revenueChartData]);

  type InventoryItem = {
    id: number;
    name: string;
    amount: string;
    status: string;
  };

  const renderInventoryItem = (item: InventoryItem) => {
    const isInStock = item.status === t("inStock");

    return (
      <div
        key={item.id}
        className="border-t py-3"
        style={{
          borderColor: document.documentElement.classList.contains("dark")
            ? "#4b5563"
            : "#e5e7eb",
        }}
      >
        <div className="flex items-center">
          <div
            className="w-16 h-16 rounded mr-4"
            style={{
              backgroundColor: document.documentElement.classList.contains(
                "dark"
              )
                ? "#4b5563"
                : "#e5e7eb",
            }}
          ></div>
          <div className="flex-1">
            <a
              href="#"
              className="text-xl hover:underline"
              style={{
                color: document.documentElement.classList.contains("dark")
                  ? "white"
                  : "#111827",
              }}
            >
              {item.name}
            </a>
          </div>
          <div className="w-24 text-center">
            <div
              style={{
                color: document.documentElement.classList.contains("dark")
                  ? "white"
                  : "#111827",
              }}
            >
              {item.amount}
            </div>
          </div>
          <div className="flex justify-center items-center w-32">
            <span
              className={`px-4 py-1 rounded-full text-center text-sm ${
                isInStock
                  ? "bg-green-100 text-green-800 "
                  : "bg-red-100 text-red-800 "
              }`}
            >
              {item.status}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="flex h-screen"
      style={{
        backgroundColor: document.documentElement.classList.contains("dark")
          ? "#111827"
          : "#f9fafb",
      }}
    >
      {/* Main Content */}

      <div className="flex-1 p-4 ">
        {/* Main Menu Title and Quick Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-1 h-8 bg-green-600 mr-2"></div>
            <h2
              className="text-xl font-bold"
              style={{
                color: document.documentElement.classList.contains("dark")
                  ? "white"
                  : "black",
              }}
            >
              {t("menu")}
            </h2>
          </div>
          {/* Quick POS Access */}
          <button
            onClick={() => navigate("/pos")}
            className="bg-green-600 hover:bg-green-700  text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>{t("openSalePOS")}</span>
          </button>
        </div>
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Chart */}
          <div className="lg:col-span-2">
            <div
              className="bg-white p-4 rounded-lg shadow"
              style={{
                backgroundColor: document.documentElement.classList.contains(
                  "dark"
                )
                  ? "#374151"
                  : "white",
                color: document.documentElement.classList.contains("dark")
                  ? "white"
                  : "black",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-lg font-semibold"
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
                    <span className="text-sm text-blue-600">
                      {t("loadingForecast")}
                    </span>
                  )}

                  {/* Forecast Options Dropdown */}
                  <select
                    value={selectedModel}
                    onChange={(e) => handleModelChange(e.target.value)}
                    disabled={isLoading}
                    className="
      px-4 py-2 
      border border-gray-300 
      rounded-lg 
      shadow-sm   
      text-gray-800
      font-medium
      focus:outline-none 
      focus:ring-2 
      focus:ring-blue-500 
      focus:border-blue-500
      transition
      hover:shadow-md
    "
    style={{
      backgroundColor: document.documentElement.classList.contains("dark")
        ? "#374151"
        : "white",
      color: document.documentElement.classList.contains("dark")
        ? "white"
        : "black",
    }}
                  >
                    {forecastOptions.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>

                  {/* Forecast Model Dropdown */}
                  <select
                    value={selectedForecastModel}
                    onChange={(e) => handleForecastModelChange(e.target.value)}
                    disabled={isLoading}
                    className="
      px-4 py-2 
      border border-gray-300 
      rounded-lg 
      shadow-sm
      text-gray-800
      font-medium
      focus:outline-none 
      focus:ring-2 
      focus:ring-blue-500 
      focus:border-blue-500
      transition
      hover:shadow-md
    "
    style={{
      backgroundColor: document.documentElement.classList.contains("dark")
        ? "#374151"
        : "white",
      color: document.documentElement.classList.contains("dark")
        ? "white"
        : "black",
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

              {/* Model Description */}
              <div
                className="mb-3 text-sm"
                style={{
                  color: document.documentElement.classList.contains("dark")
                    ? "#9ca3af"
                    : "#6b7280",
                }}
              >
                {
                  forecastOptions.find((option) => option.id === selectedModel)
                    ?.description
                }
              </div>

              <Link to="/revenue-detail">
                <div className="cursor-pointer hover:shadow-md transition-shadow">
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
                      {/* Historical Revenue Line */}
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#2563eb"
                        strokeWidth={3}
                        name={t("historicalRevenue")}
                        dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                      />
                      {/* Forecast Revenue Line */}
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

          {/* Trend Pie Chart */}
          <div
            className="p-4 rounded-lg shadow"
            style={{
              backgroundColor: document.documentElement.classList.contains(
                "dark"
              )
                ? "#374151"
                : "white",
            }}
          >
            <h3
              className="text-lg font-semibold mb-4"
              style={{
                color: document.documentElement.classList.contains("dark")
                  ? "white"
                  : "#111827",
              }}
            >
              {t("trend")}
            </h3>
            <div className="flex justify-center">
              <PieChart width={300} height={250}>
                <Pie
                  data={trendData}
                  cx={150}
                  cy={120}
                  innerRadius={0}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
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

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column - Sales Stats */}
          <div className="flex flex-col gap-4 h-full">
            <div
              className="p-5 rounded-lg shadow flex-1 flex flex-col"
              style={{
                backgroundColor: document.documentElement.classList.contains(
                  "dark"
                )
                  ? "#374151"
                  : "white",
              }}
            >
              <h3
                className="text-lg font-semibold mb-2"
                style={{
                  color: document.documentElement.classList.contains("dark")
                    ? "white"
                    : "#111827",
                }}
              >
                {t("amountSales")}
              </h3>
              <div
                className="text-4xl font-bold text-center"
                style={{
                  color: document.documentElement.classList.contains("dark")
                    ? "white"
                    : "#111827",
                }}
              >
                200
              </div>
              <div className="flex items-center justify-center text-green-500 mt-2">
                <span>+2.00</span>
              </div>
            </div>

            <div
              className="p-5 rounded-lg shadow flex-1 flex flex-col"
              style={{
                backgroundColor: document.documentElement.classList.contains(
                  "dark"
                )
                  ? "#374151"
                  : "white",
              }}
            >
              <h3
                className="text-lg font-semibold mb-2"
                style={{
                  color: document.documentElement.classList.contains("dark")
                    ? "white"
                    : "#111827",
                }}
              >
                {t("totalSales")}
              </h3>
              <div
                className="text-4xl font-bold text-center"
                style={{
                  color: document.documentElement.classList.contains("dark")
                    ? "white"
                    : "#111827",
                }}
              >
                70,000
              </div>
              <div className="flex items-center justify-center text-green-500 mt-2">
                <span>+2.00</span>
              </div>
            </div>
          </div>

          {/* Right Column - Inventory Stats */}
          <div className="flex flex-col gap-4 h-full">
            <div
              className="p-5 rounded-lg shadow flex-1 flex flex-col"
              style={{
                backgroundColor: document.documentElement.classList.contains(
                  "dark"
                )
                  ? "#374151"
                  : "white",
              }}
            >
              <h3
                className="text-lg font-semibold mb-1"
                style={{
                  color: document.documentElement.classList.contains("dark")
                    ? "white"
                    : "#111827",
                }}
              >
                {t("totalItemsInStock")}
              </h3>
              <div
                className="text-4xl font-bold text-center"
                style={{
                  color: document.documentElement.classList.contains("dark")
                    ? "white"
                    : "#111827",
                }}
              >
                1,500
              </div>
            </div>

            <div
              className="p-5 rounded-lg shadow flex-1 flex flex-col"
              style={{
                backgroundColor: document.documentElement.classList.contains(
                  "dark"
                )
                  ? "#374151"
                  : "white",
              }}
            >
              <h3
                className="text-lg font-semibold mb-1"
                style={{
                  color: document.documentElement.classList.contains("dark")
                    ? "white"
                    : "#111827",
                }}
              >
                {t("totalItemsSales")}
              </h3>
              <div
                className="text-4xl font-bold text-center"
                style={{
                  color: document.documentElement.classList.contains("dark")
                    ? "white"
                    : "#111827",
                }}
              >
                10,000
              </div>
            </div>

            <div
              className="p-5 rounded-lg shadow flex-1 flex flex-col"
              style={{
                backgroundColor: document.documentElement.classList.contains(
                  "dark"
                )
                  ? "#374151"
                  : "white",
              }}
            >
              <h3
                className="text-lg font-semibold mb-2"
                style={{
                  color: document.documentElement.classList.contains("dark")
                    ? "white"
                    : "#111827",
                }}
              >
                {t("profit")}
              </h3>
              <div
                className="text-4xl font-bold text-center"
                style={{
                  color: document.documentElement.classList.contains("dark")
                    ? "white"
                    : "#111827",
                }}
              >
                50,000
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Shortage Section */}
        <div
          className="p-4 rounded-lg shadow mt-6"
          style={{
            backgroundColor: document.documentElement.classList.contains("dark")
              ? "#374151"
              : "white",
          }}
        >
          <h3
            className="text-lg font-semibold mb-4"
            style={{
              color: document.documentElement.classList.contains("dark")
                ? "white"
                : "#111827",
            }}
          >
            {t("inventoryShortage")}
          </h3>
          <div>
            <div
              className="flex font-semibold py-3 border-b"
              style={{
                borderColor: document.documentElement.classList.contains("dark")
                  ? "#4b5563"
                  : "#e5e7eb",
                color: document.documentElement.classList.contains("dark")
                  ? "white"
                  : "#111827",
              }}
            >
              <div className="flex-1">{t("productName")}</div>
              <div className="w-24 text-center">{t("amount")}</div>
              <div className="w-32 text-center">{t("status")}</div>
            </div>
            {inventoryData.map((item) => renderInventoryItem(item))}
          </div>
        </div>
      </div>
    </div>
  );
}
