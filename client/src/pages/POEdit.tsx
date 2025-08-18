import { useEffect, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";

type OrderItem = {
  id: number;
  name: string;
  brand: string;
  amount: number;
  unit: string;
  price: number;
  image: string;
};

const PurchaseOrder = () => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string>("");

  const navigate = useNavigate();

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

  const getTotalValue = () => {
    return orderItems.reduce(
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
    navigate('/poform');
  };
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
    loadData();
    checkme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  return (
    <div className="min-h-screen ">
      {/* Main Content */}

      {/* Purchase Order Content */}
      <div className="p-6">
        <h2 className="text-3xl font-light text-gray-800 mb-8">
          Purchase Order
        </h2>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Order</h3>
          </div>

          {/* Order Table Header */}
          <div className="grid grid-cols-6 gap-4 pb-4 border-b border-gray-200 text-sm font-medium text-gray-600">
            <div>Select</div>
            <div className="col-span-2">Product Name</div>
            <div>Product ID</div>
            <div>Amount</div>
            <div>Price (THB)</div>
          </div>

          {/* Order Items */}
          <div className="space-y-4 mt-4">
            {orderItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-6 gap-4 items-center py-3 border-b border-gray-100"
              >
                <div>
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => handleItemSelection(item.id)}
                    className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 focus:ring-2"
                  />
                </div>
                <div className="col-span-2 flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                    {item.image}
                  </div>
                  <div>
                    <span className="font-medium text-gray-800">{item.name}</span>
                    <div className="text-sm text-gray-500">{item.brand}</div>
                  </div>
                </div>
                <div className="text-gray-600">{item.id}</div>
                <div className="flex items-center space-x-2">
                    {selectedItems.has(item.id) && (
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.amount - 1))}
                        className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                      >
                        <Minus className="w-3 h-3" />
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
                        className="mx-2 min-w-12 text-center border rounded px-2 py-1 w-20"
                      />
                    ) : (
                      <span className="mx-2 min-w-12 text-center">
                        {item.amount} {item.unit}
                      </span>
                    )}
                    {selectedItems.has(item.id) && (
                      <button
                        onClick={() => updateQuantity(item.id, item.amount + 1)}
                        className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                </div>
                <div className="font-semibold">
                  {(item.price ?? 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Total Summary */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Order Value:</span>
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
                ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-60"
                : "bg-green-800 hover:bg-green-900 text-white"
            }`}
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
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-4 rounded-lg font-medium transition-colors"
          >
            Copy text
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrder;