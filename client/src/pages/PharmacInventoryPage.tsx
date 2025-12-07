import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  X,
  CheckCircle,
  AlertTriangle,
  Clock,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SERVER_URL = API_URL.replace('/api', ''); // For static files (uploads)

type MedicineItem = {
  id: number;
  name: string;
  brand: string;
  generic_name: string;
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
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]); // เปลี่ยนเป็น array
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name"); // name, stock, expiry

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
          generic_name: item.generic_name || "-",
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
  const API_URL = import.meta.env.VITE_API_URL;

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

  const handleRowSelect = (id: number) => {
    setSelectedItemIds((prev) => {
      if (prev.includes(id)) {
        // ถ้าเลือกอยู่แล้ว ให้ยกเลิกการเลือก
        return prev.filter((itemId) => itemId !== id);
      } else {
        // ถ้ายังไม่เลือก ให้เพิ่มเข้าไป
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedItemIds.length === filteredItems.length) {
      // ถ้าเลือกครบแล้ว ให้ยกเลิกทั้งหมด
      setSelectedItemIds([]);
    } else {
      // เลือกทั้งหมด
      setSelectedItemIds(filteredItems.map((item) => item.id));
    }
  };

  const handleDeleteItem = async () => {
    if (selectedItemIds.length === 0) return;

    const selectedItemsData = items.filter((item) => selectedItemIds.includes(item.id));
    const count = selectedItemIds.length;
    
    const result = await Swal.fire({
      title: `Delete ${count} Medicine${count > 1 ? 's' : ''}?`,
      html: `
        <div style="text-align: left;">
          <p style="margin-bottom: 10px;"><strong>Selected items:</strong></p>
          <ul style="max-height: 150px; overflow-y: auto; padding-left: 20px; margin-bottom: 15px;">
            ${selectedItemsData.map(item => `<li>${item.name} (${item.brand})</li>`).join('')}
          </ul>
          <hr style="margin: 15px 0;">
          <p style="color: #ef4444; font-weight: 600;">⚠️ This action cannot be undone!</p>
          <p style="font-size: 14px; color: #6b7280;">
            This will permanently delete ${count} medicine${count > 1 ? 's' : ''} from the database.
          </p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Yes, delete ${count > 1 ? 'all' : 'it'}!`,
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        // Show loading
        Swal.fire({
          title: "Deleting...",
          text: `Deleting ${count} item${count > 1 ? 's' : ''}...`,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        // Delete all selected items
        const deleteResults = await Promise.allSettled(
          selectedItemIds.map(async (id) => {
            try {
              const response = await fetch(`${API_URL}/inventory/delete-medicine/${id}`, {
                method: "DELETE",
                credentials: "include",
              });
              
              const data = await response.json();
              
              if (!response.ok) {
                // Extract the most descriptive error message
                const errorMsg = data.message || data.error || "Failed to delete";
                console.error(`Failed to delete ID ${id}:`, errorMsg);
                throw new Error(errorMsg);
              }
              
              return { id, success: true };
            } catch (error) {
              console.error(`Error deleting ID ${id}:`, error);
              throw error;
            }
          })
        );

        // Separate successful and failed deletions
        const successfulIds: number[] = [];
        const failedItems: { id: number; reason: string }[] = [];

        deleteResults.forEach((result, index) => {
          const id = selectedItemIds[index];
          if (result.status === "fulfilled") {
            successfulIds.push(id);
          } else {
            failedItems.push({
              id,
              reason: result.reason?.message || "Unknown error",
            });
          }
        });

        // Remove successfully deleted items from frontend
        if (successfulIds.length > 0) {
          setItems((prevItems) =>
            prevItems.filter((item) => !successfulIds.includes(item.id))
          );
        }

        setSelectedItemIds([]);
        setEditMode(false);

        // Show appropriate message
        if (failedItems.length === 0) {
          // All deleted successfully
          Swal.fire({
            title: "Deleted!",
            text: `${count} medicine${count > 1 ? 's have' : ' has'} been deleted from database.`,
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        } else if (successfulIds.length === 0) {
          // All failed
          const errorMessages = failedItems
            .map((f) => {
              const item = items.find((i) => i.id === f.id);
              return `• ${item?.name || `ID ${f.id}`}: ${f.reason}`;
            })
            .join("<br>");

          Swal.fire({
            title: "Cannot Delete!",
            html: `
              <div style="text-align: left;">
                <p style="margin-bottom: 10px;">The following medicines cannot be deleted:</p>
                <div style="max-height: 200px; overflow-y: auto; font-size: 14px;">
                  ${errorMessages}
                </div>
              </div>
            `,
            icon: "error",
            confirmButtonColor: "#ef4444",
          });
        } else {
          // Partial success
          const errorMessages = failedItems
            .map((f) => {
              const item = items.find((i) => i.id === f.id);
              return `• ${item?.name || `ID ${f.id}`}: ${f.reason}`;
            })
            .join("<br>");

          Swal.fire({
            title: "Partially Deleted",
            html: `
              <div style="text-align: left;">
                <p style="color: #10b981; margin-bottom: 10px;">✓ Successfully deleted: ${successfulIds.length} item(s)</p>
                <p style="color: #ef4444; margin-bottom: 10px;">✗ Failed to delete: ${failedItems.length} item(s)</p>
                <hr style="margin: 10px 0;">
                <div style="max-height: 200px; overflow-y: auto; font-size: 14px;">
                  ${errorMessages}
                </div>
              </div>
            `,
            icon: "warning",
            confirmButtonColor: "#f59e0b",
          });
        }
      } catch (error) {
        console.error("Error deleting medicines:", error);
        Swal.fire({
          title: "Error!",
          text: "An unexpected error occurred. Please try again.",
          icon: "error",
          confirmButtonColor: "#ef4444",
        });
      }
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

  const lowStockItems = items.filter((item) => item.amount <= 10);
  const expireSoonItems = items.filter((item) =>
    isExpiringSoon(item.expiredDate)
  );

  // Get unique categories from items
  const categories = Array.from(
    new Set(items.map((item) => item.productType).filter(Boolean))
  ) as string[];

  // Filter and sort items
  const getFilteredAndSortedItems = () => {
    let filtered = [...items];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.brand.toLowerCase().includes(query) ||
          (item.productType && item.productType.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.productType === selectedCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "stock") {
        return b.amount - a.amount; // High to low
      } else if (sortBy === "expiry") {
        // Sort by expiry date (nearest first)
        if (a.expiredDate === "-" && b.expiredDate === "-") return 0;
        if (a.expiredDate === "-") return 1;
        if (b.expiredDate === "-") return -1;
        return new Date(a.expiredDate).getTime() - new Date(b.expiredDate).getTime();
      }
      return 0;
    });

    return filtered;
  };

  const filteredItems = getFilteredAndSortedItems();

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
              <span>{t('addMedicine')}</span>
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
                {t('productsInStock')}
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
                {t('needReorder')}
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
                {expireSoonItems.length > 0 ? t('requiresAttention') : t('allProductsFresh')}
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
              placeholder={t("searchMedicinesBrandsOrTypes")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 py-3 w-full rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              style={{
                backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f9fafb',
                borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
                color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:bg-gray-200 rounded-full p-1 transition-colors"
                title="Clear search"
              >
                <XCircle className="h-5 w-5"
                         style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}} />
              </button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex items-center space-x-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              style={{
                backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
                color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'
              }}
            >
              <option value="all">{t('allCategories')}</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              style={{
                backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
                color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'
              }}
            >
              <option value="name">{t('sortByName')}</option>
              <option value="stock">{t('sortByStock')}</option>
              <option value="expiry">{t('sortByExpiry')}</option>
            </select>

            {/* Clear All Filters Button */}
            {(searchQuery || selectedCategory !== "all" || sortBy !== "name") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSortBy("name");
                }}
                className="px-4 py-3 rounded-lg border font-medium transition-all duration-300 flex items-center space-x-2 hover:bg-gray-100"
                style={{
                  backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                  borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
                  color: document.documentElement.classList.contains('dark') ? '#f59e0b' : '#f97316'
                }}
                title="Clear all filters"
              >
                <RotateCcw className="h-5 w-5" />
                <span>Clear</span>
              </button>
            )}

            {/* Edit Mode Toggle */}
            <button
              onClick={() => {
                setEditMode(!editMode);
                setSelectedItemIds([]);
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
              <span>{editMode ? t('cancelEdit') : t('editMode')}</span>
            </button>
          </div>
        </div>

        {/* Select All / Delete Selected Actions */}
        {editMode && (
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 rounded-lg border font-medium transition-all duration-300 flex items-center space-x-2 hover:bg-gray-100"
              style={{
                backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
                color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'
              }}
            >
              <input
                type="checkbox"
                checked={selectedItemIds.length === filteredItems.length && filteredItems.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 text-green-600 focus:ring-green-500 rounded"
              />
              <span>{t('selectAll')} ({filteredItems.length} {t('items')})</span>
            </button>

            {selectedItemIds.length > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium"
                      style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                  {selectedItemIds.length} {t('selected')}
                </span>
                {selectedItemIds.length === 1 && (
                  <button
                    onClick={async () => {
                      const selectedId = selectedItemIds[0];
                      try {
                        // Fetch full medicine data from backend
                        const res = await fetch(`${API_URL}/inventory/get-prouduct/${selectedId}`, {
                          method: 'POST',
                          credentials: 'include',
                        });
                        
                        if (!res.ok) {
                          throw new Error('Failed to fetch medicine data');
                        }

                        const result = await res.json();
                        const medicineData = result.data;
                        
                        // Navigate with full data
                        navigate('/add-medicine', { state: { editData: medicineData } });
                      } catch (error) {
                        console.error('Error fetching medicine data:', error);
                        alert('Failed to load medicine data');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center space-x-2 transition-all duration-300 shadow-md"
                  >
                    <Edit2 className="h-5 w-5" />
                    <span>{t('editSelected')}</span>
                  </button>
                )}
                <button
                  onClick={handleDeleteItem}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center space-x-2 transition-all duration-300 shadow-md"
                >
                  <X className="h-5 w-5" />
                  <span>{t('deleteSelected')}</span>
                </button>
              </div>
            )}
          </div>
        )}
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
            {t('medicineInventory')} ({filteredItems.length} {t('items')})
            {editMode && (
              <span className="ml-4 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                {t('editModeActive')}
              </span>
            )}
          </h3>
        </div>

        {/* Modern Table Header */}
        <div className="hidden lg:grid lg:grid-cols-8 gap-4 px-6 py-4 border-b text-sm font-semibold"
             style={{
               backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f1f5f9',
               borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#e2e8f0'
             }}>
          <div className="text-center" style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#475569'}}>
            {t('image')}
          </div>
          <div className="text-left" style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#475569'}}>
            {t('medicineName')}
          </div>
          <div className="text-center" style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#475569'}}>
            {t('brand')}
          </div>
          <div className="text-center" style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#475569'}}>
            {t('productGenericName')}
          </div>
          <div className="text-center" style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#475569'}}>
            {t('type')}
          </div>
          <div className="text-center" style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#475569'}}>
            {t('unit')}
          </div>
          <div className="text-center" style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#475569'}}>
            {t('controlled')}
          </div>
          <div className="text-center" style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#475569'}}>
            {t('stockLevel')}
          </div>
        </div>

        {/* Enhanced Table Body */}
        <div>
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                   style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f1f5f9'}}>
                <Search className="w-8 h-8" style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}} />
              </div>
              <h3 className="text-lg font-medium mb-2"
                  style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#1e293b'}}>
                {t('noMedicinesFound')}
              </h3>
              <p className="text-sm"
                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#64748b'}}>
                {searchQuery || selectedCategory !== "all"
                  ? t('tryAdjustingFilters')
                  : t('addFirstMedicine')}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = selectedItemIds.includes(item.id);
              const isDimmed = editMode && selectedItemIds.length > 0 && !isSelected;
              const rawImage = item.image ?? "";
              
              // Handle image URL construction
              let imgSrc = null;
              if (rawImage) {
                if (rawImage.startsWith("http://") || rawImage.startsWith("https://")) {
                  // Already a complete URL
                  imgSrc = rawImage;
                } else if (rawImage.startsWith("/uploads/")) {
                  // Path starts with /uploads/
                  imgSrc = `${SERVER_URL}${rawImage}`;
                } else if (rawImage.startsWith("uploads/")) {
                  // Path without leading slash
                  imgSrc = `${SERVER_URL}/${rawImage}`;
                } else {
                  // Any other path
                  imgSrc = `${SERVER_URL}/${rawImage}`;
                }
              }

              return (
                <div key={item.id} className="relative">
                  {/* Desktop Layout */}
                  <div
                    onClick={() => !editMode && openItem(item.id)}
                    className={`hidden lg:grid lg:grid-cols-8 gap-4 px-6 py-5 transition-all duration-300 border-b border-gray-300 ${
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
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleRowSelect(item.id)}
                          className="h-5 w-5 text-green-600 focus:ring-green-500 rounded cursor-pointer"
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

                    {/* Name cell */}
                    <div className="flex items-center">
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
                    </div>

                    {/* Brand cell */}
                    <div className="flex items-center justify-center">
                      <span className="font-medium text-center"
                            style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#374151'}}>
                        {item.brand}
                      </span>
                    </div>

                    {/* Generic Name cell */}
                    <div className="flex items-center justify-center">
                      <p className="text-sm text-center"
                         style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#475569'}}>
                        {item.generic_name || "-"}
                      </p>
                    </div>

                    {/* Type cell */}
                    <div className="flex items-center justify-center">
                      <span className="text-sm px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f1f5f9',
                              color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#64748b'
                            }}>
                        {item.productType ?? "-"}
                      </span>
                    </div>

                    {/* Unit cell */}
                    <div className="flex items-center justify-center">
                      <span style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#374151'}}>
                        {item.unit ?? "-"}
                      </span>
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
                          {item.unit || t('units')}
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
                            {t('noImage')}
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
                              {item.brand} • {item.generic_name}
                            </p>
                            <p className="text-sm"
                               style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#64748b'}}>
                              ID: {item.id}
                            </p>
                          </div>
                          {editMode && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleRowSelect(item.id)}
                              className="h-5 w-5 text-green-600 focus:ring-green-500 rounded cursor-pointer ml-4"
                            />
                          )}
                        </div>

                        <div className="mt-3">
                          <div>
                            <p className="text-xs font-medium"
                               style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#64748b'}}>
                              {t('stock')}
                            </p>
                            <p className={`text-lg font-bold ${getAmountStatus(item.amount)}`}>
                              {item.amount} {item.unit || t('units')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.isControlled 
                              ? "bg-red-100 text-red-700" 
                              : "bg-green-100 text-green-700"
                          }`}>
                            {item.isControlled ? t('controlled') : t('regular')}
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
    </div>
  );
}
