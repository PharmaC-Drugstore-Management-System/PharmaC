import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaFire, FaRegCalendarAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface RevenueItem {
  id: number;
  name: string;
  productId: string;
  price: number;
  amount: number;
  totalSale: number;
  status: string;
  rank: number;
}

const revenueDetailData: Omit<RevenueItem, 'rank'>[] = [
  { id: 1, name: 'Amoxicillin', productId: 'A001', price: 10, amount: 100, totalSale: 1000, status: 'Stock' },
  { id: 2, name: 'Ibuprofen', productId: 'I001', price: 12, amount: 100, totalSale: 1200, status: 'Running out' },
  { id: 3, name: 'Paracetamol', productId: 'P001', price: 8, amount: 100, totalSale: 800, status: 'Instock' },
  { id: 4, name: 'Benzonatate', productId: 'B001', price: 5, amount: 20, totalSale: 100, status: 'Instock' }
];

// Sort products by totalSale to calculate rank
const rankedData: RevenueItem[] = [...revenueDetailData]
  .sort((a, b) => b.totalSale - a.totalSale)
  .map((item, index) => ({
    ...item,
    rank: index + 1
  }));

const revenueChartData = [
  { name: 'Jan', actual: 26000, projected: 25000 },
  { name: 'Feb', actual: 27000, projected: 26500 },
  { name: 'Mar', actual: 28000, projected: 27500 },
  { name: 'Apr', actual: 22000, projected: 25500 },
  { name: 'May', actual: 30000, projected: 28500 },
  { name: 'Jun', actual: 32000, projected: 29500 }
];

export default function RevenueDetail() {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    new Date('2025-05-01'),
    new Date('2025-05-31')
  ]);
  const [startDate, endDate] = dateRange;

  const navigate = useNavigate();

  const checkme = async () => {
    try {
      const authme = await fetch('http://localhost:5000/api/me', {
        method: 'GET',
        credentials: 'include'
      });
      const data = await authme.json();
      if (authme.status === 401) {
        navigate('/login');
        return;
      }

      console.log('Authme data:', data);
    } catch (error) {
      console.log('Error', error);
    }
  };

  useEffect(() => {
    checkme();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderRevenueRow = (item: RevenueItem) => {
    const rankColor =
      item.rank <= 3 ? 'bg-orange-100 text-orange-800' : 'bg-gray-200 text-gray-700';

    return (
      <div key={item.id} className="border-t border-gray-200 py-3">
        <div className="flex items-center text-sm">
          {/* Rank */}
          <div className="w-24 text-center">
            <span className={`inline-flex items-center px-2 py-1 rounded-full font-medium ${rankColor}`}>
              {item.rank <= 3 && <FaFire className="mr-1 text-orange-500" />}
              {item.rank}
            </span>
          </div>

          {/* Product Name */}
          <div className="flex-1">
            <a href="#" className="text-xl hover:underline">
              {item.name}
            </a>
          </div>

          {/* Product ID */}
          <div className="w-24 text-center">{item.productId}</div>

          {/* Price */}
          <div className="w-24 text-center">{item.price} THB</div>

          {/* Amount */}
          <div className="w-24 text-center">{item.amount}</div>

          {/* Total Sale */}
          <div className="w-24 text-center">{item.totalSale.toLocaleString()} THB</div>

          {/* Status */}
          <div className="w-32 text-center">
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                item.status === 'Instock'
                  ? 'bg-green-100 text-green-800'
                  : item.status === 'Running out'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
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
    <div className="p-4">
      {/* Revenue Chart */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h3 className="text-lg font-semibold mb-4">Revenue</h3>

        {/* Stylized Date Range Picker */}
        <div className="flex justify-between items-center mb-4">
          <div className="inline-flex items-center px-4 py-2 bg-white shadow rounded-full border border-gray-200">
            <span className="text-sm mr-2">
              {startDate?.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              }) || 'Start'}{' '}
              -{' '}
              {endDate?.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              }) || 'End'}
            </span>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update)}
              isClearable={false}
              customInput={
                <button className="text-gray-600 ml-2">
                  <FaRegCalendarAlt className="w-4 h-4" />
                </button>
              }
            />
          </div>
        </div>

        <div className="flex justify-center">
          <LineChart width={600} height={250} data={revenueChartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="projected" stroke="#8884d8" strokeWidth={2} />
            <Line type="monotone" dataKey="actual" stroke="#82ca9d" strokeWidth={2} />
          </LineChart>
        </div>
      </div>

      {/* Revenue Detail Table */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Revenue Detail</h3>
        <div className="flex font-semibold text-sm py-3 border-b border-gray-300">
          <div className="w-24 text-center">Rank</div>
          <div className="flex-1 text-left">Product Name</div>
          <div className="w-24 text-center">Product ID</div>
          <div className="w-24 text-center">Price</div>
          <div className="w-24 text-center">Amount</div>
          <div className="w-24 text-center">Total Sale</div>
          <div className="w-32 text-center">Status</div>
        </div>
        {rankedData.map(item => renderRevenueRow(item))}
      </div>
    </div>
  );
}
