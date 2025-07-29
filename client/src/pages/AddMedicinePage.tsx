import { useState, useEffect } from "react";
import { Barcode, Upload, X } from "lucide-react";
import BarcodeScanner from "react-qr-barcode-scanner";
import type { Result } from "@zxing/library";

export default function AddMedicinePage() {
  const [data, setData] = useState("Not Found");
  const [showScanner, setShowScanner] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [brand, setBrand] = useState("");
  const [products, setProducts] = useState<any[]>([]);

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

  const handleScan = (err: unknown, result?: Result) => {
    if (result && !hasScanned) {
      const code = result.getText();
      setData(code);
      setHasScanned(true);
    } else if (!result && !hasScanned) {
      setData("Not Found");
    }
  };

  // Mocked brand info when a code is scanned
  useEffect(() => {
    getProduct();
    if (data !== "Not Found" && hasScanned) {
      setBrand(data); // Just display the scanned barcode as the brand
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

          <ul className="space-y-2">
            {products.map((p) => (
              <li key={p.product_id} className="border p-3 rounded shadow-sm">
                <p>
                  <strong>Product ID:</strong> {p.product_id}
                </p>
                <p>
                  <strong>Name:</strong> {p.product_name}
                </p>
                <p>
                  <strong>Brand:</strong> {p.brand}
                </p>
                <p>
                  <strong>Price:</strong> {p.price}
                </p>
                {/* แสดงฟิลด์อื่น ๆ ตามต้องการ */}
              </li>
            ))}
          </ul>

          {/* Form Section */}
          <div className="w-full md:w-2/3">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Product Name..."
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  placeholder="Brand..."
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  placeholder="Price..."
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  placeholder="Product Type..."
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  placeholder="Unit..."
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  placeholder="is controlled..."
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  placeholder="Expiry Date..."
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  placeholder="Amount..."
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                <button className="w-full p-3 bg-green-800 text-white rounded-lg hover:bg-green-900 transition">
                  Submit
                </button>
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
              {/* Header bar with X button */}
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

              {/* Barcode Scanner */}
              {!hasScanned && (
                <BarcodeScanner
                  width={400}
                  height={400}
                  onUpdate={handleScan}
                />
              )}

              {/* Scanned Result */}
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

              {/* Scan Again Button */}
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
