import { useEffect } from "react";
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
} from "recharts";

export default function PharmaDashboard() {
  // Sample data for the charts
  const navigate = useNavigate();
  const revenueChartData = [
    { name: "Jan", actual: 26000, projected: 25000 },
    { name: "Feb", actual: 27000, projected: 26500 },
    { name: "Mar", actual: 28000, projected: 27500 },
    { name: "Apr", actual: 22000, projected: 25500 },
    { name: "May", actual: 30000, projected: 28500 },
    { name: "Jun", actual: 32000, projected: 29500 },
  ];

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
      <div key={item.id} className="border-t border-gray-200 py-3">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-gray-200 rounded mr-4"></div>
          <div className="flex-1">
            <a href="#" className="text-xl hover:underline">
              {item.name}
            </a>
          </div>
          <div className="w-24 text-center">
            <div>{item.amount}</div>
          </div>
          <div className="flex justify-center items-center w-32">
            <span
              className={`px-4 py-1 rounded-full text-center text-sm ${isInStock
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
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

      <div className="flex-1 p-4 overflow-y-auto">
        {/* Inventory Title */}
        <div className="flex items-center mb-6">
          <div className="w-1 h-8 bg-green-600 mr-2"></div>
          <h2 className="text-xl font-bold" style={{ color: "black" }}>
            Main Menu
          </h2>
        </div>
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Chart */}
          <div className="lg:col-span-2">
            <Link to="/RevenueDetail">
              <div className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold mb-4">Revenue</h3>
                <div className="flex justify-center">
                  <LineChart width={600} height={250} data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="projected"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                  </LineChart>
                </div>
              </div>
            </Link>
          </div>

          {/* Trend Pie Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Trend</h3>
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
              <h3 className="text-lg font-semibold mb-2">Amount Sales</h3>
              <div className="text-4xl font-bold text-center">200</div>
              <div className="flex items-center justify-center text-green-500 mt-2">
                <span>+2.00</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg shadow flex-1 flex flex-col">
              <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
              <div className="text-4xl font-bold text-center">70,000</div>
              <div className="flex items-center justify-center text-green-500 mt-2">
                <span>+2.00</span>
              </div>
            </div>
          </div>

          {/* Right Column - Inventory Stats */}
          <div className="flex flex-col gap-4 h-full">
            <div className="bg-white p-5 rounded-lg shadow flex-1 flex flex-col">
              <h3 className="text-lg font-semibold mb-1">
                Total Items in stock
              </h3>
              <div className="text-4xl font-bold text-center">1,500</div>
            </div>

            <div className="bg-white p-5 rounded-lg shadow flex-1 flex flex-col">
              <h3 className="text-lg font-semibold mb-1">Total Items sales</h3>
              <div className="text-4xl font-bold text-center">10,000</div>
            </div>

            <div className="bg-white p-5 rounded-lg shadow flex-1 flex flex-col">
              <h3 className="text-lg font-semibold mb-2">Profit</h3>
              <div className="text-4xl font-bold text-center">50,000</div>
            </div>
          </div>
        </div>

        {/* Inventory Shortage Section */}
        <div className="bg-white p-4 rounded-lg shadow mt-6">
          <h3 className="text-lg font-semibold mb-4">Inventory Shortage</h3>
          <div>
            <div className="flex font-semibold py-3 border-b border-gray-200">
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
