import React, { useState } from "react";
import { Plus, Edit3, Minus, Bell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PurchaseOrder = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [orderItems, setOrderItems] = useState([
    {
      id: "P-702",
      name: "APRACUR 4'S",
      amount: 300,
      unit: "pcs",
      price: 25000,
      image: "💊",
    },
    {
      id: "P-5878",
      name: "CEMOL 500mg ฟ้า-ขาว 1000's",
      amount: 15,
      unit: "pcs",
      price: 1500,
      image: "🏥",
    },
    {
      id: "P-6779",
      name: "A-MOL Para 250mg/5ml 60ml",
      amount: 150,
      unit: "pcs",
      price: 1200,
      image: "🧪",
    },
    {
      id: "P-5648",
      name: "BAKAMOL 10's",
      amount: 100,
      unit: "pcs",
      price: 500,
      image: "💉",
    },
  ]);

  const navigate = useNavigate();

  const removeItem = (id: string) => {
    setOrderItems(orderItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, newAmount: number) => {
    setOrderItems(
      orderItems.map((item) =>
        item.id === id ? { ...item, amount: Math.max(0, newAmount) } : item
      )
    );
  };

  const addNewItem = () => {
    const newItem = {
      id: `P-${Math.floor(Math.random() * 9999)}`,
      name: "New Product",
      amount: 1,
      unit: "pcs",
      price: 0,
      image: "📦",
    };
    setOrderItems([...orderItems, newItem]);
  };

  const getTotalValue = () => {
    return orderItems.reduce(
      (total, item) => total + item.amount * item.price,
      0
    );
  };

  const copyOrderText = () => {
    const orderText = orderItems
      .map(
        (item) =>
          `${item.name} (${item.id}) - ${item.amount} ${
            item.unit
          } @ ${item.price.toLocaleString()} THB`
      )
      .join("\n");
    navigator.clipboard.writeText(orderText);
    alert("Order copied to clipboard!");
  };

  const createQuotation = () => {
    alert("Quotation created successfully!");
    navigate('/poform')
  };

  return (
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
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`p-2 rounded-lg transition-colors ${
                isEditMode
                  ? "bg-teal-100 text-teal-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Edit3 className="w-5 h-5" />
            </button>
          </div>

          {/* Order Table Header */}
          <div
            className={`grid ${
              isEditMode ? "grid-cols-6" : "grid-cols-5"
            } gap-4 pb-4 border-b border-gray-200 text-sm font-medium text-gray-600`}
          >
            <div className="col-span-2">Product Name</div>
            <div>Product ID</div>
            <div>Amount</div>
            <div>Price (THB)</div>
            {isEditMode && <div></div>}
          </div>

          {/* Order Items */}
          <div className="space-y-4 mt-4">
            {orderItems.map((item) => (
              <div
                key={item.id}
                className={`grid ${
                  isEditMode ? "grid-cols-6" : "grid-cols-5"
                } gap-4 items-center py-3 border-b border-gray-100`}
              >
                <div className="col-span-2 flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                    {item.image}
                  </div>
                  <span className="font-medium text-gray-800">{item.name}</span>
                </div>
                <div className="text-gray-600">{item.id}</div>
                <div className="flex items-center space-x-2">
                  {isEditMode && (
                    <button
                      onClick={() => updateQuantity(item.id, item.amount - 1)}
                      className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  )}
                  <span className="mx-2 min-w-12 text-center">
                    {item.amount} {item.unit}
                  </span>
                  {isEditMode && (
                    <button
                      onClick={() => updateQuantity(item.id, item.amount + 1)}
                      className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="font-semibold">
                  {item.price.toLocaleString()}
                </div>
                {isEditMode && (
                  <div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add New Item Button */}
          {isEditMode && (
            <div className="mt-6">
              <button
                onClick={addNewItem}
                className="w-12 h-12 rounded-full bg-teal-600 hover:bg-teal-700 flex items-center justify-center text-white shadow-lg transition-colors"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          )}

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
            className="w-full bg-green-800 hover:bg-green-900 text-white py-4 rounded-lg font-medium transition-colors"
          >
            Create Quotation
          </button>
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