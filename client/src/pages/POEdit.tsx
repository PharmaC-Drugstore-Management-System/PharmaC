import { useEffect, useState } from "react";
import { Plus, Minus, PlusCircle, X } from "lucide-react";
import { Form, useNavigate } from "react-router-dom";

type OrderItem = {
  id: number;
  name: string;
  brand: string;
  amount: number;
  unit: string;
  price: number;
  image: string;
  isCustom?: boolean; // Flag สำหรับยาที่เพิ่มใหม่
};

type NewMedicineForm = {
  product_name: string;
  brand: string;
  barcode: string;
  friendlyid: string;
  image: string;
  iscontrolled: boolean;
  producttype: string;
  unit: string;
};

const PurchaseOrder = () => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  // States for Add New Medicine modal
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMedicineForm, setNewMedicineForm] = useState<NewMedicineForm>({
    product_name: '',
    brand: '',
    barcode: '',
    friendlyid: '',
    image: '💊',
    iscontrolled: false,
    producttype: 'Tablet',
    unit: 'Pack'
  });

  // Product types and units
  const [productTypes] = useState([
    "Tablet",
    "Capsule", 
    "Syrup",
    "Injection",
  ] as string[]);

  const [units] = useState(["Pack", "Capsule", "Bottle", "Box"] as string[]);

  const [customProductType, setCustomProductType] = useState("");
  const [customUnit, setCustomUnit] = useState("");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState("");

  const navigate = useNavigate();

  // Check if dark mode is enabled
  const isDark = document.documentElement.classList.contains('dark');

  const loadData = async () => {
    try {
      const res = await fetch("http://localhost:5000/inventory/get-medicine", {
        method: "GET",
        credentials: "include",
      });
      const result = await res.json();
      const formattedItems = result.data.map((item: any): OrderItem => ({
        id: item.product_id,
        name: item.product_name || "Unknown Product",
        brand: item.brand || "Unknown Brand",
        price: item.price ?? 1,
        amount: item.amount ?? 1,
        unit: "pcs", // Default unit, you can modify this based on your data
        image: "💊", // Default image, you can modify this based on your data
      }));
      console.log("Formatted Items:", formattedItems);
      setOrderItems(formattedItems);
    } catch (error) {
      console.log("Error", error);
    }
  };

  const handleItemSelection = (id: number) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(id)) {
      newSelectedItems.delete(id);
    } else {
      newSelectedItems.add(id);
    }
    setSelectedItems(newSelectedItems);
    
    // Clear error message when items are selected
    if (newSelectedItems.size > 0) {
      setErrorMessage("");
    }
  };

  const updateQuantity = (id: number, newAmount: number) => {
    // Only allow updates if the item is selected
    if (!selectedItems.has(id)) return;
    
    setOrderItems(
      orderItems.map((item) =>
        item.id === id ? { ...item, amount: Math.max(1, newAmount) } : item
      )
    );
  };

  // Filter function for inventory items
  const getFilteredItems = () => {
    return orderItems.filter(item => {
      const matchesSearch = searchTerm === "" || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toString().includes(searchTerm);
      
      const matchesBrand = filterBrand === "" || item.brand === filterBrand;
      
      return matchesSearch && matchesBrand;
    });
  };

  // Get unique brands for filter dropdown
  const getUniqueBrands = () => {
    const brands = [...new Set(orderItems.map(item => item.brand))];
    return brands.sort();
  };

  const getTotalValue = () => {
    return orderItems
      .filter(item => selectedItems.has(item.id))
      .reduce(
        (total, item) => total + item.amount * (item.price ?? 0),
        0
      );
  };

  const copyOrderText = () => {
    const orderText = orderItems
      .map(
        (item) =>
          `${item.name || "Unknown Product"} (${item.id}) - ${item.amount} ${
            item.unit
          } @ ${(item.price ?? 0).toLocaleString()} THB`
      )
      .join("\n");
    navigator.clipboard.writeText(orderText);
    alert("Order copied to clipboard!");
  };

  const createQuotation = () => {
    if (selectedItems.size === 0) {
      setErrorMessage("Please select at least one item to create a quotation.");
      return;
    }
    setErrorMessage("");
    // Get selected items data
    const selectedOrderItems = orderItems.filter(item => selectedItems.has(item.id));
    console.log("Selected items for PO:", selectedOrderItems);
    navigate('/poform',{state:{ selectedOrderItems }});
  };

  // Reset new medicine form
  const resetNewMedicineForm = () => {
    setNewMedicineForm({
      product_name: '',
      brand: '',
      barcode: '',
      friendlyid: '',
      image: '💊',
      iscontrolled: false,
      producttype: 'Tablet',
      unit: 'Pack'
    });
    setCustomProductType("");
    setCustomUnit("");
  };

  // Handle form input changes
  const handleFormChange = (field: keyof NewMedicineForm, value: string | boolean) => {
    setNewMedicineForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add new medicine to inventory and order list
  const addNewMedicine = async () => {
    if (!newMedicineForm.product_name.trim() || !newMedicineForm.brand.trim() || !newMedicineForm.producttype.trim() ||
        !newMedicineForm.unit.trim()) {
      setErrorMessage("Please fill in all required fields (Product Name, Brand, Product Type, Unit)");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create new product in inventory using the specified JSON format
      const response = await fetch("http://localhost:5000/inventory/add-medicine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          product_name: newMedicineForm.product_name,
          brand: newMedicineForm.brand,
          barcode: newMedicineForm.barcode || `AUTO-${Date.now()}`,
          friendlyid: newMedicineForm.friendlyid || `FID-${Date.now()}`,
          image: newMedicineForm.image,
          iscontrolled: newMedicineForm.iscontrolled,
          producttype: newMedicineForm.producttype,
          unit: newMedicineForm.unit
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log("New medicine added:", result);

        // Add to order items list
        const newOrderItem: OrderItem = {
          id: result.data?.product_id || Date.now(), // Use returned ID or timestamp
          name: newMedicineForm.product_name,
          brand: newMedicineForm.brand,
          amount: 1,
          unit: newMedicineForm.unit,
          price: 0, // Default price for PO items
          image: newMedicineForm.image,
          isCustom: true
        };

        setOrderItems(prev => [...prev, newOrderItem]);
        
        // Auto-select the new item
        setSelectedItems(prev => new Set([...prev, newOrderItem.id]));
        
        // Close modal and reset form
        setShowAddMedicineModal(false);
        resetNewMedicineForm();
        setErrorMessage("");

        alert(`New medicine "${newMedicineForm.product_name}" added successfully!`);

      } else {
        throw new Error("Failed to add new medicine");
      }
    } catch (error) {
      console.error("Error adding new medicine:", error);
      setErrorMessage("Failed to add new medicine. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
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
    loadData();
    checkme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  

  return (
    <div className="min-h-screen transition-colors duration-300"
         style={{backgroundColor: isDark ? '#111827' : '#f9fafb'}}>
      {/* Main Content */}

      {/* Purchase Order Content */}
      <div className="p-6">
        <h2 className="text-3xl font-light mb-8 transition-colors duration-300"
            style={{color: isDark ? 'white' : '#1f2937'}}>
          Purchase Order
        </h2>

        {/* Inventory Selection */}
        <div className="rounded-lg shadow-sm p-6 mb-6 transition-colors duration-300"
             style={{backgroundColor: isDark ? '#374151' : 'white'}}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-semibold transition-colors duration-300"
                  style={{color: isDark ? 'white' : '#1f2937'}}>Inventory</h3>
              <div className="text-sm px-2 py-1 rounded transition-colors duration-300"
                   style={{
                     color: isDark ? '#d1d5db' : '#4b5563',
                     backgroundColor: isDark ? '#4b5563' : '#f3f4f6'
                   }}>
                {getFilteredItems().length} of {orderItems.length} items
              </div>
            </div>
            <button
              onClick={() => setShowAddMedicineModal(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2 transition-colors"
            >
              <PlusCircle size={16} />
              Add New Medicine
            </button>
          </div>

          {/* Filter Controls */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, brand, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg transition-colors duration-300"
                style={{
                  backgroundColor: isDark ? '#4b5563' : 'white',
                  borderColor: isDark ? '#6b7280' : '#d1d5db',
                  color: isDark ? 'white' : '#1f2937'
                }}
              />
            </div>
            <div className="w-48">
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg transition-colors duration-300"
                style={{
                  backgroundColor: isDark ? '#4b5563' : 'white',
                  borderColor: isDark ? '#6b7280' : '#d1d5db',
                  color: isDark ? 'white' : '#1f2937'
                }}
              >
                <option value="">All Brands</option>
                {getUniqueBrands().map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterBrand("");
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Inventory Items Header */}
          <div className="grid grid-cols-6 gap-4 pb-4 border-b text-sm font-medium transition-colors duration-300"
               style={{
                 borderColor: isDark ? '#4b5563' : '#e5e7eb',
                 color: isDark ? '#d1d5db' : '#4b5563'
               }}>
            <div>Select</div>
            <div className="col-span-2">Product Name</div>
            <div>Product ID</div>
            <div>Available</div>
            <div>Price (THB)</div>
          </div>

          {/* Inventory Items List */}
          <div className="mt-4">
            <div className="max-h-60 overflow-y-auto divide-y rounded transition-colors duration-300"
                 style={{borderColor: isDark ? '#4b5563' : '#f3f4f6'}}>
              {getFilteredItems().length === 0 ? (
                <div className="text-center py-8 transition-colors duration-300"
                     style={{color: isDark ? '#9ca3af' : '#6b7280'}}>
                  {searchTerm || filterBrand ? 'No items match your filter criteria.' : 'No items available in inventory.'}
                </div>
              ) : (
                getFilteredItems().map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-6 gap-4 items-center py-3 px-2 transition-colors duration-300"
                  style={{borderColor: isDark ? '#4b5563' : '#f3f4f6'}}
                >
                  <div>
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => handleItemSelection(item.id)}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 focus:ring-2"
                      style={{
                        backgroundColor: isDark ? '#374151' : '#f3f4f6',
                        borderColor: isDark ? '#4b5563' : '#d1d5db'
                      }}
                    />
                  </div>
                  <div className="col-span-2 flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-lg transition-colors duration-300"
                         style={{backgroundColor: isDark ? '#4b5563' : '#f3f4f6'}}>
                      {item.image}
                    </div>
                    <div>
                      <span className="font-medium transition-colors duration-300"
                            style={{color: isDark ? 'white' : '#1f2937'}}>{item.name}</span>
                      <div className="text-sm transition-colors duration-300"
                           style={{color: isDark ? '#9ca3af' : '#6b7280'}}>{item.brand}</div>
                    </div>
                  </div>
                  <div className="transition-colors duration-300"
                       style={{color: isDark ? '#d1d5db' : '#4b5563'}}>{item.id}</div>
                  <div className="transition-colors duration-300"
                       style={{color: isDark ? '#d1d5db' : '#4b5563'}}>
                    {item.amount} {item.unit}
                  </div>
                  <div className="font-semibold transition-colors duration-300"
                       style={{color: isDark ? 'white' : '#1f2937'}}>
                    {(item.price ?? 0).toLocaleString()}
                  </div>
                </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Selected Items for Order */}
        <div className="rounded-lg shadow-sm p-6 transition-colors duration-300"
             style={{backgroundColor: isDark ? '#374151' : 'white'}}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-semibold transition-colors duration-300"
                  style={{color: isDark ? 'white' : '#1f2937'}}>Selected Items for Purchase Order</h3>
              <div className="text-sm border px-2 py-1 rounded transition-colors duration-300"
                   style={{
                     color: isDark ? '#d1d5db' : '#4b5563',
                     backgroundColor: isDark ? '#374151' : 'white',
                     borderColor: isDark ? '#4b5563' : '#e5e7eb'
                   }}>
                Selected: {selectedItems.size}
              </div>
            </div>
          </div>

          {/* Selected Items Table Header */}
          <div className="grid grid-cols-6 gap-4 pb-4 border-b text-sm font-medium transition-colors duration-300"
               style={{
                 borderColor: isDark ? '#4b5563' : '#e5e7eb',
                 color: isDark ? '#d1d5db' : '#4b5563'
               }}>
            <div>Remove</div>
            <div className="col-span-2">Product Name</div>
            <div>Product ID</div>
            <div>Order Quantity</div>
            <div>Price (THB)</div>
          </div>

          {/* Order Items (scrollable list) */}
          <div className="mt-4">
            <div className="max-h-80 overflow-y-auto divide-y rounded transition-colors duration-300"
                 style={{borderColor: isDark ? '#4b5563' : '#f3f4f6'}}>
              {selectedItems.size === 0 ? (
                <div className="text-center py-8 transition-colors duration-300"
                     style={{color: isDark ? '#9ca3af' : '#6b7280'}}>
                  No items selected. Please select items from the inventory to create a purchase order.
                </div>
              ) : (
                orderItems.filter(item => selectedItems.has(item.id)).map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-6 gap-4 items-center py-3 px-2 transition-colors duration-300"
                    style={{borderColor: isDark ? '#4b5563' : '#f3f4f6'}}
                  >
                    <div>
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => handleItemSelection(item.id)}
                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 focus:ring-2"
                        style={{
                          backgroundColor: isDark ? '#374151' : '#f3f4f6',
                          borderColor: isDark ? '#4b5563' : '#d1d5db'
                        }}
                      />
                    </div>
                  <div className="col-span-2 flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-lg transition-colors duration-300"
                         style={{backgroundColor: isDark ? '#4b5563' : '#f3f4f6'}}>
                      {item.image}
                    </div>
                    <div>
                      <span className="font-medium transition-colors duration-300"
                            style={{color: isDark ? 'white' : '#1f2937'}}>{item.name}</span>
                      <div className="text-sm transition-colors duration-300"
                           style={{color: isDark ? '#9ca3af' : '#6b7280'}}>{item.brand}</div>
                    </div>
                  </div>
                  <div className="transition-colors duration-300"
                       style={{color: isDark ? '#d1d5db' : '#4b5563'}}>{item.id}</div>
                  <div className="flex items-center space-x-2">
                      {selectedItems.has(item.id) && (
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.amount - 1))}
                          className="w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-200"
                          style={{
                            backgroundColor: isDark ? '#4b5563' : '#f3f4f6'
                          }}
                          onMouseEnter={(e) => {
                            const target = e.target as HTMLButtonElement;
                            target.style.backgroundColor = isDark ? '#6b7280' : '#e5e7eb';
                          }}
                          onMouseLeave={(e) => {
                            const target = e.target as HTMLButtonElement;
                            target.style.backgroundColor = isDark ? '#4b5563' : '#f3f4f6';
                          }}
                        >
                          <Minus className="w-3 h-3" style={{color: isDark ? '#d1d5db' : '#4b5563'}} />
                        </button>
                      )}
                      {selectedItems.has(item.id) ? (
                        <input
                          type="number"
                          min={1}
                          value={item.amount}
                          onChange={e => {
                            const value = Number(e.target.value);
                            updateQuantity(item.id, isNaN(value) || value < 1 ? 1 : value);
                          }}
                          className="mx-2 min-w-12 text-center border rounded px-2 py-1 w-20 transition-colors duration-300"
                          style={{
                            backgroundColor: isDark ? '#374151' : 'white',
                            borderColor: isDark ? '#4b5563' : '#d1d5db',
                            color: isDark ? 'white' : '#1f2937'
                          }}
                        />
                      ) : (
                        <span className="mx-2 min-w-12 text-center transition-colors duration-300"
                              style={{color: isDark ? '#d1d5db' : '#4b5563'}}>
                          {item.amount} {item.unit}
                        </span>
                      )}
                      {selectedItems.has(item.id) && (
                        <button
                          onClick={() => updateQuantity(item.id, item.amount + 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-200"
                          style={{
                            backgroundColor: isDark ? '#4b5563' : '#f3f4f6'
                          }}
                          onMouseEnter={(e) => {
                            const target = e.target as HTMLButtonElement;
                            target.style.backgroundColor = isDark ? '#6b7280' : '#e5e7eb';
                          }}
                          onMouseLeave={(e) => {
                            const target = e.target as HTMLButtonElement;
                            target.style.backgroundColor = isDark ? '#4b5563' : '#f3f4f6';
                          }}
                        >
                          <Plus className="w-3 h-3" style={{color: isDark ? '#d1d5db' : '#4b5563'}} />
                        </button>
                      )}
                  </div>
                  <div className="font-semibold transition-colors duration-300"
                       style={{color: isDark ? 'white' : '#1f2937'}}>
                    {(item.price ?? 0).toLocaleString()}
                  </div>
                </div>
                ))
              )}
            </div>
          </div>

          {/* Total Summary */}
          <div className="mt-8 pt-6 border-t transition-colors duration-300"
               style={{borderColor: isDark ? '#4b5563' : '#e5e7eb'}}>
            <div className="flex justify-between items-center text-lg font-semibold">
              <span className="transition-colors duration-300"
                    style={{color: isDark ? 'white' : '#1f2937'}}>Total Order Value:</span>
              <span className="text-teal-600">
                {getTotalValue().toLocaleString()} THB
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          <button
            onClick={createQuotation}
            className={`w-full py-4 rounded-lg font-medium transition-colors ${
              selectedItems.size === 0
                ? "cursor-not-allowed opacity-60"
                : "hover:bg-green-900 text-white"
            }`}
            style={{
              backgroundColor: selectedItems.size === 0 
                ? (isDark ? '#4b5563' : '#9ca3af')
                : (isDark ? '#166534' : '#14532d'),
              color: selectedItems.size === 0
                ? (isDark ? '#9ca3af' : '#6b7280')
                : 'white'
            }}
          >
            Create Quotation
          </button>
          {errorMessage && (
            <p className="text-red-600 text-sm text-center mt-2">
              {errorMessage}
            </p>
          )}
          <button
            onClick={copyOrderText}
            className="w-full py-4 rounded-lg font-medium transition-colors duration-200"
            style={{
              backgroundColor: isDark ? '#4b5563' : '#d1d5db',
              color: isDark ? '#d1d5db' : '#374151'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.backgroundColor = isDark ? '#6b7280' : '#9ca3af';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.backgroundColor = isDark ? '#4b5563' : '#d1d5db';
            }}
          >
            Copy text
          </button>
        </div>
      </div>

      {/* Add New Medicine Modal */}
      {showAddMedicineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Add New Medicine</h2>
              <button
                onClick={() => {
                  setShowAddMedicineModal(false);
                  resetNewMedicineForm();
                  setErrorMessage("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={newMedicineForm.product_name}
                  onChange={(e) => handleFormChange('product_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand *
                </label>
                <input
                  type="text"
                  value={newMedicineForm.brand}
                  onChange={(e) => handleFormChange('brand', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter brand name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Barcode
                </label>
                <input
                  type="text"
                  value={newMedicineForm.barcode}
                  onChange={(e) => handleFormChange('barcode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter barcode (auto-generated if empty)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Friendly ID
                </label>
                <input
                  type="text"
                  value={newMedicineForm.friendlyid}
                  onChange={(e) => handleFormChange('friendlyid', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter friendly ID (auto-generated if empty)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Type *
                </label>
                <select
                  value={newMedicineForm.producttype}
                  onChange={(e) => {
                    if (e.target.value === "custom") {
                      // Handle custom product type
                      setCustomProductType("");
                    } else {
                      handleFormChange('producttype', e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {productTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                  <option value="custom">Other (Custom)</option>
                </select>
                {newMedicineForm.producttype === "custom" && (
                  <input
                    type="text"
                    value={customProductType}
                    onChange={(e) => {
                      setCustomProductType(e.target.value);
                      handleFormChange('producttype', e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                    placeholder="Enter custom product type"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit *
                </label>
                <select
                  value={newMedicineForm.unit}
                  onChange={(e) => {
                    if (e.target.value === "custom") {
                      // Handle custom unit
                      setCustomUnit("");
                    } else {
                      handleFormChange('unit', e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                  <option value="custom">Other (Custom)</option>
                </select>
                {newMedicineForm.unit === "custom" && (
                  <input
                    type="text"
                    value={customUnit}
                    onChange={(e) => {
                      setCustomUnit(e.target.value);
                      handleFormChange('unit', e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                    placeholder="Enter custom unit"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image/Icon
                </label>
                <input
                  type="text"
                  value={newMedicineForm.image}
                  onChange={(e) => handleFormChange('image', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter emoji or image URL"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newMedicineForm.iscontrolled}
                    onChange={(e) => handleFormChange('iscontrolled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Controlled Medicine</span>
                </label>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {errorMessage}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddMedicineModal(false);
                  resetNewMedicineForm();
                  setErrorMessage("");
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={addNewMedicine}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
              >
                {isSubmitting ? 'Adding...' : 'Add Medicine'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrder;