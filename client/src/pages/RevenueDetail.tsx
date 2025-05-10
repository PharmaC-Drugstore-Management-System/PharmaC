import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const revenueDetailData = [
  { id: 1, name: 'Amoxicillin', totalSale: '1,000 THB', status: 'Stock' },
  { id: 2, name: 'Ibuprofen', totalSale: '1,200 THB', status: 'Running out' },
  { id: 3, name: 'Paracetamol', totalSale: '800 THB', status: 'Instock' },
  { id: 4, name: 'Benzonatate', totalSale: '100 THB', status: 'Instock' }
];

const revenueChartData = [
  { name: 'Jan', actual: 26000, projected: 25000 },
  { name: 'Feb', actual: 27000, projected: 26500 },
  { name: 'Mar', actual: 28000, projected: 27500 },
  { name: 'Apr', actual: 22000, projected: 25500 },
  { name: 'May', actual: 30000, projected: 28500 },
  { name: 'Jun', actual: 32000, projected: 29500 }
];

const renderRevenueRow = (item) => {
  return (
    <div key={item.id} className="border-t border-gray-200 py-3">
      <div className="flex items-center">
        <div className="w-16 h-16 bg-gray-200 rounded mr-4" />
        <div className="flex-1">
          <div className="text-xl">{item.name}</div>
        </div>
        {/* Center align totalSale text with consistent width */}
        <div className="w-24 text-center">{item.totalSale}</div>
        <div className="w-32 text-center">
          <span className={`px-3 py-1 rounded-full text-sm ${
            item.status === 'Instock' ? 'bg-green-100 text-green-800' :
            item.status === 'Running out' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {item.status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function RevenueDetail() {
  return (
    <div className="p-4">
      {/* Revenue Chart */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
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
        {/* Column headers */}
        <div className="flex font-semibold py-3">
          <div className="flex-1 text-left">Product Name</div>
          {/* Make the totalSale and Status columns centered */}
          <div className="w-24 text-center">Total Sale</div>
          <div className="w-32 text-center">Status</div>
        </div>
        {revenueDetailData.map(item => renderRevenueRow(item))}
      </div>
    </div>
  );
}
