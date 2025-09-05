import React, { useEffect, useState } from "react";
import { Barcode, Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BarcodeScanner from "react-qr-barcode-scanner";
import type { Result } from "@zxing/library";
const API_URL = import.meta.env.VITE_API_URL;
export default function AddMedicinePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Check if dark mode is enabled
  const isDark = document.documentElement.classList.contains('dark');

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

      const res = await fetch(`${API_URL}/inventory/add-medicine`, {
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
    <div className="min-h-screen flex flex-col p-4 transition-colors duration-300"
         style={{backgroundColor: isDark ? '#111827' : '#ffffff'}}>
      <h1 className="text-3xl font-bold mb-8 transition-colors duration-300"
          style={{color: isDark ? 'white' : '#1f2937'}}>{t('addMedication')}</h1>

      <div className="flex flex-col md:flex-row gap-6">
        <label className="rounded-lg p-6 flex flex-col items-center justify-center min-h-64 w-full md:w-1/3 border cursor-pointer transition-colors duration-300"
               style={{
                 backgroundColor: isDark ? '#374151' : '#f0fdfa',
                 borderColor: isDark ? '#4b5563' : '#5eead4'
               }}>
          {previewUrl ? (
            <div className="flex flex-col items-center gap-3">
              <img
                src={previewUrl}
                alt="preview"
                className="max-h-40 object-contain rounded-md"
              />
              <div className="flex items-center gap-2 transition-colors duration-300"
                   style={{color: isDark ? '#60a5fa' : '#0f766e'}}>
                <span className="text-sm">{image?.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  className="text-red-600 hover:text-red-800 transition-colors duration-200"
                  aria-label="Remove image"
                >
                  <X />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="mb-4 transition-colors duration-300"
                   style={{color: isDark ? '#60a5fa' : '#0d9488'}}>
                <Upload size={48} />
              </div>
              <p className="transition-colors duration-300"
                 style={{color: isDark ? '#60a5fa' : '#0d9488'}}>{t('clickToUploadImage')}</p>
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
          <div className="rounded-lg p-6 shadow-sm border transition-colors duration-300"
               style={{
                 backgroundColor: isDark ? '#374151' : 'white',
                 borderColor: isDark ? '#4b5563' : '#e5e7eb'
               }}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder={t('productNamePlaceholder')}
                value={formData.productName}
                onChange={(e) =>
                  setFormData({ ...formData, productName: e.target.value })
                }
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                style={{
                  backgroundColor: isDark ? '#4b5563' : 'white',
                  borderColor: isDark ? '#6b7280' : '#d1d5db',
                  color: isDark ? 'white' : '#1f2937'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = isDark ? '#60a5fa' : '#10b981';
                  e.target.style.boxShadow = isDark ? '0 0 0 2px rgba(96, 165, 250, 0.2)' : '0 0 0 2px rgba(16, 185, 129, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isDark ? '#6b7280' : '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <input
                type="text"
                placeholder={t('brandPlaceholder')}
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                style={{
                  backgroundColor: isDark ? '#4b5563' : 'white',
                  borderColor: isDark ? '#6b7280' : '#d1d5db',
                  color: isDark ? 'white' : '#1f2937'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = isDark ? '#60a5fa' : '#10b981';
                  e.target.style.boxShadow = isDark ? '0 0 0 2px rgba(96, 165, 250, 0.2)' : '0 0 0 2px rgba(16, 185, 129, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isDark ? '#6b7280' : '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />

              <select
                value={formData.productType}
                onChange={(e) =>
                  setFormData({ ...formData, productType: e.target.value })
                }
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                style={{
                  backgroundColor: isDark ? '#4b5563' : 'white',
                  borderColor: isDark ? '#6b7280' : '#d1d5db',
                  color: isDark ? 'white' : '#1f2937'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = isDark ? '#60a5fa' : '#10b981';
                  e.target.style.boxShadow = isDark ? '0 0 0 2px rgba(96, 165, 250, 0.2)' : '0 0 0 2px rgba(16, 185, 129, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isDark ? '#6b7280' : '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">{t('selectProductType')}</option>
                {productTypes.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
                <option value="other">{t('other')}</option>
              </select>
              {formData.productType === "other" && (
                <input
                  type="text"
                  placeholder={t('enterOtherProductType')}
                  value={customProductType}
                  onChange={(e) => setCustomProductType(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 mt-2"
                  style={{
                    backgroundColor: isDark ? '#4b5563' : 'white',
                    borderColor: isDark ? '#6b7280' : '#d1d5db',
                    color: isDark ? 'white' : '#1f2937'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = isDark ? '#60a5fa' : '#10b981';
                    e.target.style.boxShadow = isDark ? '0 0 0 2px rgba(96, 165, 250, 0.2)' : '0 0 0 2px rgba(16, 185, 129, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDark ? '#6b7280' : '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              )}

              <select
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                style={{
                  backgroundColor: isDark ? '#4b5563' : 'white',
                  borderColor: isDark ? '#6b7280' : '#d1d5db',
                  color: isDark ? 'white' : '#1f2937'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = isDark ? '#60a5fa' : '#10b981';
                  e.target.style.boxShadow = isDark ? '0 0 0 2px rgba(96, 165, 250, 0.2)' : '0 0 0 2px rgba(16, 185, 129, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isDark ? '#6b7280' : '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">{t('selectUnit')}</option>
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
                <option value="other">{t('other')}</option>
              </select>
              {formData.unit === "other" && (
                <input
                  type="text"
                  placeholder={t('enterCustomUnit')}
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 mt-2"
                  style={{
                    backgroundColor: isDark ? '#4b5563' : 'white',
                    borderColor: isDark ? '#6b7280' : '#d1d5db',
                    color: isDark ? 'white' : '#1f2937'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = isDark ? '#60a5fa' : '#10b981';
                    e.target.style.boxShadow = isDark ? '0 0 0 2px rgba(96, 165, 250, 0.2)' : '0 0 0 2px rgba(16, 185, 129, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDark ? '#6b7280' : '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              )}

              <div>
                <label className="block mb-2 font-medium transition-colors duration-300"
                       style={{color: isDark ? '#d1d5db' : '#374151'}}>
                  {t('isControlledMedicine')}
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 transition-colors duration-300"
                         style={{color: isDark ? '#d1d5db' : '#374151'}}>
                    <input
                      type="radio"
                      name="isControlled"
                      value="false"
                      checked={formData.isControlled === false}
                      onChange={() =>
                        setFormData({ ...formData, isControlled: false })
                      }
                      className="text-green-600 focus:ring-green-500"
                    />{" "}
                    {t('no')}
                  </label>
                  <label className="flex items-center gap-2 transition-colors duration-300"
                         style={{color: isDark ? '#d1d5db' : '#374151'}}>
                    <input
                      type="radio"
                      name="isControlled"
                      value="true"
                      checked={formData.isControlled === true}
                      onChange={() =>
                        setFormData({ ...formData, isControlled: true })
                      }
                      className="text-green-600 focus:ring-green-500"
                    />{" "}
                    {t('yes')}
                  </label>
                </div>
              </div>

              <input
                type="text"
                placeholder={t('friendlyIdPlaceholder')}
                value={formData.friendlyId}
                onChange={(e) =>
                  setFormData({ ...formData, friendlyId: e.target.value })
                }
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                style={{
                  backgroundColor: isDark ? '#4b5563' : 'white',
                  borderColor: isDark ? '#6b7280' : '#d1d5db',
                  color: isDark ? 'white' : '#1f2937'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = isDark ? '#60a5fa' : '#10b981';
                  e.target.style.boxShadow = isDark ? '0 0 0 2px rgba(96, 165, 250, 0.2)' : '0 0 0 2px rgba(16, 185, 129, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isDark ? '#6b7280' : '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <input
                type="text"
                placeholder={t('barcodePlaceholder')}
                value={formData.barcode}
                onChange={(e) =>
                  setFormData({ ...formData, barcode: e.target.value })
                }
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                style={{
                  backgroundColor: isDark ? '#4b5563' : 'white',
                  borderColor: isDark ? '#6b7280' : '#d1d5db',
                  color: isDark ? 'white' : '#1f2937'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = isDark ? '#60a5fa' : '#10b981';
                  e.target.style.boxShadow = isDark ? '0 0 0 2px rgba(96, 165, 250, 0.2)' : '0 0 0 2px rgba(16, 185, 129, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isDark ? '#6b7280' : '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />

              <button
                className="w-full p-3 text-white rounded-lg transition-all duration-200"
                type="submit"
                style={{
                  backgroundColor: isDark ? '#059669' : '#065f46'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.backgroundColor = isDark ? '#047857' : '#064e3b';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.backgroundColor = isDark ? '#059669' : '#065f46';
                }}
              >
                {t('submit')}
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
          className="flex items-center justify-center p-3 rounded-lg shadow-md border w-full transition-all duration-200"
          style={{
            backgroundColor: isDark ? '#374151' : 'white',
            borderColor: isDark ? '#4b5563' : '#e5e7eb'
          }}
          onMouseEnter={(e) => {
            const target = e.target as HTMLButtonElement;
            target.style.backgroundColor = isDark ? '#4b5563' : '#f9fafb';
          }}
          onMouseLeave={(e) => {
            const target = e.target as HTMLButtonElement;
            target.style.backgroundColor = isDark ? '#374151' : 'white';
          }}
        >
          <div className="flex flex-col items-center">
            <span className="text-sm font-medium mb-1 transition-colors duration-300"
                  style={{color: isDark ? '#d1d5db' : '#374151'}}>{t('addByBarcode')}</span>
            <div style={{color: isDark ? '#60a5fa' : '#374151'}}>
              <Barcode size={40} />
            </div>
          </div>
        </button>
      </div>

      {showScanner && (
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-bold mt-4 transition-colors duration-300"
              style={{color: isDark ? '#d1d5db' : '#1f2937'}}>{t('scanBarcode')}</h2>
          <div className="relative mt-6 flex flex-col items-center w-fit p-4 rounded-xl shadow-md border transition-colors duration-300"
               style={{
                 backgroundColor: isDark ? '#374151' : '#f9fafb',
                 borderColor: isDark ? '#4b5563' : '#e5e7eb'
               }}>
            {!hasScanned && (
              <div className="w-full flex flex-row justify-end mb-2">
                <button
                  onClick={() => {
                    setShowScanner(false);
                    setHasScanned(false);
                    setScannedData("Not Found");
                  }}
                  className="ml-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition-colors duration-200"
                  aria-label="Close Scanner"
                >
                  <X size={24} />
                </button>
              </div>
            )}

            {!hasScanned && (
              <BarcodeScanner width={400} height={400} onUpdate={handleScan} />
            )}

            <p className="mt-2 text-sm transition-colors duration-300"
               style={{color: isDark ? '#d1d5db' : '#374151'}}>
              {t('scannedData')}{" "}
              <span
                className="font-bold"
                style={{
                  color: scannedData === "Not Found" ? '#dc2626' : '#059669'
                }}
              >
                {scannedData === "Not Found" ? t('notFound') : scannedData}
              </span>
            </p>

            {hasScanned && (
              <button
                onClick={() => {
                  setHasScanned(false);
                  setScannedData("Not Found");
                }}
                className="mt-3 px-4 py-2 text-white rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: isDark ? '#2563eb' : '#1d4ed8'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.backgroundColor = isDark ? '#1d4ed8' : '#1e40af';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.backgroundColor = isDark ? '#2563eb' : '#1d4ed8';
                }}
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
