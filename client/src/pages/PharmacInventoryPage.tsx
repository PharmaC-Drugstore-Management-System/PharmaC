import { useState } from 'react';
import { Search, Plus, Edit2, ChevronDown, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PharmacInventoryPage() {
  const [items, setItems] = useState([
    { id: 1, name: 'Item 1', brand: 'Pfizer', price: 39, expiredDate: '10/09/2029', lotId: '000001' },
    { id: 2, name: 'Item 2', brand: '-', price: '-', expiredDate: '-', lotId: '-' },
    { id: 3, name: 'Item 3', brand: '-', price: '-', expiredDate: '-', lotId: '-' },
    { id: 4, name: 'Item 4', brand: '-', price: '-', expiredDate: '-', lotId: '-' },
    { id: 5, name: 'Item 5', brand: 'Moderna', price: 45, expiredDate: '05/12/2028', lotId: '000002' },
    { id: 6, name: 'Item 6', brand: 'Johnson & Johnson', price: 28, expiredDate: '01/15/2030', lotId: '000003' },
    { id: 7, name: 'Item 7', brand: 'AstraZeneca', price: 32, expiredDate: '07/22/2029', lotId: '000004' },
    { id: 8, name: 'Item 8', brand: 'Merck', price: 41, expiredDate: '03/18/2030', lotId: '000005' },
  ]);

  const [editMode, setEditMode] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);

  const handleInputChange = (id, field, value) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleRowSelect = (id) => {
    setSelectedItemId(id);
  };

  const handleDeleteItem = () => {
    if (selectedItemId !== null) {
      setItems((prevItems) => prevItems.filter((item) => item.id !== selectedItemId));
      // Reset state after delete
      setSelectedItemId(null);
      setEditMode(false);
    }
  };

  return (
    <>
      <div className="flex-1 p-6 overflow-hidden flex flex-col">
        {/* Inventory Title */}
        <div className="flex items-center mb-6">
          <div className="w-1 h-8 bg-green-600 mr-2"></div>
          <h2 className="text-xl font-bold" style={{ color: 'black' }}>Inventory</h2>
        </div>

        {/* Filter and Search bar */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-4 flex items-center">
          <div className="flex items-center text-gray-600 mr-4 cursor-pointer">
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
            <div className="font-medium text-gray-700 flex items-center">
              <span>Name</span>
            </div>
            <div className="font-medium text-gray-700">Brand</div>
            <div className="font-medium text-gray-700">Price (THB)</div>
            <div className="font-medium text-gray-700">Expired date</div>
            <div className="font-medium text-gray-700 flex items-center">
              <span>Lot id</span>
              <Edit2
                onClick={() => {
                  setEditMode(!editMode);
                  setSelectedItemId(null);
                }}
                className="h-5 w-5 ml-auto text-gray-500 cursor-pointer transition-transform duration-300 hover:scale-125"
              />
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200 overflow-y-auto flex-1">
            {items.map((item) => {
              const isSelected = selectedItemId === item.id;
              const isDimmed = editMode && selectedItemId !== null && !isSelected;

              return (
                <div
                  key={item.id}
                  className={`grid grid-cols-5 gap-4 px-6 py-4 hover:bg-gray-50 transition-all duration-300 ${
                    isDimmed ? 'opacity-50' : 'opacity-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {editMode && (
                      <input
                        type="radio"
                        name="selectedItem"
                        checked={isSelected}
                        onChange={() => handleRowSelect(item.id)}
                        className="h-4 w-4 text-green-600"
                      />
                    )}

                    {isSelected ? (
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleInputChange(item.id, 'name', e.target.value)}
                        className="border p-1 rounded"
                      />
                    ) : (
                      <div className="text-gray-700">{item.name}</div>
                    )}
                  </div>

                  {isSelected ? (
                    <>
                      <input
                        type="text"
                        value={item.brand}
                        onChange={(e) => handleInputChange(item.id, 'brand', e.target.value)}
                        className="border p-1 rounded"
                      />
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleInputChange(item.id, 'price', e.target.value)}
                        className="border p-1 rounded"
                      />
                      <input
                        type="text"
                        value={item.expiredDate}
                        onChange={(e) => handleInputChange(item.id, 'expiredDate', e.target.value)}
                        className="border p-1 rounded"
                      />
                      <input
                        type="text"
                        value={item.lotId}
                        onChange={(e) => handleInputChange(item.id, 'lotId', e.target.value)}
                        className="border p-1 rounded"
                      />
                    </>
                  ) : (
                    <>
                      <div className="text-gray-700">{item.brand}</div>
                      <div className="text-gray-700">{item.price}</div>
                      <div className="text-gray-700">{item.expiredDate}</div>
                      <div className="text-gray-700">{item.lotId}</div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Button */}
        <div className="flex justify-start mt-6">
          {editMode ? (
            <button
              onClick={handleDeleteItem}
              className={`ml-2 px-3 py-2 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 flex items-center transition-all duration-500 transform ${
                selectedItemId ? 'scale-100 opacity-100' : 'scale-90 opacity-50 cursor-not-allowed'
              }`}
              disabled={!selectedItemId}
            >
              <X className="h-7 w-5" />
            </button>
          ) : (
            <Link to="/add-medicine" className="transition-all duration-500 transform scale-100">
              <button className="ml-2 px-3 py-2 bg-green-600 text-white rounded-full shadow-md hover:bg-green-700 flex items-center">
                <Plus className="h-7 w-5" />
              </button>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
