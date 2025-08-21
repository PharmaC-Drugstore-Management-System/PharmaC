import { useState, useEffect } from "react";
import { Barcode, Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BarcodeScanner from "react-qr-barcode-scanner";
import type { Result } from "@zxing/library";

export default function AddMedicinePage() {
  const navigate = useNavigate();
  const [data, setData] = useState("Not Found");
  const [showScanner, setShowScanner] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [brand, setBrand] = useState(""); // Auto-filled brand
  const [products, setProducts] = useState<any[]>([]);
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [unit, setUnit] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    productName: "",
    brand: "",
    productType: "",
    unit: "",
    isControlled: false,
    friendlyId: "",
    barcode: ""
  });

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

  const getProduct = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/inventory/get-medicine"
      );
      const result = await response.json();
      if (result.data) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const getProductType = async () => {
    try {
      const response = await fetch("http://localhost:5000/type/get-type");
      const result = await response.json();
      if (result.data) {
        setProductTypes(result.data);
      }
    } catch (error) {
      console.error("Error fetching product types:", error);
    }
  };

  const getUnit = async () => {
    try {
      const response = await fetch("http://localhost:5000/unit/get-unit");
      const result = await response.json();
      if (result.data) {
        setUnit(result.data);
      }
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:5000/inventory/add-medicine",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const result = await response.json();
      if (result.success) {
        alert("Medicine added successfully!");
        // Optionally reset form or redirect
      } else {
        alert("Failed to add medicine.");
      }
    } catch (error) {
      console.error("Error adding medicine:", error);
      alert("An error occurred while adding medicine.");
    }
  };

  const handleScan = (err: unknown, result?: Result) => {
    if (result && !hasScanned) {
      const code = result.getText();
      setData(code);
      setHasScanned(true);
    } else if (!result && !hasScanned) {
      setData("Not Found");
    }
  };

  useEffect(() => {
    checkme();
    getProduct();
    getProductType();
    getUnit();
    if (data !== "Not Found" && hasScanned) {
      setBrand(data);
    }
  }, [data, hasScanned]);

  return (
    <>
      <div className="min-h-screen flex flex-col p-4">
        <h1 className="text-3xl font-bold mb-8">Add Medication</h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Upload Image Section */}
          <div className="bg-teal-50 rounded-lg p-6 flex flex-col items-center justify-center min-h-64 w-full md:w-1/3 border border-teal-100">
            <div className="text-teal-600 mb-4">
              <Upload size={48} />
            </div>
            <p className="text-teal-600">Upload image</p>
          </div>
          {/* Form Section */}

          <div className="w-full md:w-2/3">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Product Name..."
                    value={formData.productName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        productName: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="text"
                    placeholder="Brand..."
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                
                  <select
                    value={formData.productType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        productType: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Product Type</option>
                    {productTypes
                      .filter((p) => p.product_types !== null)
                      .map((p) => (
                        <option
                          key={p.product_types_id}
                          value={p.product_types_id}
                        >
                          {p.product_types_name}
                        </option>
                      ))}
                  </select>

                  <select
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Unit</option>
                    {unit
                      .filter((p) => p.unit !== null)
                      .map((p) => (
                        <option key={p.unit_id} value={p.unit_id}>
                          {p.unit_name}
                        </option>
                      ))}
                  </select>

                  <select
                    name="isControlled"
                    value={formData.isControlled ? "true" : "false"}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="" disabled hidden>
                      Select if Controlled
                    </option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Lot Id..."
                    value={formData.friendlyId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        friendlyId: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />

                
                  <button className="w-full p-3 bg-green-800 text-white rounded-lg hover:bg-green-900 transition">
                    Submit
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Barcode Scanner Toggle Button */}
        <div className="mt-6">
          <button
            onClick={() => setShowScanner(!showScanner)}
            className="flex items-center justify-center bg-white p-3 rounded-lg shadow-md border border-gray-200 w-full hover:bg-gray-50 transition"
          >
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium mb-1">Add by barcode</span>
              <Barcode size={40} />
            </div>
          </button>
        </div>

        {/* Barcode Scanner */}
        {showScanner && (
          <div className="flex flex-col items-center">
            <h2 className="text-lg font-bold text-gray-800 mt-4">
              Scan Barcode
            </h2>
            <div className="relative mt-6 flex flex-col items-center w-fit p-4 bg-gray-50 rounded-xl shadow-md border border-gray-200">
              {!hasScanned && (
                <div className="w-full flex flex-row justify-end mb-2">
                  <button
                    onClick={() => {
                      setShowScanner(false);
                      setHasScanned(false);
                      setData("Not Found");
                      setBrand("");
                    }}
                    className="ml-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1"
                    aria-label="Close Scanner"
                  >
                    <X size={24} />
                  </button>
                </div>
              )}

              {!hasScanned && (
                <BarcodeScanner
                  width={400}
                  height={400}
                  onUpdate={handleScan}
                />
              )}

              <p className="mt-2 text-sm">
                Scanned Data:{" "}
                <span
                  className={`font-bold ${
                    data === "Not Found" ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {data}
                </span>
              </p>

              {hasScanned && (
                <button
                  onClick={() => {
                    setHasScanned(false);
                    setData("Not Found");
                    setBrand("");
                  }}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Scan Again
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
