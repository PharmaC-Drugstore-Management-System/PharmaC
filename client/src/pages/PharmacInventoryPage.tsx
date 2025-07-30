import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  ChevronDown,
  X,
  CheckCircle,
  AlertTriangle,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function PharmacInventoryPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([
    {
      id: 1,
      name: "Para",
      brand: "Siam",
      price: 39,
      expiredDate: "2025-12-17T00:00:00Z",
      lotId: "000001",
      amount: 10,
    },
    {
      id: 2,
      name: "Vitamin C",
      brand: "Siam",
      price: 0,
      expiredDate: "-",
      lotId: "-",
      amount: 0,
    },
    {
      id: 3,
      name: "POP",
      brand: "Siam",
      price: 0,
      expiredDate: "-",
      lotId: "-",
      amount: 0,
    },
    {
      id: 4,
      name: "Aspirin",
      brand: "-",
      price: 300,
      expiredDate: "-",
      lotId: "-",
      amount: 50,
    },
    {
      id: 5,
      name: "Moderna",
      brand: "Argentina",
      price: 45,
      expiredDate: "2025-08-17T00:00:00Z",
      lotId: "000002",
      amount: 100,
    },
  ]);

  const [editMode, setEditMode] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);

  const handleInputChange = (id: any, field: any, value: any) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleRowSelect = (id: any) => {
    setSelectedItemId(id);
  };

  const handleDeleteItem = () => {
    if (selectedItemId !== null) {
      setItems((prevItems) =>
        prevItems.filter((item) => item.id !== selectedItemId)
      );
      // Reset state after delete
      setSelectedItemId(null);
      setEditMode(false);
    }
  };

  const getAmountStatus = (amount: any) => {
    if (amount < 50) return "text-red-600";
    if (amount < 100) return "text-yellow-600";
    return "text-green-600";
  };

  const lowStockItems = items.filter((item) => item.amount <= 10);

  // For filtering
  const isExpiringSoon = (dateStr: string): boolean => {
    if (!dateStr || dateStr === "-") return false;

    const expireDate = new Date(dateStr);
    const today = new Date();
    expireDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffDays =
      (expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 180;
  };

  // For styling
  const getExpirationClass = (dateStr: string): string => {
    if (!dateStr || dateStr === "-") return "";
    const expireDate = new Date(dateStr);
    const today = new Date();
    expireDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return "";
  };

  const expireSoonItems = items.filter((item) =>
    isExpiringSoon(item.expiredDate)
  );

    const checkme = async () => {
      try {
        const authme = await fetch('http://localhost:5000/api/me', {
          method: 'GET',
          credentials: 'include'
        })
        const data = await authme.json();
        if (authme.status === 401) {
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

  return (
    <>
      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        {/* Inventory Title */}
        <div className="flex items-center mb-6">
          <div className="w-1 h-8 bg-green-600 mr-2"></div>
          <h2 className="text-xl font-bold" style={{ color: "black" }}>
            Inventory
          </h2>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Medicines */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between max-h-[100px] w-full">
            <div className="flex items-center w-full">
              <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">
                  Total Medicines
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {items.length}
                </p>
              </div>
            </div>
          </div>

          {/* Low Stock */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between max-h-[100px]">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {lowStockItems.length}
                </p>
              </div>
            </div>
          </div>

          {/* Expire Soon */}
          <div
            onClick={() => navigate("/expiry-monitor")}
            className={`p-6 rounded-lg shadow-md border cursor-pointer transition-all duration-300 transform max-h-[100px] ${
              expireSoonItems.length > 0
                ? "bg-gradient-to-r from-orange-500 to-red-500 border-orange-200 hover:shadow-lg hover:scale-[1.02]"
                : "bg-white border-gray-200 hover:shadow-md"
            }`}
          >
            <div className="flex justify-between items-start">
              {/* Left side: Icon + text */}
              <div className="flex items-center">
                <Clock
                  className={`w-10 h-10 ${
                    expireSoonItems.length > 0
                      ? "text-white animate-pulse"
                      : "text-gray-400"
                  }`}
                />
                <div className="ml-4">
                  <p
                    className={`text-sm font-medium ${
                      expireSoonItems.length > 0
                        ? "text-orange-100"
                        : "text-gray-500"
                    }`}
                  >
                    Expire Soon
                  </p>
                  <p
                    className={`text-3xl font-bold ${
                      expireSoonItems.length > 0
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  >
                    {expireSoonItems.length}
                  </p>
                </div>
              </div>

              {/* Right side: Status & action */}
              <div className="text-right mt-5">
                {expireSoonItems.length > 0 ? (
                  <>
                    <div className="text-sm font-medium text-white flex items-center justify-end">
                      Click to Manage
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-xs text-gray-400 mb-1">All good</div>
                    <div className="text-sm font-medium text-gray-600 flex items-center justify-end">
                      View
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col">
          {/* Filter and Search bar */}
          <div className="bg-white rounded-lg  mb-2 p-4 flex items-center">
            <div className="flex items-center text-gray-600 mr-4 cursor-pointer">
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                />
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
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-gray-100 border-b border-gray-200">
            <div className="font-medium text-gray-700 flex items-center">
              <span>Name</span>
            </div>
            <div className="font-medium text-gray-700">Brand</div>
            <div className="font-medium text-gray-700">Price (THB)</div>
            <div className="font-semibold">Stock</div>
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
              const isDimmed =
                editMode && selectedItemId !== null && !isSelected;

              return (
                <div
                  key={item.id}
                  className={`grid grid-cols-6 gap-4 px-6 py-4 hover:bg-gray-50 transition-all duration-300 ${
                    isDimmed ? "opacity-50" : "opacity-100"
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
                        onChange={(e) =>
                          handleInputChange(item.id, "name", e.target.value)
                        }
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
                        onChange={(e) =>
                          handleInputChange(item.id, "brand", e.target.value)
                        }
                        className="border p-1 rounded "
                      />
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) =>
                          handleInputChange(item.id, "price", e.target.value)
                        }
                        className="border p-1 rounded"
                      />
                      <input
                        type="text"
                        value={item.expiredDate}
                        onChange={(e) =>
                          handleInputChange(
                            item.id,
                            "expiredDate",
                            e.target.value
                          )
                        }
                        className="border p-1 rounded"
                      />
                      <input
                        type="text"
                        value={item.lotId}
                        onChange={(e) =>
                          handleInputChange(item.id, "lotId", e.target.value)
                        }
                        className="border p-1 rounded"
                      />
                    </>
                  ) : (
                    <>
                      <div className="text-gray-700">{item.brand}</div>
                      <div className="text-gray-700">{item.price}</div>
                      <div
                        className={`font-semibold ${getAmountStatus(
                          item.amount
                        )}`}
                      >
                        {item.amount}
                      </div>
                      <div className={getExpirationClass(item.expiredDate)}>
                        {item.expiredDate}
                      </div>
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
                selectedItemId
                  ? "scale-100 opacity-100"
                  : "scale-90 opacity-50 cursor-not-allowed"
              }`}
              disabled={!selectedItemId}
            >
              <X className="h-7 w-5" />
            </button>
          ) : (
            <Link
              to="/add-medicine"
              className="transition-all duration-500 transform scale-100"
            >
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
