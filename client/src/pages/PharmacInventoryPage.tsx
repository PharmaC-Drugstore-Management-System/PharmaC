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

type MedicineItem = {
  id: number;
  name: string;
  brand: string;
  price: number;
  image?: string | null;
  productType?: string | null;
  unit?: string | null;
  isControlled?: boolean | null;
  expiredDate: string;
  amount: number;
};

export default function PharmacInventoryPage() {
  const navigate = useNavigate();
  const openItem = (id: number) => {
    navigate(`/inventory/${id}`);
  };
  const [items, setItems] = useState<MedicineItem[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  // const loadData = async () => {
  //   try {
  //     const res = await fetch("http://localhost:5000/inventory/get-medicine", {
  //       method: "GET",
  //       credentials: "include",
  //     });
  //     const result = await res.json();
  //     const data = result?.data || [];
  //     const formattedItems = data.map(
  //       (item: any): MedicineItem => ({
  //         id: item.product_id,
  //         name: item.product_name || "-",
  //         brand: item.brand || "-",
  //         price: item.price ?? 0,
  //         image: item.image || null,
  //         productType: item.producttype ?? null,
  //         unit: item.unit ?? item.unit_name ?? item.unitName ?? null,
  //         isControlled:
  //           item.iscontrolled ??
  //           item.isControlled ??
  //           item.is_controlled ??
  //           item.controlled ??
  //           false,
  //         expiredDate:
  //           (item.lot && item.lot[0] && item.lot[0].expired_date) || "-",
  //         amount:
  //           item.stock && item.stock.length > 0 && item.stock[0].quantity_id_fk
  //             ? item.stock[0].quantity_id_fk
  //             : item.amount ?? 0,
  //       })
  //     );
  //     setItems(formattedItems);
  //   } catch (error) {
  //     console.log("Error", error);
  //   }
  // };
  const loadData = async () => {
    // Instead of fetching, just mock one item
    const mockData: MedicineItem[] = [
      {
        id: 1,
        name: "Paracetamol",
        brand: "Tylenol",
        price: 50,
        image: null,
        productType: "Tablet",
        unit: "Box",
        isControlled: false,
        expiredDate: "2025-12-31",
        amount: 25,
      },
    ];
    setItems(mockData);
  };

  const checkme = async () => {
    try {
      const authme = await fetch("http://localhost:5000/api/me", {
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

  const handleInputChange = (
    id: number,
    field: keyof MedicineItem,
    value: string | number
  ) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleRowSelect = (id: number) => {
    setSelectedItemId(id);
  };

  const handleDeleteItem = () => {
    if (selectedItemId !== null) {
      setItems((prevItems) =>
        prevItems.filter((item) => item.id !== selectedItemId)
      );
      setSelectedItemId(null);
      setEditMode(false);
    }
  };

  const getAmountStatus = (amount: number) => {
    if (amount < 50) return "text-red-600";
    if (amount < 100) return "text-yellow-600";
    return "text-green-600";
  };

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

  const getExpirationClass = (dateStr: string): string => {
    if (!dateStr || dateStr === "-") return "";
    return isExpiringSoon(dateStr) ? "text-orange-600" : "";
  };

  const lowStockItems = items.filter((item) => item.amount <= 10);
  const expireSoonItems = items.filter((item) =>
    isExpiringSoon(item.expiredDate)
  );

  useEffect(() => {
    loadData();
    checkme();
  }, []);

  return (
    <div className="flex-1 p-4 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center mb-6">
        <div className="w-1 h-8 bg-green-600 mr-2"></div>
        <h2 className="text-xl font-bold" 
            style={{color: document.documentElement.classList.contains('dark') ? 'white' : 'black'}}>
          Inventory
        </h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Medicines */}
        <div className="p-4 rounded-lg shadow-sm border flex items-center justify-between max-h-[100px] w-full"
             style={{
               backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
               borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
             }}>
          <div className="flex items-center w-full">
            <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium"
                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                Total Medicines
              </p>
              <p className="text-2xl font-bold"
                 style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>{items.length}</p>
            </div>
          </div>
        </div>

        {/* Low Stock */}
        <div className="p-6 rounded-lg shadow-sm border flex items-center justify-between max-h-[100px]"
             style={{
               backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
               borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
             }}>
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium"
                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>Low Stock</p>
              <p className="text-2xl font-bold"
                 style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                {lowStockItems.length}
              </p>
            </div>
          </div>
        </div>

        {/* Expire Soon */}
        <div
          onClick={() => navigate("/expiry-monitor")}
          className={`p-6 rounded-lg shadow-md border cursor-pointer transition-all duration-300 transform max-h-[100px] ${expireSoonItems.length > 0
            ? "bg-gradient-to-r from-orange-500 to-red-500 border-orange-200 hover:shadow-lg hover:scale-[1.02]"
            : "bg-white border-gray-200 hover:shadow-md"
            }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <Clock
                className={`w-10 h-10 ${expireSoonItems.length > 0
                  ? "text-white animate-pulse"
                  : "text-gray-400"
                  }`}
              />
              <div className="ml-4">
                <p
                  className={`text-sm font-medium ${expireSoonItems.length > 0
                    ? "text-orange-100"
                    : "text-gray-500"
                    }`}
                >
                  Expire Soon
                </p>
                <p
                  className={`text-3xl font-bold ${expireSoonItems.length > 0 ? "text-white" : "text-gray-900"
                    }`}
                >
                  {expireSoonItems.length}
                </p>
              </div>
            </div>
            <div className="text-right mt-5">
              {expireSoonItems.length > 0 ? (
                <div className="text-sm font-medium text-white flex items-center justify-end">
                  Click to Manage
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
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
      <div className="rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col"
           style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white'}}>
        {/* Header & Search */}
        <div className="rounded-lg mb-2 p-4 flex items-center"
             style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white'}}>
          <div className="flex items-center mr-4 cursor-pointer"
               style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
            <Search className="h-5 w-5 mr-2" />
            <span>Sort by date</span>
            <ChevronDown className="h-4 w-4 ml-1 text-green-600" />
          </div>
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{
                backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
                color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'
              }}
            />
          </div>
        </div>

        {/* Table Head */}
        <div className="grid grid-cols-8 gap-4 px-6 py-4 border-b"
             style={{
               backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f3f4f6',
               borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#e5e7eb'
             }}>
          <div className="font-medium"
               style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>Image</div>
          <div className="font-medium flex items-center"
               style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
            <span>Name</span>
          </div>
          <div className="font-medium"
               style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>Brand</div>
          <div className="font-medium"
               style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>Type</div>
          <div className="font-medium"
               style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>Unit</div>
          <div className="font-medium"
               style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>Controlled</div>
          <div className="font-medium"
               style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>Price</div>

          <div className="flex items-center justify-between">
            <span className="font-semibold"
                  style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>Stock</span>
            <button
              onClick={() => {
                setEditMode(!editMode);
                setSelectedItemId(null);
              }}
              className="cursor-pointer hover:scale-125 transition-transform duration-300"
              style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}
            >
              <Edit2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y overflow-y-auto flex-1"
             style={{
               borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
             }}>
          {items.map((item) => {
            const isSelected = selectedItemId === item.id;
            const isDimmed = editMode && selectedItemId !== null && !isSelected;
            const rawImage = item.image ?? "";
            const imgSrc = rawImage
              ? rawImage.startsWith("http")
                ? rawImage
                : `http://localhost:5000${rawImage}`
              : null;

            return (
              <div
                key={item.id}
                onClick={() => !editMode && openItem(item.id)}   // ✅ navigate to /inventory/:id
                className={`grid grid-cols-8 gap-4 px-6 py-4 transition-all duration-300 ${isDimmed ? "opacity-50" : "opacity-100"
                  } ${!editMode ? "cursor-pointer" : "cursor-default"}`}
                style={{
                  backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#4b5563' : '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#374151' : 'white';
                }}
              >
                {/* Image cell */}
                <div className="flex items-center">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={item.name}
                      className="h-12 w-12 object-cover rounded"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded flex items-center justify-center text-sm"
                         style={{
                           backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f3f4f6',
                           color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
                         }}>
                      No
                    </div>
                  )}
                </div>

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
                      style={{
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                        borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
                        color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'
                      }}
                    />
                  ) : (
                    <div style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#374151'}}>{item.name}</div>
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
                      className="border p-1 rounded"
                      style={{
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                        borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
                        color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'
                      }}
                    />
                    <input
                      type="text"
                      value={item.productType ?? ""}
                      onChange={(e) =>
                        handleInputChange(
                          item.id,
                          "productType",
                          e.target.value
                        )
                      }
                      className="border p-1 rounded"
                      style={{
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                        borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
                        color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'
                      }}
                    />
                    <input
                      type="text"
                      value={item.unit ?? ""}
                      onChange={(e) =>
                        handleInputChange(item.id, "unit", e.target.value)
                      }
                      className="border p-1 rounded"
                      style={{
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                        borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
                        color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'
                      }}
                    />
                    <div style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#374151'}}>{item.price}</div>
                    <div style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#374151'}}>{item.amount}</div>
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
                      style={{
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                        borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
                        color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'
                      }}
                    />
                  </>
                ) : (
                  <>
                    <div style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#374151'}}>{item.brand}</div>
                    <div style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#374151'}}>
                      {item.productType ?? "-"}
                    </div>
                    <div style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#374151'}}>{item.unit ?? "-"}</div>
                    <div style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#374151'}}>
                      {item.isControlled ? "Yes" : "No"}
                    </div>
                    <div style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#374151'}}>{item.price}</div>
                    <div
                      className={`font-semibold ${getAmountStatus(
                        item.amount
                      )}`}
                    >
                      {item.amount}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-start mt-6">
        {editMode ? (
          <button
            onClick={handleDeleteItem}
            className={`ml-2 px-3 py-2 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 flex items-center transition-all duration-500 transform ${selectedItemId
              ? "scale-100 opacity-100"
              : "scale-90 opacity-50 cursor-not-allowed"
              }`}
            disabled={!selectedItemId}
          >
            <X className="h-7 w-5" />
          </button>
        ) : (
          <Link to="/add-medicine">
            <button className="ml-2 px-3 py-2 bg-green-600 text-white rounded-full shadow-md hover:bg-green-700 flex items-center">
              <Plus className="h-7 w-5" />
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
