import { useState } from 'react';
import { Search, Plus, Edit2, ChevronDown} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PharmacInventoryPage() {
  const [items] = useState([
    {
      id: 1,
      name: 'Item 1',
      brand: 'Pfizer',
      price: 39,
      expiredDate: '10/09/2029',
      lotId: '000001'
    },
    { id: 2, name: 'Item 2', brand: '-', price: '-', expiredDate: '-', lotId: '-' },
    { id: 3, name: 'Item 3', brand: '-', price: '-', expiredDate: '-', lotId: '-' },
    { id: 4, name: 'Item 4', brand: '-', price: '-', expiredDate: '-', lotId: '-' },
    { id: 5, name: 'Item 5', brand: 'Moderna', price: 45, expiredDate: '05/12/2028', lotId: '000002' },
    { id: 6, name: 'Item 6', brand: 'Johnson & Johnson', price: 28, expiredDate: '01/15/2030', lotId: '000003' },
    { id: 7, name: 'Item 7', brand: 'AstraZeneca', price: 32, expiredDate: '07/22/2029', lotId: '000004' },
    { id: 8, name: 'Item 8', brand: 'Merck', price: 41, expiredDate: '03/18/2030', lotId: '000005' },
  ]);

  return (
    <>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-hidden flex flex-col">
          {/* Inventory Title with green bar */}
          <div className="flex items-center mb-6">
            <div className="w-1 h-8 bg-green-600 mr-2"></div>
            <h2 className="text-xl font-bold texts-600" style={{color:"black"}}>Inventory</h2>
          </div>

          {/* Filter and Search bar */}
          <div className="bg-white rounded-lg shadow-sm mb-6 p-4 flex items-center">
            <div className="flex items-center text-gray-600 mr-4">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              <span>Sort by date</span>
              <ChevronDown className="h-4 w-4 ml-1 text-green-600" />
            </div>
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>  
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col">
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-4 px-6 py-4 bg-gray-100 border-b border-gray-200">
              <div className="font-medium text-gray-700">Name</div>
              <div className="font-medium text-gray-700">Brand</div>
              <div className="font-medium text-gray-700">Price (THB)</div>
              <div className="font-medium text-gray-700">Expired date</div>
              <div className="font-medium text-gray-700 flex items-center">
                <span>Lot id</span>
                <Edit2 className="h-5 w-5 ml-auto text-gray-500" />
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200 overflow-y-auto flex-1">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-5 gap-4 px-6 py-4 hover:bg-gray-50">
                  <div className="text-gray-700">{item.name}</div>
                  <div className="text-gray-700">{item.brand}</div>
                  <div className="text-gray-700">{item.price}</div>
                  <div className="text-gray-700">{item.expiredDate}</div>
                  <div className="text-gray-700">{item.lotId}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Item Button */}
          <Link className="flex justify-start mt-6"  to="/add-medicine">
            <button className="ml-2 px-2 py-2 bg-green-600 text-white rounded-full shadow-md hover:bg-green-700 flex items-center">
              <Plus className="h-5 w-5" />
            </button>
          </Link>
        </div>
    </>
  );
}