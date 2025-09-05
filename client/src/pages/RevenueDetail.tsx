import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Types
type ChartDataPoint = {
  name: string;
  actual?: number;
  forecast?: number;
};

type EvaluationMetric = {
  name: string;
  value: number;
  description: string;
};

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

export default function RevenueDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [forecastChartData, setForecastChartData] = useState<ChartDataPoint[]>([]);
  const [filteredChartData, setFilteredChartData] = useState<ChartDataPoint[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('medium_term');
  const [selectedForecastModel, setSelectedForecastModel] = useState<string>('arima');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [evaluationMetrics, setEvaluationMetrics] = useState<EvaluationMetric[]>([]);
  
  // Date range states
  const [startDate, setStartDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), 0, 1); // January 1st of current year
  });
  const [endDate, setEndDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), 11, 31); // December 31st of current year
  });
  const [dateRangePreset, setDateRangePreset] = useState<string>('current_year');

  // Forecast Models
  const forecastModels: ForecastModel[] = [
    { id: 'arima', name: 'ARIMA', model: 'ARIMA' },
    { id: 'sarima', name: 'SARIMA', model: 'SARIMA' }
  ];

  // Forecast Options
  const forecastOptions: ForecastOption[] = [
    { id: 'short_term', name: 'Short Term (3 months)', forecastPeriods: 3, testSizeMonths: 12, description: 'Quick forecast for immediate planning' },
    { id: 'medium_term', name: 'Medium Term (6 months)', forecastPeriods: 6, testSizeMonths: 12, description: 'Balanced forecast for quarterly planning' },
    { id: 'long_term', name: 'Long Term (12 months)', forecastPeriods: 12, testSizeMonths: 12, description: 'Extended forecast for annual planning' }
  ];

  // Date range preset options
  const dateRangePresets = [
    { id: 'current_year', name: 'Current Year (2025)', value: 'current_year' },
    { id: 'last_12_months', name: 'Last 12 Months', value: 'last_12_months' },
    { id: 'last_6_months', name: 'Last 6 Months', value: 'last_6_months' },
    { id: 'last_3_months', name: 'Last 3 Months', value: 'last_3_months' },
    { id: 'all_time', name: 'All Time', value: 'all_time' },
    { id: 'custom', name: 'Custom Range', value: 'custom' }
  ];

  // Filter data based on date range
  const filterDataByDateRange = (data: ChartDataPoint[]) => {
    return data.filter(item => {
      // Parse the date from the "Mon YYYY" format
      const itemDate = new Date(item.name + " 01"); // Add day to make it a valid date
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  // Handle date range preset changes
  const handleDateRangePresetChange = (preset: string) => {
    setDateRangePreset(preset);
    const now = new Date();
    
    switch (preset) {
      case 'current_year':
        setStartDate(new Date(now.getFullYear(), 0, 1));
        setEndDate(new Date(now.getFullYear(), 11, 31));
        break;
      case 'last_12_months':
        setStartDate(new Date(now.getFullYear() - 1, now.getMonth(), 1));
        setEndDate(now);
        break;
      case 'last_6_months':
        setStartDate(new Date(now.getFullYear(), now.getMonth() - 6, 1));
        setEndDate(now);
        break;
      case 'last_3_months':
        setStartDate(new Date(now.getFullYear(), now.getMonth() - 3, 1));
        setEndDate(now);
        break;
      case 'all_time':
        setStartDate(new Date(2020, 0, 1));
        setEndDate(new Date(2030, 11, 31));
        break;
      case 'custom':
        // Don't change dates, let user pick manually
        break;
    }
  };

  // Update filtered data when chart data or date range changes
  useEffect(() => {
    const filtered = filterDataByDateRange(forecastChartData);
    setFilteredChartData(filtered);
  }, [forecastChartData, startDate, endDate]);

  // Check authentication
  const checkme = async () => {
    try {
      const authme = await fetch(`${API_URL}/api/me`, { method: 'GET', credentials: 'include' });
      const data = await authme.json();
      if (authme.status === 401 || authme.status === 403) {
        navigate('/login');
        return;
      }
      console.log('Authme data:', data);
    } catch (error) {
      console.log('Error', error);
    }
  };

  // Forecast function
  const forecastMonthly = async (modelId?: string, forecastModelId?: string) => {
    try {
      setIsLoading(true);

      const currentOptions = forecastOptions.find(model => model.id === (modelId || selectedModel));
      if (!currentOptions) return;

      const modelToSend = forecastModelId || selectedForecastModel;

      console.log(`Running forecast with ${currentOptions.name} using model ${modelToSend.toUpperCase()}`);

      const info = await fetch(`${API_URL}/arima/forecast`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          forecastPeriods: currentOptions.forecastPeriods,
          testSizeMonths: currentOptions.testSizeMonths,
          model_type: modelToSend.toUpperCase()
        })
      });

      const data = await info.json();
      console.log('Forecast data:', data);

      if (data.historical && data.forecast) {
        const combinedData: ChartDataPoint[] = [];

        // Handle evaluation metrics
        if (data.evaluation_metrics) {
          const processedMetrics: EvaluationMetric[] = [];
          if (typeof data.evaluation_metrics === 'object') {
            Object.entries(data.evaluation_metrics).forEach(([key, value]) => {
              if (typeof value === 'number' && key !== 'message') {
                const descriptions: { [key: string]: string } = {
                  MAE: "Mean Absolute Error",
                  MSE: "Mean Squared Error",
                  RMSE: "Root Mean Square Error",
                  MAPE: "Mean Absolute Percentage Error",
                };
                processedMetrics.push({ name: key, value, description: descriptions[key] || key });
              }
            });
          }
          setEvaluationMetrics(processedMetrics);
        }

        // Historical data
        data.historical.forEach((item: any) => {
          const date = new Date(item.date);
          const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          combinedData.push({ name: monthYear, actual: Math.round(item.revenue) });
        });

        // Forecast data
        data.forecast.forEach((item: any) => {
          const date = new Date(item.date);
          const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          combinedData.push({ name: monthYear, forecast: Math.round(item.revenue) });
        });

        setForecastChartData(combinedData);
      }
    } catch (error) {
      console.error('Error fetching forecast data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers
  const handleModelChange = async (modelId: string) => {
    setSelectedModel(modelId);
    await forecastMonthly(modelId);
  };

  const handleForecastModelChange = async (modelId: string) => {
    setSelectedForecastModel(modelId);
    await forecastMonthly(selectedModel, modelId);
  };

  // Overall evaluation logic
  const overallEvaluation = () => {
    if (evaluationMetrics.length === 0) return "No Data";

    const thresholds: Record<string, number> = { MAE: 1000, RMSE: 1000, MAPE: 20 };
    let goodCount = 0;
    let totalCount = 0;

    evaluationMetrics.forEach(metric => {
      const threshold = thresholds[metric.name];
      if (threshold !== undefined) {
        totalCount++;
        if (metric.value < threshold) goodCount++;
      }
    });

    if (totalCount === 0) return "No Data";
    return goodCount / totalCount >= 0.5 ? "Good" : "Bad";
  };

  // Load initial data
  useEffect(() => { checkme(); }, []); // Check auth
  useEffect(() => { forecastMonthly(); }, []); // Initial forecast

  return (
    <div className="p-4">
      {/* Forecast Card */}
      <div className="bg-white p-4 rounded-xl shadow border-1 border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Forecast</h3>
          <div className="flex items-center space-x-3">
            {isLoading && <span className="text-sm text-blue-600">Loading forecast...</span>}

            {/* Forecast Options */}
            <select
              value={selectedModel}
              onChange={(e) => handleModelChange(e.target.value)}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition hover:shadow-md"
            >
              {forecastOptions.map((model) => (<option key={model.id} value={model.id}>{model.name}</option>))}
            </select>

            {/* Forecast Model */}
            <select
              value={selectedForecastModel}
              onChange={(e) => handleForecastModelChange(e.target.value)}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition hover:shadow-md"
            >
              {forecastModels.map((model) => (<option key={model.id} value={model.id}>{model.name}</option>))}
            </select>
          </div>
        </div>

        {/* Model Description */}
        <div className="mb-3 text-sm text-gray-600">
          {forecastOptions.find(option => option.id === selectedModel)?.description}
        </div>

        {/* Line Chart */}
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
            <Tooltip formatter={(value, name) => [`${value?.toLocaleString() || 0} ฿`, name === 'actual' ? 'Historical Revenue' : 'Forecast Revenue']} />
            <Legend />
            <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={3} name="Historical Revenue" dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }} />
            <Line type="monotone" dataKey="forecast" stroke="#dc2626" strokeWidth={3} strokeDasharray="5 5" name="Forecast Revenue" dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }} />
          </LineChart>
        </div>

        {/* Date Range Controls */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Date Range Filter</h4>
          <div className="flex flex-wrap items-center gap-3">
            {/* Preset Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Quick Select:</label>
              <select
                value={dateRangePreset}
                onChange={(e) => handleDateRangePresetChange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {dateRangePresets.map((preset) => (
                  <option key={preset.id} value={preset.value}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Date Pickers (only show if custom is selected) */}
            {dateRangePreset === 'custom' && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">From:</label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date: Date | null) => date && setStartDate(date)}
                    dateFormat="MMM yyyy"
                    showMonthYearPicker
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">To:</label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date: Date | null) => date && setEndDate(date)}
                    dateFormat="MMM yyyy"
                    showMonthYearPicker
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Data Count Info */}
            <div className="text-sm text-gray-500">
              Showing {filteredChartData.length} data points
            </div>
          </div>
        </div>
      </div>

      {/* Evaluation Metrics */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6 rounded-2xl bg-white shadow-md mt-6 ">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">Evaluation Metrics</h1>
            <p className="text-sm text-gray-600">Model performance overview</p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="animate-pulse bg-gray-200 px-3 py-1 rounded-full">
              <p className="text-lg font-medium text-gray-400">Loading...</p>
            </div>
          ) : overallEvaluation() === "Good" ? (
            <div className='bg-green-100 px-3 py-1 rounded-[100px] border-2 border-green-500'>
              <p className="text-lg font-medium text-green-600">Good</p>
            </div>
          ) : overallEvaluation() === "No Data" ? (
            <div className='bg-gray-100 px-3 py-1 rounded-[100px] border-2 border-gray-400'>
              <p className="text-lg font-medium text-gray-600">No Data</p>
            </div>
          ) : (
            <div className='bg-red-100 px-3 py-1 rounded-[100px] border-2 border-red-500'>
              <p className="text-lg font-medium text-red-600">Bad</p>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="p-6 bg-white rounded-2xl shadow animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-10 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))
        ) : evaluationMetrics.length > 0 ? (
          evaluationMetrics.map((metric) => (
            <div key={metric.name} className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition border-1 border-gray-100">
              <h2 className="text-xl font-bold text-gray-700">{metric.name}</h2>
              <p className="mt-2 text-3xl font-semibold text-pink-500">
                {metric.name === 'MAPE' ? `${metric.value.toFixed(2)}%` : metric.value.toLocaleString()}
              </p>
              <p className="mt-2 text-sm text-gray-500">{metric.description}</p>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No evaluation metrics available.</p>
            <p className="text-sm text-gray-400 mt-1">Run a forecast to see model performance metrics.</p>
          </div>
        )}
      </div>
    </div>
  );
}
