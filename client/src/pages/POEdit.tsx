import { useEffect, useState, useMemo } from "react";
import { Plus, Minus, PlusCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const API_URL = import.meta.env.VITE_API_URL || "/api";
const SERVER_URL = API_URL.replace('/api', ''); // For static files (uploads)

type Supplier = {
  supplier_id: number;
  name: string;
  tax_id?: string;
  address?: string;
  description?: string;
};

type ProductSupplier = {
  supplier_id: number;
  supplier_name: string;
  price: number; // ref only
  is_active: boolean;
};

type OrderItem = {
  id: number;
  name: string;
  brand: string;
  amount: number;
  unit: string;                 // unit to BUY (user selects)
  price?: number | null;        // supplier price to BUY (user enters)
  image: string;
  isCustom?: boolean;
  suppliers?: ProductSupplier[];
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

  // i18n
  const { t, i18n } = useTranslation();
  useEffect(() => {
    // add TH + EN strings (safe if already exists)
    const th = {
      po: {
        title: "ใบสั่งซื้อ",
        inventory: "สต็อกสินค้า",
        addSupplier: "เพิ่มผู้จำหน่าย",
        addMedicine: "เพิ่มยาใหม่",
        allSuppliers: "ผู้จำหน่ายทั้งหมด",
        allBrands: "ทุกแบรนด์",
        clear: "ล้าง",
        countOf: "{{count}} จาก {{total}} รายการ",
        searchPlaceholder: "ค้นหาด้วยชื่อ แบรนด์ หรือรหัส...",
        select: "เลือก",
        productName: "ชื่อสินค้า",
        productId: "รหัสสินค้า",
        noItemsFilter: "ไม่พบรายการที่ตรงกับเงื่อนไข",
        noItems: "ยังไม่มีสินค้าในสต็อก",
        selectedItemsTitle: "รายการที่เลือกสำหรับออกใบสั่งซื้อ",
        selectedCount: "เลือกแล้ว: {{count}}",
        tip: "คำแนะนำ: กรอกราคาซื้อและเลือกหน่วยที่จะสั่งซื้อสำหรับทุกรายการที่เลือก",
        remove: "เอาออก",
        orderQty: "จำนวนสั่งซื้อ",
        price: "ราคา (บาท)",
        total: "มูลค่ารวม:",
        createQuotation: "สร้างเอกสาร",
        copyText: "คัดลอกข้อความ",
        // Modal: Add medicine
        modalAddMedTitle: "เพิ่มยาใหม่",
        productNameLabel: "ชื่อสินค้า *",
        brandLabel: "แบรนด์ *",
        barcodeLabel: "บาร์โค้ด",
        friendlyIdLabel: "รหัสใช้ง่าย",
        productTypeLabel: "ชนิดสินค้า *",
        customOther: "อื่น ๆ (กำหนดเอง)",
        customTypePlaceholder: "กรอกชนิดสินค้า",
        unitLabel: "หน่วย *",
        customUnitPlaceholder: "กรอกหน่วย",
        imageLabel: "รูปภาพ/ไอคอน",
        controlled: "ยาควบคุม",
        supplierInfo: "ข้อมูลผู้จำหน่าย (ไม่บังคับ)",
        selectSupplier: "เลือกผู้จำหน่าย",
        costPerUnit: "ต้นทุน/หน่วย (บาท)",
        needCost: "โปรดกรอกราคาต้นทุนเพื่อผูกกับผู้จำหน่าย",
        cancel: "ยกเลิก",
        addMedBtn: "เพิ่มรายการ",
        // Modal: Add supplier
        modalAddSupplierTitle: "เพิ่มผู้จำหน่าย",
        supplierNameLabel: "ชื่อผู้จำหน่าย *",
        taxIdLabel: "เลขประจำตัวผู้เสียภาษี",
        addressLabel: "ที่อยู่",
        descLabel: "คำอธิบาย",
        // Errors
        errSupplierName: "โปรดระบุชื่อผู้จำหน่าย",
        errLoadProducts: "โหลดข้อมูลสินค้าไม่สำเร็จ",
        errNeedSelect: "โปรดเลือกรายการอย่างน้อย 1 รายการเพื่อสร้างเอกสาร",
        errNeedPriceUnit: "โปรดกรอกราคาและเลือกหน่วยสำหรับทุกรายการที่เลือก",
      }
    };
    const en = {
      po: {
        title: "Purchase Order",
        inventory: "Inventory",
        addSupplier: "Add New Supplier",
        addMedicine: "Add New Medicine",
        allSuppliers: "All Suppliers",
        allBrands: "All Brands",
        clear: "Clear",
        countOf: "{{count}} of {{total}} items",
        searchPlaceholder: "Search by name, brand, or ID...",
        select: "Select",
        productName: "Product Name",
        productId: "Product ID",
        noItemsFilter: "No items match your filter criteria.",
        noItems: "No items available in inventory.",
        selectedItemsTitle: "Selected Items for Purchase Order",
        selectedCount: "Selected: {{count}}",
        tip: "Tip: Enter a price and select the unit to buy for each selected item.",
        remove: "Remove",
        orderQty: "Order Quantity",
        price: "Price (THB)",
        total: "Total Order Value:",
        createQuotation: "Create Quotation",
        copyText: "Copy text",
        modalAddMedTitle: "Add New Medicine",
        productNameLabel: "Product Name *",
        brandLabel: "Brand *",
        barcodeLabel: "Barcode",
        friendlyIdLabel: "Friendly ID",
        productTypeLabel: "Product Type *",
        customOther: "Other (Custom)",
        customTypePlaceholder: "Enter custom product type",
        unitLabel: "Unit *",
        customUnitPlaceholder: "Enter custom unit",
        imageLabel: "Image/Icon",
        controlled: "Controlled Medicine",
        supplierInfo: "Supplier Information (Optional)",
        selectSupplier: "Select Supplier",
        costPerUnit: "Cost/Unit (THB)",
        needCost: "Please enter cost to create supplier relationship",
        cancel: "Cancel",
        addMedBtn: "Add Medicine",
        modalAddSupplierTitle: "Add New Supplier",
        supplierNameLabel: "Supplier Name *",
        taxIdLabel: "Tax ID",
        addressLabel: "Address",
        descLabel: "Description",
        errSupplierName: "Please enter supplier name.",
        errLoadProducts: "Failed to load products",
        errNeedSelect: "Please select at least one item to create a quotation.",
        errNeedPriceUnit: "Please enter a Price and select a Unit for all selected items.",
      }
    };
    i18n.addResourceBundle('th', 'translation', th, true, true);
    i18n.addResourceBundle('en', 'translation', en, true, true);
  }, [i18n]);

  // proper image source
  const getImageSrc = useMemo(() => {
    return (imageUrl: string) => {
      if (!imageUrl) return null;
      if (imageUrl.startsWith("http")) return imageUrl;
      if (imageUrl.startsWith("uploads/")) return `${SERVER_URL}/${imageUrl}`;
      if (imageUrl.length <= 4) return null; // emoji/text
      return `${SERVER_URL}${imageUrl}`;
    };
  }, []);

  // suppliers
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [newSupplierForm, setNewSupplierForm] = useState({
    name: '',
    tax_id: '',
    address: '',
    description: ''
  });

  // new medicine modal
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

  // supplier for new medicine
  const [selectedSupplierForNewMedicine, setSelectedSupplierForNewMedicine] = useState<number | null>(null);
  const [newMedicineCost, setNewMedicineCost] = useState<string>('');

  // types/units
  const [productTypes] = useState(["Tablet", "Capsule", "Syrup", "Injection"] as string[]);
  const [units] = useState(["Pack", "Capsule", "Bottle", "Box"] as string[]);
  const [customProductType, setCustomProductType] = useState("");
  const [customUnit, setCustomUnit] = useState("");

  // filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState("");

  const navigate = useNavigate();
  const isDark = document.documentElement.classList.contains('dark');

  useEffect(() => {
    loadData();
    loadSuppliers();
    checkme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch(`${API_URL}/products-with-suppliers`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const products = await res.json();
        const formattedItems = products.map((item: any): OrderItem => ({
          id: item.id,
          name: item.name || "Unknown Product",
          brand: item.brand || "Unknown Brand",
          price: null,        // user enters
          amount: 1,
          unit: "",           // user selects
          image: item.image || "💊",
          suppliers: item.suppliers || []
        }));
        setOrderItems(formattedItems);
      } else {
        const fallbackRes = await fetch(`${API_URL}/inventory/get-medicine`, {
          method: "GET",
          credentials: "include",
        });
        const fallbackResult = await fallbackRes.json();
        const formattedItems = fallbackResult.data.map((item: any): OrderItem => ({
          id: item.product_id,
          name: item.product_name || "Unknown Product",
          brand: item.brand || "Unknown Brand",
          price: null,
          amount: 1,
          unit: "",
          image: "💊",
          suppliers: []
        }));
        setOrderItems(formattedItems);
      }
    } catch (error) {
      console.log("Error loading products:", error);
      setErrorMessage(t('po.errLoadProducts'));
    }
  };

  const loadSuppliers = async () => {
    try {
      const res = await fetch(`${API_URL}/suppliers`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const suppliersData = await res.json();
        setSuppliers(suppliersData);
      }
    } catch (error) {
      console.log("Error loading suppliers:", error);
    }
  };

  const handleItemSelection = (id: number) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(id)) newSelectedItems.delete(id);
    else {
      newSelectedItems.add(id);
      setOrderItems(curr =>
        curr.map(it => it.id === id ? { ...it, price: it.price ?? null, unit: it.unit || "" } : it)
      );
    }
    setSelectedItems(newSelectedItems);
    if (newSelectedItems.size > 0) setErrorMessage("");
  };

  const updateQuantity = (id: number, newAmount: number) => {
    if (!selectedItems.has(id)) return;
    setOrderItems(
      orderItems.map((item) =>
        item.id === id ? { ...item, amount: Math.max(1, newAmount) } : item
      )
    );
  };

  const getFilteredItems = () => {
    return orderItems.filter(item => {
      const matchesSearch =
        searchTerm === "" ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toString().includes(searchTerm);

      const matchesBrand = filterBrand === "" || item.brand === filterBrand;

      const matchesSupplier = selectedSupplierId === null ||
        (item.suppliers && item.suppliers.some(supplier => supplier.supplier_id === selectedSupplierId));

      return matchesSearch && matchesBrand && matchesSupplier;
    });
  };

  const getUniqueBrands = () => {
    const brands = [...new Set(orderItems.map(item => item.brand))];
    return brands.sort();
  };

  const getTotalValue = () => {
    return orderItems
      .filter(item => selectedItems.has(item.id) && item.price != null)
      .reduce((total, item) => total + item.amount * (item.price as number), 0);
  };

  const copyOrderText = () => {
    const selected = orderItems.filter(i => selectedItems.has(i.id));
    const orderText = selected
      .map((item) =>
        `${item.name || "Unknown Product"} (${item.id}) - ${item.amount} ${item.unit || "(unit?)"} @ ${(item.price ?? 0).toLocaleString()} THB`
      )
      .join("\n");
    navigator.clipboard.writeText(orderText);
    alert("Order copied to clipboard!");
  };

  const createQuotation = () => {
    if (selectedItems.size === 0) {
      setErrorMessage(t('po.errNeedSelect'));
      return;
    }

    const invalid = orderItems
      .filter(i => selectedItems.has(i.id))
      .filter(i => i.price == null || i.unit.trim() === "");

    if (invalid.length > 0) {
      setErrorMessage(t('po.errNeedPriceUnit'));
      return;
    }
    setErrorMessage("");

    const selectedOrderItems = orderItems
      .filter(item => selectedItems.has(item.id))
      .map(item => {
        const supplierInfo = selectedSupplierId
          ? suppliers.find(s => s.supplier_id === selectedSupplierId)
          : null;

        return {
          id: item.id,
          name: item.name,
          brand: item.brand,
          unit: item.unit,
          image: item.image,
          quantity: item.amount,
          price: item.price, // user-entered supplier price
          supplier_id: selectedSupplierId || item.suppliers?.[0]?.supplier_id,
          supplier_name: supplierInfo?.name || item.suppliers?.[0]?.supplier_name
        };
      });

    const selectedSupplierData = selectedSupplierId
      ? suppliers.find(s => s.supplier_id === selectedSupplierId)
      : null;

    navigate('/poform', {
      state: {
        selectedOrderItems,
        selectedSupplier: selectedSupplierData
      }
    });
  };

  const handleSupplierFormChange = (field: string, value: string) => {
    setNewSupplierForm(prev => ({ ...prev, [field]: value }));
  };

  const addNewSupplier = async () => {
    if (!newSupplierForm.name.trim()) {
      setErrorMessage(t('po.errSupplierName'));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/suppliers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: newSupplierForm.name,
          tax_id: newSupplierForm.tax_id || null,
          address: newSupplierForm.address || null,
          description: newSupplierForm.description || null
        })
      });

      if (response.ok) {
        await loadSuppliers();
        setShowAddSupplierModal(false);
        setNewSupplierForm({ name: '', tax_id: '', address: '', description: '' });
        setErrorMessage("");
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Failed to add supplier");
      }
    } catch (error) {
      console.error("Error adding supplier:", error);
      setErrorMessage("Failed to add supplier. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSupplierForm = () => {
    setNewSupplierForm({ name: '', tax_id: '', address: '', description: '' });
    setErrorMessage("");
  };

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
    setSelectedSupplierForNewMedicine(null);
    setNewMedicineCost('');
  };

  const handleFormChange = (field: keyof NewMedicineForm, value: string | boolean) => {
    setNewMedicineForm(prev => ({ ...prev, [field]: value }));
  };

  const addNewMedicine = async () => {
    if (!newMedicineForm.product_name.trim() || !newMedicineForm.brand.trim() || !newMedicineForm.producttype.trim() ||
        !newMedicineForm.unit.trim()) {
      setErrorMessage(t('po.errNeedPriceUnit'));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/inventory/add-micine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        const productId = result.data?.product_id || result.product_id;

        if (selectedSupplierForNewMedicine && newMedicineCost && productId) {
          try {
            const supplierResponse = await fetch(`${API_URL}/product-supplier`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                product_id: productId,
                supplier_id: selectedSupplierForNewMedicine,
                cost: parseFloat(newMedicineCost), // DB field still named cost
                is_active: true
              })
            });
            if (!supplierResponse.ok) console.warn("Failed to create product-supplier relationship");
          } catch (error) {
            console.warn("Error creating product-supplier relationship:", error);
          }
        }

        const supplierData = selectedSupplierForNewMedicine
          ? suppliers.find(s => s.supplier_id === selectedSupplierForNewMedicine)
          : null;

        const newOrderItem: OrderItem = {
          id: productId || Date.now(),
          name: newMedicineForm.product_name,
          brand: newMedicineForm.brand,
          amount: 1,
          unit: "",           // user selects later
          price: null,        // user enters later
          image: newMedicineForm.image,
          isCustom: true,
          suppliers: supplierData && newMedicineCost ? [{
            supplier_id: supplierData.supplier_id,
            supplier_name: supplierData.name,
            price: parseFloat(newMedicineCost),
            is_active: true
          }] : []
        };

        setOrderItems(prev => [...prev, newOrderItem]);
        setSelectedItems(prev => new Set([...prev, newOrderItem.id]));
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
      const authme = await fetch(`${API_URL}/me`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await authme.json();
      if (authme.status === 401 || authme.status === 403) {
        navigate('/login');
        return;
      }
      console.log('Authme data:', data);
    } catch (error) {
      console.log('Error', error);
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300"
         style={{backgroundColor: isDark ? '#111827' : '#f9fafb'}}>
      <div className="p-6">
        <h2 className="text-3xl font-light mb-8 transition-colors duration-300"
            style={{color: isDark ? 'white' : '#1f2937'}}>
          {t('po.title')}
        </h2>

        {/* Inventory */}
        <div className="rounded-lg shadow-sm p-6 mb-6 transition-colors duration-300"
             style={{backgroundColor: isDark ? '#374151' : 'white'}}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-semibold" style={{color: isDark ? 'white' : '#1f2937'}}>{t('po.inventory')}</h3>
              <div className="text-sm px-2 py-1 rounded"
                   style={{ color: isDark ? '#d1d5db' : '#4b5563', backgroundColor: isDark ? '#4b5563' : '#f3f4f6' }}>
                {t('po.countOf', { count: getFilteredItems().length, total: orderItems.length })}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddSupplierModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2 transition-colors"
              >
                <PlusCircle size={16} />
                {t('po.addSupplier')}
              </button>
              <button
                onClick={() => setShowAddMedicineModal(true)}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2 transition-colors"
              >
                <PlusCircle size={16} />
                {t('po.addMedicine')}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={t('po.searchPlaceholder')!}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                style={{
                  backgroundColor: isDark ? '#4b5563' : 'white',
                  borderColor: isDark ? '#6b7280' : '#d1d5db',
                  color: isDark ? 'white' : '#1f2937'
                }}
              />
            </div>
            <div className="w-48">
              <select
                value={selectedSupplierId || ""}
                onChange={(e) => setSelectedSupplierId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2 border rounded-lg"
                style={{
                  backgroundColor: isDark ? '#4b5563' : 'white',
                  borderColor: isDark ? '#6b7280' : '#d1d5db',
                  color: isDark ? 'white' : '#1f2937'
                }}
              >
                <option value="">{t('po.allSuppliers')}</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.supplier_id} value={supplier.supplier_id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-48">
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                style={{
                  backgroundColor: isDark ? '#4b5563' : 'white',
                  borderColor: isDark ? '#6b7280' : '#d1d5db',
                  color: isDark ? 'white' : '#1f2937'
                }}
              >
                <option value="">{t('po.allBrands')}</option>
                {getUniqueBrands().map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => { setSearchTerm(""); setFilterBrand(""); setSelectedSupplierId(null); }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              {t('po.clear')}
            </button>
          </div>

          {/* Inventory header (Price column removed) */}
          <div className="grid grid-cols-4 gap-4 pb-4 border-b text-sm font-medium"
               style={{ borderColor: isDark ? '#4b5563' : '#e5e7eb', color: isDark ? '#d1d5db' : '#4b5563' }}>
            <div>{t('po.select')}</div>
            <div className="col-span-2">{t('po.productName')}</div>
            <div>{t('po.productId')}</div>
          </div>

          {/* Inventory list */}
          <div className="mt-4">
            <div className="max-h-60 overflow-y-auto divide-y rounded" style={{borderColor: isDark ? '#4b5563' : '#f3f4f6'}}>
              {getFilteredItems().length === 0 ? (
                <div className="text-center py-8" style={{color: isDark ? '#9ca3af' : '#6b7280'}}>
                  {searchTerm || filterBrand ? t('po.noItemsFilter') : t('po.noItems')}
                </div>
              ) : (
                getFilteredItems().map((item) => (
                  <div key={item.id} className="grid grid-cols-4 gap-4 items-center py-3 px-2"
                       style={{borderColor: isDark ? '#4b5563' : '#f3f4f6'}}>
                    <div>
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => handleItemSelection(item.id)}
                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 focus:ring-2"
                        style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6', borderColor: isDark ? '#4b5563' : '#d1d5db' }}
                      />
                    </div>
                    <div className="col-span-2 flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-lg"
                           style={{backgroundColor: isDark ? '#4b5563' : '#f3f4f6'}}>
                        {getImageSrc(item.image) ? (
                          <img src={getImageSrc(item.image)!} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span>{item.image}</span>
                        )}
                      </div>
                      <div>
                        <span className="font-medium" style={{color: isDark ? 'white' : '#1f2937'}}>{item.name}</span>
                        <div className="text-sm" style={{color: isDark ? '#9ca3af' : '#6b7280'}}>{item.brand}</div>
                        {item.suppliers && item.suppliers.length > 0 && (
                          <div className="text-xs mt-1" style={{color: isDark ? '#60a5fa' : '#2563eb'}}>
                            Suppliers: {item.suppliers.map(s => `${s.supplier_name} (฿${s.price})`).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="transition-colors" style={{color: isDark ? '#d1d5db' : '#4b5563'}}>{item.id}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Selected Items */}
        <div className="rounded-lg shadow-sm p-6" style={{backgroundColor: isDark ? '#374151' : 'white'}}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-semibold" style={{color: isDark ? 'white' : '#1f2937'}}>{t('po.selectedItemsTitle')}</h3>
              <div className="text-sm border px-2 py-1 rounded"
                   style={{ color: isDark ? '#d1d5db' : '#4b5563', backgroundColor: isDark ? '#374151' : 'white', borderColor: isDark ? '#4b5563' : '#e5e7eb' }}>
                {t('po.selectedCount', { count: selectedItems.size })}
              </div>
            </div>
          </div>

          {selectedItems.size > 0 && (
            <p className="text-sm mb-3" style={{color: isDark ? '#fbbf24' : '#b45309'}}>
              {t('po.tip')}
            </p>
          )}

          {/* Header */}
          <div className="grid grid-cols-6 gap-4 pb-4 border-b text-sm font-medium"
               style={{ borderColor: isDark ? '#4b5563' : '#e5e7eb', color: isDark ? '#d1d5db' : '#4b5563' }}>
            <div>{t('po.remove')}</div>
            <div className="col-span-2">{t('po.productName')}</div>
            <div>{t('po.productId')}</div>
            <div>{t('po.orderQty')}</div>
            <div>{t('po.price')}</div>
          </div>

          {/* Rows */}
          <div className="mt-4">
            <div className="max-h-80 overflow-y-auto divide-y rounded" style={{borderColor: isDark ? '#4b5563' : '#f3f4f6'}}>
              {selectedItems.size === 0 ? (
                <div className="text-center py-8" style={{color: isDark ? '#9ca3af' : '#6b7280'}}>
                  {t('po.noItems')}
                </div>
              ) : (
                orderItems.filter(item => selectedItems.has(item.id)).map((item) => (
                  <div key={item.id} className="grid grid-cols-6 gap-4 items-center py-3 px-2"
                       style={{borderColor: isDark ? '#4b5563' : '#f3f4f6'}}>
                    <div>
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => handleItemSelection(item.id)}
                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 focus:ring-2"
                        style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6', borderColor: isDark ? '#4b5563' : '#d1d5db' }}
                      />
                    </div>
                    <div className="col-span-2 flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-lg"
                           style={{backgroundColor: isDark ? '#4b5563' : '#f3f4f6'}}>
                        {getImageSrc(item.image) ? (
                          <img src={getImageSrc(item.image)!} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span>{item.image}</span>
                        )}
                      </div>
                      <div>
                        <span className="font-medium" style={{color: isDark ? 'white' : '#1f2937'}}>{item.name}</span>
                        <div className="text-sm" style={{color: isDark ? '#9ca3af' : '#6b7280'}}>{item.brand}</div>
                      </div>
                    </div>
                    <div className="transition-colors" style={{color: isDark ? '#d1d5db' : '#4b5563'}}>{item.id}</div>

                    {/* Qty + Unit */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.amount - 1))}
                        className="w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-200"
                        style={{ backgroundColor: isDark ? '#4b5563' : '#f3f4f6' }}
                        onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = isDark ? '#6b7280' : '#e5e7eb'; }}
                        onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = isDark ? '#4b5563' : '#f3f4f6'; }}
                      >
                        <Minus className="w-3 h-3" style={{color: isDark ? '#d1d5db' : '#4b5563'}} />
                      </button>

                      <input
                        type="number"
                        min={1}
                        value={item.amount}
                        onChange={e => {
                          const value = Number(e.target.value);
                          updateQuantity(item.id, isNaN(value) || value < 1 ? 1 : value);
                        }}
                        className="mx-1 min-w-12 text-center border rounded px-2 py-1 w-20"
                        style={{ backgroundColor: isDark ? '#374151' : 'white', borderColor: isDark ? '#4b5563' : '#d1d5db', color: isDark ? 'white' : '#1f2937' }}
                      />

                      <select
                        value={item.unit || ""}
                        onChange={(e) =>
                          setOrderItems(curr => curr.map(it => it.id === item.id ? { ...it, unit: e.target.value } : it))
                        }
                        className="px-2 py-1 border rounded w-28"
                        style={{ backgroundColor: isDark ? '#374151' : 'white', borderColor: isDark ? '#4b5563' : '#d1d5db', color: isDark ? 'white' : '#1f2937' }}
                      >
                        <option value="" disabled>{t('po.unitLabel')}</option>
                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>

                      <button
                        onClick={() => updateQuantity(item.id, item.amount + 1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-200"
                        style={{ backgroundColor: isDark ? '#4b5563' : '#f3f4f6' }}
                        onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = isDark ? '#6b7280' : '#e5e7eb'; }}
                        onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = isDark ? '#4b5563' : '#f3f4f6'; }}
                      >
                        <Plus className="w-3 h-3" style={{color: isDark ? '#d1d5db' : '#4b5563'}} />
                      </button>
                    </div>

                    {/* Price */}
                    <div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price ?? ""}
                        onChange={(e) => {
                          const val = e.target.value === "" ? null : Number(e.target.value);
                          setOrderItems(curr => curr.map(it => it.id === item.id ? { ...it, price: val } : it));
                        }}
                        placeholder={t('po.price')!}
                        className="w-28 px-2 py-1 border rounded text-right font-semibold"
                        style={{ backgroundColor: isDark ? '#374151' : 'white', borderColor: isDark ? '#4b5563' : '#d1d5db', color: isDark ? 'white' : '#1f2937' }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Total */}
          <div className="mt-8 pt-6 border-t" style={{borderColor: isDark ? '#4b5563' : '#e5e7eb'}}>
            <div className="flex justify-between items-center text-lg font-semibold">
              <span style={{color: isDark ? 'white' : '#1f2937'}}>{t('po.total')}</span>
              <span className="text-teal-600">{getTotalValue().toLocaleString()} THB</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          <button
            onClick={createQuotation}
            className={`w-full py-4 rounded-lg font-medium transition-colors ${
              selectedItems.size === 0 ? "cursor-not-allowed opacity-60" : "hover:bg-green-900 text-white"
            }`}
            style={{
              backgroundColor: selectedItems.size === 0 ? (isDark ? '#4b5563' : '#9ca3af') : (isDark ? '#166534' : '#14532d'),
              color: selectedItems.size === 0 ? (isDark ? '#9ca3af' : '#6b7280') : 'white'
            }}
          >
            {t('po.createQuotation')}
          </button>
          {errorMessage && <p className="text-red-600 text-sm text-center mt-2">{errorMessage}</p>}
          <button
            onClick={copyOrderText}
            className="w-full py-4 rounded-lg font-medium transition-colors duration-200"
            style={{ backgroundColor: isDark ? '#4b5563' : '#d1d5db', color: isDark ? '#d1d5db' : '#374151' }}
            onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = isDark ? '#6b7280' : '#9ca3af'; }}
            onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = isDark ? '#4b5563' : '#d1d5db'; }}
          >
            {t('po.copyText')}
          </button>
        </div>
      </div>

      {/* Add New Medicine Modal */}
      {showAddMedicineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{t('po.modalAddMedTitle')}</h2>
              <button
                onClick={() => { setShowAddMedicineModal(false); resetNewMedicineForm(); setErrorMessage(""); }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('po.productNameLabel')}</label>
                <input
                  type="text"
                  value={newMedicineForm.product_name}
                  onChange={(e) => handleFormChange('product_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('po.productNameLabel')!}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('po.brandLabel')}</label>
                <input
                  type="text"
                  value={newMedicineForm.brand}
                  onChange={(e) => handleFormChange('brand', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('po.brandLabel')!}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('po.barcodeLabel')}</label>
                <input
                  type="text"
                  value={newMedicineForm.barcode}
                  onChange={(e) => handleFormChange('barcode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('po.barcodeLabel')!}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('po.friendlyIdLabel')}</label>
                <input
                  type="text"
                  value={newMedicineForm.friendlyid}
                  onChange={(e) => handleFormChange('friendlyid', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('po.friendlyIdLabel')!}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('po.productTypeLabel')}</label>
                <select
                  value={newMedicineForm.producttype}
                  onChange={(e) => {
                    if (e.target.value === "custom") setCustomProductType("");
                    else handleFormChange('producttype', e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {productTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
                  <option value="custom">{t('po.customOther')}</option>
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
                    placeholder={t('po.customTypePlaceholder')!}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('po.unitLabel')}</label>
                <select
                  value={newMedicineForm.unit}
                  onChange={(e) => {
                    if (e.target.value === "custom") setCustomUnit("");
                    else handleFormChange('unit', e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {units.map((unit) => (<option key={unit} value={unit}>{unit}</option>))}
                  <option value="custom">{t('po.customOther')}</option>
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
                    placeholder={t('po.customUnitPlaceholder')!}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('po.imageLabel')}</label>
                <input
                  type="text"
                  value={newMedicineForm.image}
                  onChange={(e) => handleFormChange('image', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('po.imageLabel')!}
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
                  <span className="ml-2 text-sm text-gray-700">{t('po.controlled')}</span>
                </label>
              </div>

              {/* Supplier (optional) */}
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">{t('po.supplierInfo')}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('po.selectSupplier')}</label>
                    <select
                      value={selectedSupplierForNewMedicine || ''}
                      onChange={(e) => setSelectedSupplierForNewMedicine(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">{t('po.selectSupplier')}</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.supplier_id} value={supplier.supplier_id}>{supplier.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('po.costPerUnit')}</label>
                    <input
                      type="number"
                      value={newMedicineCost}
                      onChange={(e) => setNewMedicineCost(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      disabled={!selectedSupplierForNewMedicine}
                    />
                  </div>
                </div>
                {selectedSupplierForNewMedicine && !newMedicineCost && (
                  <p className="text-xs text-amber-600 mt-1">{t('po.needCost')}</p>
                )}
              </div>
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {errorMessage}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowAddMedicineModal(false); resetNewMedicineForm(); setErrorMessage(""); }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                disabled={isSubmitting}
              >
                {t('po.cancel')}
              </button>
              <button
                onClick={addNewMedicine}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
              >
                {isSubmitting ? 'Adding...' : t('po.addMedBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Supplier Modal */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('po.modalAddSupplierTitle')}</h3>
              <button
                onClick={() => { setShowAddSupplierModal(false); resetSupplierForm(); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('po.supplierNameLabel')}</label>
                <input
                  type="text"
                  value={newSupplierForm.name}
                  onChange={(e) => handleSupplierFormChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('po.supplierNameLabel')!}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('po.taxIdLabel')}</label>
                <input
                  type="text"
                  value={newSupplierForm.tax_id}
                  onChange={(e) => handleSupplierFormChange('tax_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('po.taxIdLabel')!}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('po.addressLabel')}</label>
                <textarea
                  value={newSupplierForm.address}
                  onChange={(e) => handleSupplierFormChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder={t('po.addressLabel')!}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('po.descLabel')}</label>
                <textarea
                  value={newSupplierForm.description}
                  onChange={(e) => handleSupplierFormChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder={t('po.descLabel')!}
                />
              </div>
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {errorMessage}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowAddSupplierModal(false); resetSupplierForm(); }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                disabled={isSubmitting}
              >
                {t('po.cancel')}
              </button>
              <button
                onClick={addNewSupplier}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
              >
                {isSubmitting ? 'Adding...' : t('po.addSupplier')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrder;
