import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  X,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SERVER_URL = API_URL.replace('/api', ''); // For static files (uploads)

type MedicineItem = {
  id: number;
  name: string;
  brand: string;
  image?: string | null;
  productType?: string | null;
  unit?: string | null;
  isControlled?: boolean | null;
  expiredDate: string;
  amount: number;
};

export default function PharmacInventoryPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const openItem = (id: number) => {
    navigate(`/inventory/${id}`);
  };
  const [items, setItems] = useState<MedicineItem[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const res = await fetch(`${API_URL}/inventory/get-medicine`, {
        method: "GET",
        credentials: "include",
      });
      const result = await res.json();
      const data = result?.data || [];
      const formattedItems = data.map(
        (item: any): MedicineItem => ({
          id: item.product_id,
          name: item.product_name || "-",
          brand: item.brand || "-",
          image: item.image || null,
          productType: item.producttype ?? null,
          unit: item.unit ?? item.unit_name ?? item.unitName ?? null,
          isControlled:
            item.iscontrolled ??
            item.isControlled ??
            item.is_controlled ??
            item.controlled ??
            false,
          expiredDate:
            (item.lot && item.lot[0] && item.lot[0].expired_date) || "-",
          // Sum all stock from all lots for this product
          amount: item.lot && item.lot.length > 0 
            ? item.lot.reduce((total: number, lot: any) => {
                const lotAmount = lot.init_amount || lot.quantity || lot.amount || 0;
                return total + lotAmount;
              }, 0)
            : item.amount ?? 0,
        })
      );
      setItems(formattedItems);
    } catch (error) {
      console.log("Error", error);
    }
  };

  const checkme = async () => {
    try {
      const authme = await fetch(`${API_URL}/me`, {
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

  // const getExpirationClass = (dateStr: string): string => {
  //   if (!dateStr || dateStr === "-") return "";
  //   return isExpiringSoon(dateStr) ? "text-orange-600" : "";
  // };

  const lowStockItems = items.filter((item) => item.amount <= 10);
  const expireSoonItems = items.filter((item) =>
    isExpiringSoon(item.expiredDate)
  );

  useEffect(() => {
    loadData();
    checkme();
  }, []);

  return (
    <div 
      className="min-h-screen p-6"
      style={{
        backgroundColor: document.documentElement.classList.contains("dark")
          ? "#111827"
          : "#f9fafb",
      }}
    >
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="w-1 h-8 bg-green-600 mr-3 rounded-full"></div>
          <div>
            <h1 className="text-3xl font-bold" 
                style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
              {t('inventory')}
            </h1>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center space-x-3">
          <Link to="/add-medicine">
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 shadow-lg">
              <Plus className="h-5 w-5" />
              <span>Add Medicine</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Medicines - Enhanced */}
        <div className="p-6 rounded-xl border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
             style={{
               backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
               borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
             }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium mb-2"
                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                {t('totalMedicines')}
              </p>
              <p className="text-3xl font-bold"
                 style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                {items.length}
              </p>
              <p className="text-sm text-green-600 mt-1 font-medium">
                Products in stock
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Low Stock - Enhanced */}
        <div className="p-6 rounded-xl  border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
             style={{
               backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
               borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
             }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium mb-2"
                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                {t('lowStock')}
              </p>
              <p className="text-3xl font-bold"
                 style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                {lowStockItems.length}
              </p>
              <p className="text-sm text-red-600 mt-1 font-medium">
                Need reorder
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Expire Soon - Enhanced */}
        <div
          onClick={() => navigate("/expiry-monitor")}
          className="p-6 rounded-xl  border cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
          style={{
            backgroundColor: expireSoonItems.length > 0 
              ? "#f97316" 
              : (document.documentElement.classList.contains('dark') ? '#374151' : 'white'),
            borderColor: expireSoonItems.length > 0 
              ? "#ea580c" 
              : (document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb')
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium mb-2 ${
                expireSoonItems.length > 0 ? "text-orange-100" : 
                (document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280')
              }`}>
                {t('expireSoon')}
              </p>
              <p className={`text-3xl font-bold ${
                expireSoonItems.length > 0 ? "text-white" : 
                (document.documentElement.classList.contains('dark') ? 'white' : '#111827')
              }`}>
                {expireSoonItems.length}
              </p>
              <p className={`text-sm mt-1 font-medium ${
                expireSoonItems.length > 0 ? "text-orange-200" : "text-orange-600"
              }`}>
                {expireSoonItems.length > 0 ? "Requires attention" : "All products fresh"}
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              expireSoonItems.length > 0 ? "bg-orange-200" : "bg-orange-100"
            }`}>
              <Clock className={`w-8 h-8 ${
                expireSoonItems.length > 0 ? "text-orange-800" : "text-orange-600"
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="rounded-xl shadow-xs border p-6 mb-6"
           style={{
             backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
             borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
           }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                    style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}} />
            <input
              type="text"
              placeholder="Search medicines, brands, or types..."
              className="pl-10 pr-4 py-3 w-full rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              style={{
                backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f9fafb',
                borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
                color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'
              }}
            />
          </div>

          {/* Filter Controls */}
          <div className="flex items-center space-x-3">
            <select
              className="px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              style={{
                backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
                color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'
              }}
            >
              <option>All Categories</option>
              <option>Pain Relief</option>
              <option>Antibiotics</option>
              <option>Supplements</option>
            </select>

            <select
              className="px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              style={{
                backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
                color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'
              }}
            >
              <option>Sort by Name</option>
              <option>Sort by Stock</option>
              <option>Sort by Expiry</option>
            </select>

            {/* Edit Mode Toggle */}
            <button
              onClick={() => {
                setEditMode(!editMode);
                setSelectedItemId(null);
              }}
              className={`px-4 py-3 rounded-lg border font-medium transition-all duration-300 flex items-center space-x-2 ${
                editMode 
                  ? "bg-red-500 hover:bg-red-600 text-white border-red-500" 
                  : "hover:bg-green-50 border-green-200 text-green-700"
              }`}
              style={{
                backgroundColor: editMode ? "#ef4444" : (document.documentElement.classList.contains('dark') ? '#374151' : 'white'),
                borderColor: editMode ? "#ef4444" : (document.documentElement.classList.contains('dark') ? '#6b7280' : '#10b981'),
                color: editMode ? "white" : (document.documentElement.classList.contains('dark') ? '#10b981' : '#047857')
              }}
            >
              <Edit2 className="h-5 w-5" />
              <span>{editMode ? "Cancel Edit" : "Edit Mode"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-xl shadow-lg overflow-hidden"
           style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white'}}>
        {/* Table Header */}
        <div className="px-6 py-4 border-b"
             style={{
               backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f8fafc',
               borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#e2e8f0'
             }}>
          <h3 className="text-lg font-semibold flex items-center"
              style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#1e293b'}}>
            <div className="w-1 h-5 bg-green-500 mr-3 rounded-full"></div>
            Medicine Inventory ({items.length} items)
            {editMode && (
              <span className="ml-4 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                Edit Mode Active
              </span>
            )}
          </h3>
        </div>

        {/* Modern Table Header */}
        <div className="hidden lg:grid lg:grid-cols-7 gap-4 px-6 py-4 border-b text-sm font-semibold"
             style={{
               backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f1f5f9',
               borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#e2e8f0'
             }}>
          <div className="text-center" style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#475569'}}>
            Image
          </div>
          <div className="text-left" style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#475569'}}>
            Medicine Name
          </div>
          <div className="text-center" style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#475569'}}>
            Brand
          </div>
          <div className="text-center" style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#475569'}}>
            Type
          </div>
          <div className="text-center" style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#475569'}}>
            Unit
          </div>
          <div className="text-center" style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#475569'}}>
            Controlled
          </div>
          <div className="text-center" style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#475569'}}>
            Stock Level
          </div>
        </div>

        {/* Enhanced Table Body */}
        <div>
          {items.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                   style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f1f5f9'}}>
                <Search className="w-8 h-8" style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}} />
              </div>
              <h3 className="text-lg font-medium mb-2"
                  style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#1e293b'}}>
                No medicines found
              </h3>
              <p className="text-sm"
                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#64748b'}}>
                Add your first medicine to get started
              </p>
            </div>
          ) : (
            items.map((item) => {
              const isSelected = selectedItemId === item.id;
              const isDimmed = editMode && selectedItemId !== null && !isSelected;
              const rawImage = item.image ?? "";
              const imgSrc = rawImage
                ? rawImage.startsWith("http")
                  ? rawImage
                  : `${SERVER_URL}${rawImage}`
                : null;

              return (
                <div key={item.id} className="relative">
                  {/* Desktop Layout */}
                  <div
                    onClick={() => !editMode && openItem(item.id)}
                    className={`hidden lg:grid lg:grid-cols-7 gap-4 px-6 py-5 transition-all duration-300 border-b border-gray-300 ${
                      isDimmed ? "opacity-50" : "opacity-100"
                    } ${!editMode ? "cursor-pointer hover:bg-opacity-75" : "cursor-default"}
                    ${isSelected ? "ring-2 ring-green-500 bg-green-50" : ""}`}
                    style={{
                      backgroundColor: isSelected 
                        ? (document.documentElement.classList.contains('dark') ? '#065f46' : '#f0fdf4')
                        : (document.documentElement.classList.contains('dark') ? '#374151' : 'white'),
                      borderBottomColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#4b5563' : '#f8fafc';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#374151' : 'white';
                      }
                    }}
                  >
                    {/* Selection checkbox in edit mode */}
                    {editMode && (
                      <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                        <input
                          type="radio"
                          name="selectedItem"
                          checked={isSelected}
                          onChange={() => handleRowSelect(item.id)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500"
                        />
                      </div>
                    )}

                    {/* Image cell */}
                    <div className="flex items-center justify-center">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border-2"
                           style={{borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#e5e7eb'}}>
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-medium"
                               style={{
                                 backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f1f5f9',
                                 color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#64748b'
                               }}>
                            No Image
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Name cell with edit capability */}
                    <div className="flex items-center">
                      {isSelected && editMode ? (
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleInputChange(item.id, "name", e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          style={{
                            backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                            borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
                            color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'
                          }}
                        />
                      ) : (
                        <div>
                          <h4 className="font-semibold text-lg"
                              style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#1e293b'}}>
                            {item.name}
                          </h4>
                          <p className="text-sm"
                             style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#64748b'}}>
                            ID: {item.id}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Brand cell */}
                    <div className="flex items-center justify-center">
                      {isSelected && editMode ? (
                        <input
                          type="text"
                          value={item.brand}
                          onChange={(e) => handleInputChange(item.id, "brand", e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-center focus:ring-2 focus:ring-green-500"
                          style={{
                            backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                            borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
                            color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'
                          }}
                        />
                      ) : (
                        <span className="font-medium"
                              style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#374151'}}>
                          {item.brand}
                        </span>
                      )}
                    </div>

                    {/* Type cell */}
                    <div className="flex items-center justify-center">
                      {isSelected && editMode ? (
                        <input
                          type="text"
                          value={item.productType ?? ""}
                          onChange={(e) => handleInputChange(item.id, "productType", e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-center focus:ring-2 focus:ring-green-500"
                          style={{
                            backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                            borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
                            color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'
                          }}
                        />
                      ) : (
                        <span className="text-sm px-2 py-1 rounded-full"
                              style={{
                                backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f1f5f9',
                                color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#64748b'
                              }}>
                          {item.productType ?? "-"}
                        </span>
                      )}
                    </div>

                    {/* Unit cell */}
                    <div className="flex items-center justify-center">
                      {isSelected && editMode ? (
                        <input
                          type="text"
                          value={item.unit ?? ""}
                          onChange={(e) => handleInputChange(item.id, "unit", e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-center focus:ring-2 focus:ring-green-500"
                          style={{
                            backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                            borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
                            color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'
                          }}
                        />
                      ) : (
                        <span style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#374151'}}>
                          {item.unit ?? "-"}
                        </span>
                      )}
                    </div>

                    {/* Controlled cell */}
                    <div className="flex items-center justify-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        item.isControlled 
                          ? "bg-red-100 text-red-700 border border-red-200" 
                          : "bg-green-100 text-green-700 border border-green-200"
                      }`}>
                        {item.isControlled ? "Yes" : "No"}
                      </span>
                    </div>

                    {/* Stock Level cell */}
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className={`text-xl font-bold ${getAmountStatus(item.amount)}`}>
                          {item.amount}
                        </div>
                        <div className="text-xs"
                             style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#64748b'}}>
                          units
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div 
                    onClick={() => !editMode && openItem(item.id)}
                    className={`lg:hidden p-6 transition-all duration-300 border-b border-gray-300 ${
                      isDimmed ? "opacity-50" : "opacity-100"
                    } ${!editMode ? "cursor-pointer" : "cursor-default"}
                    ${isSelected ? "ring-2 ring-green-500 bg-green-50" : ""}`}
                    style={{
                      backgroundColor: isSelected 
                        ? (document.documentElement.classList.contains('dark') ? '#065f46' : '#f0fdf4')
                        : (document.documentElement.classList.contains('dark') ? '#374151' : 'white'),
                      borderBottomColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db'
                    }}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Mobile Image */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0"
                           style={{borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#e5e7eb'}}>
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs"
                               style={{
                                 backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f1f5f9',
                                 color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#64748b'
                               }}>
                            No Image
                          </div>
                        )}
                      </div>

                      {/* Mobile Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg truncate"
                                style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#1e293b'}}>
                              {item.name}
                            </h4>
                            <p className="text-sm"
                               style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#64748b'}}>
                              {item.brand} • ID: {item.id}
                            </p>
                          </div>
                          {editMode && (
                            <input
                              type="radio"
                              name="selectedItem"
                              checked={isSelected}
                              onChange={() => handleRowSelect(item.id)}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 ml-4"
                            />
                          )}
                        </div>

                        <div className="mt-3">
                          <div>
                            <p className="text-xs font-medium"
                               style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#64748b'}}>
                              Stock
                            </p>
                            <p className={`text-lg font-bold ${getAmountStatus(item.amount)}`}>
                              {item.amount} units
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.isControlled 
                              ? "bg-red-100 text-red-700" 
                              : "bg-green-100 text-green-700"
                          }`}>
                            {item.isControlled ? "Controlled" : "Regular"}
                          </span>
                          
                          {item.productType && (
                            <span className="text-xs px-2 py-1 rounded-full"
                                  style={{
                                    backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f1f5f9',
                                    color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#64748b'
                                  }}>
                              {item.productType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Action Buttons - Enhanced */}
      {editMode && selectedItemId && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleDeleteItem}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <X className="h-5 w-5" />
            <span>Delete Selected Item</span>
          </button>
        </div>
      )}
    </div>
  );
}
