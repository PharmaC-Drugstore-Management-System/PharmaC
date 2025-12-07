import React, { useEffect, useState } from "react";
import { Barcode, Upload, X, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BarcodeScanner from "react-qr-barcode-scanner";
import type { Result } from "@zxing/library";
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL;
const SERVER_URL = API_URL.replace('/api', ''); // For static files (uploads)


export default function AddMedicinePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  
  // Check if we're in edit mode from state
  const editData = location.state?.editData;
  const isEditMode = !!editData;

  // Check if dark mode is enabled
  const isDark = document.documentElement.classList.contains('dark');

  const [showScanner, setShowScanner] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [scannedData, setScannedData] = useState("Not Found");

  const [productTypes] = useState([
    "N02",
    "R06",
    "A02",
    "J01",
  ] as string[]);
  
  const [units] = useState(["Pack", "Capsule", "Bottle", "Box"] as string[]);

  const [customProductType, setCustomProductType] = useState("");
  const [customUnit, setCustomUnit] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    productName: "",
    productGenericName:"",
    brand: "",
    friendlyId: "",
    barcode: "",
    isControlled: false,
    productType: "",
    unit: "",
  });

  // Barcode configuration
  const BARCODE_LENGTH = 13; // Standard EAN-13 barcode length

  // Load medicine data if in edit mode from passed state
  useEffect(() => {
    if (isEditMode && editData) {
      setFormData({
        productName: editData.product_name || "",
        productGenericName: editData.generic_name || "",
        brand: editData.brand || "",
        friendlyId: editData.friendlyid || "",
        barcode: editData.barcode || "",
        isControlled: editData.iscontrolled === true || editData.iscontrolled === "true",
        productType: editData.producttype || "",
        unit: editData.unit || "",
      });

      // Check if productType is custom
      if (editData.producttype && !productTypes.includes(editData.producttype)) {
        setFormData(prev => ({ ...prev, productType: "other" }));
        setCustomProductType(editData.producttype);
      }

      // Check if unit is custom
      if (editData.unit && !units.includes(editData.unit)) {
        setFormData(prev => ({ ...prev, unit: "other" }));
        setCustomUnit(editData.unit);
      }

      // Set existing image
      if (editData.image) {
        let imgUrl = editData.image;
        if (!imgUrl.startsWith('http')) {
          imgUrl = imgUrl.startsWith('/') ? `${SERVER_URL}${imgUrl}` : `${SERVER_URL}/${imgUrl}`;
        }
        setExistingImageUrl(imgUrl);
      }
    }
  }, [isEditMode]);

  // Handle barcode input - only allow numbers and enforce length
  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and limit to BARCODE_LENGTH
    if (/^\d*$/.test(value) && value.length <= BARCODE_LENGTH) {
      setFormData({ ...formData, barcode: value });
    }
  };

  // Validation function to check if form is valid
  const isFormValid = () => {
    const productTypeValue = formData.productType === "other" ? customProductType : formData.productType;
    const unitValue = formData.unit === "other" ? customUnit : formData.unit;

    return (
      formData.productName.trim() !== "" &&
      formData.productGenericName.trim() !== "" &&
      formData.brand.trim() !== "" &&
      productTypeValue.trim() !== "" &&
      unitValue.trim() !== ""
    );
  };

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
      // Only set barcode if it's numeric and within length limit
      if (/^\d+$/.test(scannedData) && scannedData.length <= BARCODE_LENGTH) {
        setFormData((s) => ({ ...s, barcode: scannedData }));
      } else {
        // Show error if scanned barcode is invalid
        alert(`Invalid barcode format. Must be ${BARCODE_LENGTH} digits or less and contain only numbers.`);
        setScannedData("Not Found");
        setHasScanned(false);
      }
    }
  }, [scannedData, hasScanned]);

  const handleScan = (_err: unknown, result?: Result) => {
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
    if (file) {
      setExistingImageUrl(null); // Clear existing image when new one is selected
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImage(null);
    setPreviewUrl(null);
    setExistingImageUrl(null);
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
      payload.append("product_generic_name", formData.productGenericName ?? "");
      payload.append("brand", formData.brand ?? "");
      payload.append("friendlyid", formData.friendlyId ?? "");
      payload.append("barcode", formData.barcode ?? "");
      payload.append("iscontrolled", formData.isControlled ? "true" : "false");
      payload.append("producttype", productTypeValue ?? "");
      payload.append("unit", unitValue ?? "");

      if (image) payload.append("image", image, image.name);

      const medicineId = editData?.product_id || editData?.id;
      const url = isEditMode 
        ? `${API_URL}/inventory/update-medicine/${medicineId}`
        : `${API_URL}/inventory/add-medicine`;
      
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        credentials: "include",
        body: payload,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(`Failed to ${isEditMode ? 'update' : 'add'} medicine:`, res.status, text);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: `Failed to ${isEditMode ? 'update' : 'add'} medicine`,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
        return;
      }

      const body = await res.json();
      console.log(isEditMode ? "Updated:" : "Added:", body);
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Medicine ${isEditMode ? 'updated' : 'added'} successfully`,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
      
      navigate("/inventory");
    } catch (err) {
      console.error(err);
      alert("Error while adding medicine");
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-3 sm:p-4 md:p-6 transition-colors duration-300 pb-20 md:pb-4"
      style={{ backgroundColor: isDark ? '#111827' : '#ffffff' }}>
      <div className="flex items-center gap-4 mb-4 sm:mb-6 md:mb-8">
        {isEditMode && (
          <button
            onClick={() => navigate("/inventory")}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            style={{ color: isDark ? 'white' : '#1f2937' }}
          >
            <ArrowLeft size={24} />
          </button>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold transition-colors duration-300"
          style={{ color: isDark ? 'white' : '#1f2937' }}>
          {isEditMode ? t('editMedicine') : t('addMedication')}
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
        <label className="rounded-lg p-4 sm:p-6 flex flex-col items-center justify-center min-h-48 sm:min-h-64 w-full md:w-1/3 border cursor-pointer transition-colors duration-300"
          style={{
            backgroundColor: isDark ? '#374151' : '#f0fdfa',
            borderColor: isDark ? '#4b5563' : '#5eead4'
          }}>
          {previewUrl ? (
            <div className="flex flex-col items-center gap-3">
              <img
                src={previewUrl}
                alt="preview"
                className="max-h-32 sm:max-h-40 object-contain rounded-md"
              />
              <div className="flex items-center gap-2 transition-colors duration-300"
                style={{ color: isDark ? '#60a5fa' : '#0f766e' }}>
                <span className="text-xs sm:text-sm truncate max-w-[150px] sm:max-w-none">{image?.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  className="text-red-600 hover:text-red-800 transition-colors duration-200 flex-shrink-0"
                  aria-label="Remove image"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ) : existingImageUrl ? (
            <div className="flex flex-col items-center gap-3">
              <img
                src={existingImageUrl}
                alt="existing medicine"
                className="max-h-32 sm:max-h-40 object-contain rounded-md"
              />
              <div className="flex items-center gap-2 transition-colors duration-300"
                style={{ color: isDark ? '#60a5fa' : '#0f766e' }}>
                <span className="text-xs sm:text-sm">Current Image</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  className="text-red-600 hover:text-red-800 transition-colors duration-200 flex-shrink-0"
                  aria-label="Remove image"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="mb-4 transition-colors duration-300"
                style={{ color: isDark ? '#60a5fa' : '#0d9488' }}>
                <Upload size={40} className="sm:w-12 sm:h-12" />
              </div>
              <p className="transition-colors duration-300 text-sm sm:text-base text-center"
                style={{ color: isDark ? '#60a5fa' : '#0d9488' }}>{t('clickToUploadImage')}</p>
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
          <div className="rounded-lg p-4 sm:p-6 shadow-sm border transition-colors duration-300"
            style={{
              backgroundColor: isDark ? '#374151' : 'white',
              borderColor: isDark ? '#4b5563' : '#e5e7eb'
            }}>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <input
                type="text"
                placeholder={t('productNamePlaceholder')}
                value={formData.productName}
                onChange={(e) =>
                  setFormData({ ...formData, productName: e.target.value })
                }
                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
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
                placeholder={t('productGenericName')}
                value={formData.productGenericName}
                onChange={(e) =>
                  setFormData({ ...formData, productGenericName: e.target.value })
                }
                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
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
                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
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
                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
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
                  className="w-full p-2.5 sm:p-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 mt-2"
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
                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
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
                  className="w-full p-2.5 sm:p-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 mt-2"
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
                <label className="block mb-2 text-sm sm:text-base font-medium transition-colors duration-300"
                  style={{ color: isDark ? '#d1d5db' : '#374151' }}>
                  {t('isControlledMedicine')}
                </label>
                <div className="flex gap-4 sm:gap-6">
                  <label className="flex items-center gap-2 text-sm sm:text-base transition-colors duration-300"
                    style={{ color: isDark ? '#d1d5db' : '#374151' }}>
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
                  <label className="flex items-center gap-2 text-sm sm:text-base transition-colors duration-300"
                    style={{ color: isDark ? '#d1d5db' : '#374151' }}>
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
                className="w-full p-2.5 sm:p-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
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
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('barcodePlaceholder')}
                  value={formData.barcode}
                  onChange={handleBarcodeChange}
                  maxLength={BARCODE_LENGTH}
                  inputMode="numeric"
                  pattern="\d*"
                  className="w-full p-2.5 sm:p-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
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
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
                  {formData.barcode.length}/{BARCODE_LENGTH}
                </div>
              </div>

              <button
                className="w-full p-2.5 sm:p-3 text-sm sm:text-base font-medium text-white rounded-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                type="submit"
                disabled={!isFormValid()}
                style={{
                  backgroundColor: !isFormValid() 
                    ? (isDark ? '#6b7280' : '#9ca3af')
                    : (isDark ? '#059669' : '#065f46')
                }}
                onMouseEnter={(e) => {
                  if (isFormValid()) {
                    const target = e.target as HTMLButtonElement;
                    target.style.backgroundColor = isDark ? '#047857' : '#064e3b';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isFormValid()) {
                    const target = e.target as HTMLButtonElement;
                    target.style.backgroundColor = isDark ? '#059669' : '#065f46';
                  }
                }}
              >
                {t('submit')}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mt-6">
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
            <span className="text-xs sm:text-sm font-medium mb-1 transition-colors duration-300"
              style={{ color: isDark ? '#d1d5db' : '#374151' }}>{t('addByBarcode')}</span>
            <div style={{ color: isDark ? '#60a5fa' : '#374151' }}>
              <Barcode size={32} className="sm:w-10 sm:h-10" />
            </div>
          </div>
        </button>
      </div>

      {showScanner && (
        <div className="flex flex-col items-center">
          <h2 className="text-base sm:text-lg font-bold mt-4 transition-colors duration-300"
            style={{ color: isDark ? '#d1d5db' : '#1f2937' }}>{t('scanBarcode')}</h2>
          <div className="relative mt-4 sm:mt-6 flex flex-col items-center w-full max-w-md p-3 sm:p-4 rounded-xl shadow-md border transition-colors duration-300"
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
                  <X size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>
            )}

            {!hasScanned && (
              <div className="w-full max-w-sm mx-auto">
                <BarcodeScanner 
                  width={Math.min(window.innerWidth - 80, 400)} 
                  height={Math.min(window.innerWidth - 80, 400)} 
                  onUpdate={handleScan} 
                />
              </div>
            )}

            <p className="mt-2 text-xs sm:text-sm transition-colors duration-300 text-center"
              style={{ color: isDark ? '#d1d5db' : '#374151' }}>
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
                className="mt-3 px-4 py-2 text-sm sm:text-base text-white rounded-lg transition-all duration-200"
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
