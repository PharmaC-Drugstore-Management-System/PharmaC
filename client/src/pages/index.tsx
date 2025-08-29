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


export default function PharmaDashboard() {
  const navigate = useNavigate();

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
  }

  const forecastModels: ForecastModel[] = [
    {
      id: 'arima',
      name: 'ARIMA',
      model: 'ARIMA'
    },
    {
      id: 'sarima',
      name: 'SARIMA',
      model: 'SARIMA'
    }
  ];

  const forecastOptions: ForecastOption[] = [
    {
      id: 'short_term',
      name: 'Short Term (3 months)',
      forecastPeriods: 3,
      testSizeMonths: 6,
      description: 'Quick forecast for immediate planning'
    },
    {
      id: 'medium_term',
      name: 'Medium Term (6 months)',
      forecastPeriods: 6,
      testSizeMonths: 6,
      description: 'Balanced forecast for quarterly planning'
    },
    {
      id: 'long_term',
      name: 'Long Term (12 months)',
      forecastPeriods: 12,
      testSizeMonths: 6,
      description: 'Extended forecast for annual planning'
    },
  ];

  const [revenueChartData, setRevenueChartData] = useState<ChartDataPoint[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('medium_term');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const forecastMonthly = async (modelId?: string) => {
    try {
      setIsLoading(true);
      const currentOptions = forecastOptions.find(model => model.id === (modelId || selectedModel));
      if (!currentOptions) return;

      console.log(`Running forecast with ${currentOptions.name}...`);

      const info = await fetch('http://localhost:5000/arima/forecast', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          forecastPeriods: currentOptions.forecastPeriods,
          testSizeMonths: currentOptions.testSizeMonths
        })
      });

      const data = await info.json();
      console.log('Forecast data:', data);

      if (data.historical && data.forecast) {
        const combinedData: ChartDataPoint[] = [];

        // Add historical data
        data.historical.forEach((item: any) => {
          const date = new Date(item.date);
          const monthName = date.toLocaleDateString('en-US', { month: 'short' });
          combinedData.push({
            name: monthName,
            actual: Math.round(item.revenue),
          });
        });

        // Add forecast data
        data.forecast.forEach((item: any) => {
          const date = new Date(item.date);
          const monthName = date.toLocaleDateString('en-US', { month: 'short' });
          combinedData.push({
            name: monthName,
            forecast: Math.round(item.revenue),
          });
        });

        setRevenueChartData(combinedData);
      }
    } catch (error) {
      console.error('Error fetching forecast data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelChange = async (modelId: string) => {
    setSelectedModel(modelId);
    await forecastMonthly(modelId);
  };

  const trendData = [
    { name: "Amoxicillin", value: 40 },
    { name: "Ibuprofen", value: 30 },
    { name: "Alprazolam", value: 13.3 },
    { name: "Benzonatate", value: 10 },
    { name: "Cephalexin", value: 6.7 },
  ];

  const inventoryData = [
    { id: 1, name: "Amoxilin", amount: "15 pcs", status: "In Stock" },
    { id: 2, name: "Amoxilin", amount: "15 pcs", status: "In Stock" },
    { id: 3, name: "Amoxilin", amount: "15 pcs", status: "In Stock" },
    { id: 4, name: "Amoxilin", amount: "0 pcs", status: "Out of Stock" },
  ];

  const COLORS = ["#79e2f2", "#7ab8f2", "#4d82bf", "#38618c", "#213559"];

  const checkme = async () => {
    try {
      const authme = await fetch('http://localhost:5000/api/me', {
        method: 'GET',
        credentials: 'include'
      })
      const data = await authme.json();
      if (authme.status === 401 || authme.status === 403) {
        navigate('/login');
        return;
      }

      console.log('Authme data:', data);
    } catch (error) {
      console.log('Error', error)

    }
  }


  useEffect(() => {
    checkme()
    forecastMonthly()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  type InventoryItem = {
    id: number;
    name: string;
    amount: string;
    status: string;
  };

  const renderInventoryItem = ((item: InventoryItem) => {
    const isInStock = item.status === "In Stock";

    return (
      <div key={item.id} className="border-t border-gray-200  py-3">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-gray-200 rounded mr-4"></div>
          <div className="flex-1">
            <a href="#" className="text-xl hover:underline text-gray-900">
              {item.name}
            </a>
          </div>
          <div className="w-24 text-center">
            <div className="text-gray-900 ">{item.amount}</div>
          </div>
          <div className="flex justify-center items-center w-32">
            <span
              className={`px-4 py-1 rounded-full text-center text-sm ${isInStock
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
  });

  return (
    <div className="flex h-screen bg-gray-50">

      {/* Main Content */}

      <div className="flex-1 p-4 ">
        {/* Main Menu Title and Quick Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-1 h-8 bg-green-600 mr-2"></div>
            <h2 className="text-xl font-bold text-black">
              Main Menu
            </h2>
          </div>
          {/* Quick POS Access */}
          <button
            onClick={() => navigate('/pos')}
            className="bg-green-600 hover:bg-green-700  text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>เปิดขาย (POS)</span>
          </button>
        </div>
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Revenue Forecast</h3>
                <div className="flex items-center space-x-3">
                  {isLoading && (
                    <span className="text-sm text-blue-600">Loading forecast...</span>
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
                  >
                    {forecastOptions.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>

                  {/* Forecast Model Dropdown */}
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
              <div className="mb-3 text-sm text-gray-600">
                {forecastOptions.find(option => option.id === selectedModel)?.description}
              </div>

              <Link to="/RevenueDetail">
                <div className="cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex justify-center">
                    <LineChart width={600} height={250} data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [
                          `$${value?.toLocaleString() || 0}`,
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
                        name="Historical Revenue"
                        dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                      />
                      {/* Forecast Revenue Line */}
                      <Line
                        type="monotone"
                        dataKey="forecast"
                        stroke="#dc2626"
                        strokeWidth={3}
                        strokeDasharray="5 5"
                        name="Forecast Revenue"
                        dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Trend Pie Chart */}
          <div className="bg-white p-4 rounded-lg shadow ">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Trend</h3>
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
            <div className="bg-white p-5 rounded-lg shadow flex-1 flex flex-col">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Amount Sales</h3>
              <div className="text-4xl font-bold text-center text-gray-900">200</div>
              <div className="flex items-center justify-center text-green-500 mt-2">
                <span>+2.00</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg shadow flex-1 flex flex-col ">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Total Sales</h3>
              <div className="text-4xl font-bold text-center text-gray-900">70,000</div>
              <div className="flex items-center justify-center text-green-500 mt-2">
                <span>+2.00</span>
              </div>
            </div>
          </div>

          {/* Right Column - Inventory Stats */}
          <div className="flex flex-col gap-4 h-full">
            <div className="bg-white p-5 rounded-lg shadow flex-1 flex flex-col ">
              <h3 className="text-lg font-semibold mb-1 text-gray-900">
                Total Items in stock
              </h3>
              <div className="text-4xl font-bold text-center text-gray-900">1,500</div>
            </div>

            <div className="bg-white p-5 rounded-lg shadow flex-1 flex flex-col">
              <h3 className="text-lg font-semibold mb-1 text-gray-900">Total Items sales</h3>
              <div className="text-4xl font-bold text-center text-gray-900">10,000</div>
            </div>

            <div className="bg-white p-5 rounded-lg shadow flex-1 flex flex-col ">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Profit</h3>
              <div className="text-4xl font-bold text-center text-gray-900">50,000</div>
            </div>
          </div>
        </div>

        {/* Inventory Shortage Section */}
        <div className="bg-white p-4 rounded-lg shadow mt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Inventory Shortage</h3>
          <div>
            <div className="flex font-semibold py-3 border-b border-gray-200 text-gray-900">
              <div className="flex-1">Product Name</div>
              <div className="w-24 text-center">Amount</div>
              <div className="w-32 text-center">Status</div>
            </div>
            {inventoryData.map((item) => renderInventoryItem(item))}
          </div>
        </div>
      </div>
    </div>
  );
}
