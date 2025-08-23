import React, { useEffect, useState } from "react";
import { Barcode, Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BarcodeScanner from "react-qr-barcode-scanner";
import type { Result } from "@zxing/library";

export default function AddMedicinePage() {
  const navigate = useNavigate();

  const [showScanner, setShowScanner] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [scannedData, setScannedData] = useState("Not Found");

  const [productTypes] = useState([
    "Tablet",
    "Capsule",
    "Syrup",
    "Injection",
  ] as string[]);
  const [units] = useState(["Pack", "Capsule", "Bottle", "Box"] as string[]);

  const [customProductType, setCustomProductType] = useState("");
  const [customUnit, setCustomUnit] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    productName: "",
    brand: "",
    friendlyId: "",
    barcode: "",
    isControlled: false,
    productType: "",
    unit: "",
  });

  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [image]);

  useEffect(() => {
    if (scannedData !== "Not Found" && hasScanned) {
      setFormData((s) => ({ ...s, barcode: scannedData }));
    }
  }, [scannedData, hasScanned]);

  const handleScan = (err: unknown, result?: Result) => {
    if (result && !hasScanned) {
      const code = result.getText();
      setScannedData(code);
      setHasScanned(true);
    } else if (!result && !hasScanned) {
      setScannedData("Not Found");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImage(file);
  };

  const handleRemoveImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImage(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = new FormData();
      const productTypeValue =
        formData.productType === "other"
          ? customProductType
          : formData.productType;
      const unitValue = formData.unit === "other" ? customUnit : formData.unit;

      payload.append("product_name", formData.productName ?? "");
      payload.append("brand", formData.brand ?? "");
      payload.append("friendlyid", formData.friendlyId ?? "");
      payload.append("barcode", formData.barcode ?? "");
      payload.append("iscontrolled", formData.isControlled ? "true" : "false");
      payload.append("producttype", productTypeValue ?? "");
      payload.append("unit", unitValue ?? "");

      if (image) payload.append("image", image, image.name);

      const res = await fetch("http://localhost:5000/inventory/add-medicine", {
        method: "POST",
        credentials: "include",
        body: payload,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to add medicine:", res.status, text);
        alert("Failed to add medicine");
        return;
      }

      const body = await res.json();
      console.log("Added:", body);
      navigate("/inventory");
    } catch (err) {
      console.error(err);
      alert("Error while adding medicine");
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4">
      <h1 className="text-3xl font-bold mb-8">Add Medication</h1>

      <div className="flex flex-col md:flex-row gap-6">
        <label className="bg-teal-50 rounded-lg p-6 flex flex-col items-center justify-center min-h-64 w-full md:w-1/3 border border-teal-100 cursor-pointer">
          {previewUrl ? (
            <div className="flex flex-col items-center gap-3">
              <img
                src={previewUrl}
                alt="preview"
                className="max-h-40 object-contain rounded-md"
              />
              <div className="flex items-center gap-2 text-teal-700">
                <span className="text-sm">{image?.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  className="text-red-600 hover:text-red-800"
                  aria-label="Remove image"
                >
                  <X />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="text-teal-600 mb-4">
                <Upload size={48} />
              </div>
              <p className="text-teal-600">Click to upload image</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="sr-only"
          />
        </label>

        <div className="w-full md:w-2/3">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Product Name..."
                value={formData.productName}
                onChange={(e) =>
                  setFormData({ ...formData, productName: e.target.value })
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
                  setFormData({ ...formData, productType: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Product Type</option>
                {productTypes.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
                <option value="other">Other</option>
              </select>
              {formData.productType === "other" && (
                <input
                  type="text"
                  placeholder="Enter other product type."
                  value={customProductType}
                  onChange={(e) => setCustomProductType(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mt-2"
                />
              )}

              <select
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Unit</option>
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
                <option value="other">Other</option>
              </select>
              {formData.unit === "other" && (
                <input
                  type="text"
                  placeholder="Enter custom unit..."
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mt-2"
                />
              )}

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Is this a controlled medicine?
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="isControlled"
                      value="false"
                      checked={formData.isControlled === false}
                      onChange={() =>
                        setFormData({ ...formData, isControlled: false })
                      }
                    />{" "}
                    No
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="isControlled"
                      value="true"
                      checked={formData.isControlled === true}
                      onChange={() =>
                        setFormData({ ...formData, isControlled: true })
                      }
                    />{" "}
                    Yes
                  </label>
                </div>
              </div>

              <input
                type="text"
                placeholder="Friendly Id..."
                value={formData.friendlyId}
                onChange={(e) =>
                  setFormData({ ...formData, friendlyId: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                placeholder="Barcode..."
                value={formData.barcode}
                onChange={(e) =>
                  setFormData({ ...formData, barcode: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />

              <button
                className="w-full p-3 bg-green-800 text-white rounded-lg hover:bg-green-900 transition"
                type="submit"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={() => {
            setShowScanner(!showScanner);
            setHasScanned(false);
            setScannedData("Not Found");
          }}
          className="flex items-center justify-center bg-white p-3 rounded-lg shadow-md border border-gray-200 w-full hover:bg-gray-50 transition"
        >
          <div className="flex flex-col items-center">
            <span className="text-sm font-medium mb-1">Add by barcode</span>
            <Barcode size={40} />
          </div>
        </button>
      </div>

      {showScanner && (
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-bold text-gray-800 mt-4">Scan Barcode</h2>
          <div className="relative mt-6 flex flex-col items-center w-fit p-4 bg-gray-50 rounded-xl shadow-md border border-gray-200">
            {!hasScanned && (
              <div className="w-full flex flex-row justify-end mb-2">
                <button
                  onClick={() => {
                    setShowScanner(false);
                    setHasScanned(false);
                    setScannedData("Not Found");
                  }}
                  className="ml-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1"
                  aria-label="Close Scanner"
                >
                  <X size={24} />
                </button>
              </div>
            )}

            {!hasScanned && (
              <BarcodeScanner width={400} height={400} onUpdate={handleScan} />
            )}

            <p className="mt-2 text-sm">
              Scanned Data:{" "}
              <span
                className={`font-bold ${
                  scannedData === "Not Found"
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {scannedData}
              </span>
            </p>

            {hasScanned && (
              <button
                onClick={() => {
                  setHasScanned(false);
                  setScannedData("Not Found");
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
  );
}
