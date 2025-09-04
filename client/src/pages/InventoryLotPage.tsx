import { useMemo, useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Plus, MoreVertical, Calendar, Pill, Box, X } from "lucide-react";
import Swal from 'sweetalert2';
import StockTransactionsTab from '../components/StockTransactionsTab';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type LotRow = {
    lotNo: string;
    stockedDate: string;       // YYYY-MM-DD
    totalStock: number;
    reservedStock: number;
    availableStock: number;
    expirationDate: string;    // YYYY-MM-DD
};

type StockTransaction = {
    stock_trans_id: number;
    trans_type: 'IN' | 'OUT' | 'ADJUST';
    qty: number;
    trans_date: string;
    ref_no: string;
    note: string;
    lot_id_fk: number;
    lot?: {
        lot_id: number;
        lot_no: string;
        product_id: number;
        added_date: string;
        expired_date: string;
        cost: number;
        init_amount: number;
    };
};

type Medicine = {
    id: number;
    name: string;
    brand: string;
    price: number;
    image?: string | null;
    productType?: string | null;
    unit?: string | null;
    isControlled?: boolean | null;
    expiredDate: string;
    amount: number;
    lots: LotRow[];
};

function fmt(d: string) {
    const dt = new Date(d);
    return isNaN(+dt)
        ? "-"
        : dt.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" });
}

function expStatus(date: string) {
    const today = new Date();
    const exp = new Date(date);
    const days = Math.floor((+exp - +today) / (1000 * 60 * 60 * 24));
    if (isNaN(days)) return { label: "-", dot: "bg-gray-300", text: "text-gray-500" };
    if (days < 0) return { label: fmt(date), dot: "bg-red-500", text: "text-red-600" };               // expired
    if (days <= 180) return { label: fmt(date), dot: "bg-orange-400", text: "text-orange-600" };      // soon
    return { label: fmt(date), dot: "bg-emerald-500", text: "text-gray-700" };                        // safe
}

export default function LotPage() {
    const { id = "1" } = useParams();
    const [medicine, setMedicine] = useState<Medicine | null>(null);
    const [loading, setLoading] = useState(true);
    const [lotsLoading, setLotsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAddLotModal, setShowAddLotModal] = useState(false);
    const [isAddingLot, setIsAddingLot] = useState(false);
    const [activeTab, setActiveTab] = useState<'lots' | 'transactions'>('lots');
    const [newLot, setNewLot] = useState({
        lotNo: '',
        stockedDate: '',
        totalStock: '',
        reservedStock: '',
        availableStock: '',
        expirationDate: '',
        cost: ''
    });

    // Fetch lots by product ID from new API endpoint
    const fetchLotsByProductId = useCallback(async () => {
        try {
            setLotsLoading(true);
            
            const response = await fetch(`${API_URL}/lot/get-lots-by-product/${id}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.status && data.data) {
                    // Transform API lot data to match our LotRow interface
                    const transformedLots: LotRow[] = data.data.map((lot: any) => ({
                        lotNo: lot.lot_no,
                        stockedDate: lot.added_date,
                        totalStock: lot.init_amount,
                        reservedStock: 0, // Reserved stock not in current lot model
                        availableStock: lot.init_amount, // For now, assuming all stock is available
                        expirationDate: lot.expired_date,
                    }));
                    
                    // Update the medicine state with real lot data
                    setMedicine(prev => prev ? { ...prev, lots: transformedLots } : null);
                } else {
                    console.log('No lots found for this product');
                    // Keep existing mock data if no real lots found
                }
            } else {
                console.error('Failed to fetch lots by product ID');
                // Keep existing mock data on error
            }
        } catch (error) {
            console.error('Error fetching lots by product ID:', error);
            // Keep existing mock data on error
        } finally {
            setLotsLoading(false);
        }
    }, [id]);

    // Fetch medicine data from API
    const fetchMedicineData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`${API_URL}/inventory/get-prouduct/${id}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.status && data.data) {
                    // Transform API data to match our Medicine interface
                    const product = data.data;
                    const transformedMedicine: Medicine = {
                        id: product.product_id,
                        name: product.product_name || "Unknown Medicine",
                        brand: product.brand || "Unknown Brand",
                        price: product.price || 0,
                        image: product.image || null,
                        productType: product.producttype || null,
                        unit: product.unit || null,
                        isControlled: product.iscontrolled || false,
                        expiredDate: product.expiry_date || "2025-12-31",
                        amount: product.stock_quantity || 0,
                        lots: product.lots ? product.lots.map((lot: any) => ({
                            lotNo: lot.lot_no,
                            stockedDate: lot.added_date,
                            totalStock: lot.init_amount,
                            reservedStock: lot.reserved_amount || 0,
                            availableStock: (lot.init_amount - (lot.reserved_amount || 0)),
                            expirationDate: lot.expired_date,
                        })) : [
                            // Mock lots until API provides real lot data
                            {
                                lotNo: `${product.friendlyid || 'P'}-001`,
                                stockedDate: "2024-01-15",
                                totalStock: Math.floor(product.stock_quantity * 0.4) || 50,
                                reservedStock: Math.floor(product.stock_quantity * 0.05) || 5,
                                availableStock: Math.floor(product.stock_quantity * 0.35) || 45,
                                expirationDate: product.expiry_date || "2025-12-31",
                            },
                            {
                                lotNo: `${product.friendlyid || 'P'}-002`,
                                stockedDate: "2024-03-20",
                                totalStock: Math.floor(product.stock_quantity * 0.6) || 30,
                                reservedStock: Math.floor(product.stock_quantity * 0.02) || 2,
                                availableStock: Math.floor(product.stock_quantity * 0.58) || 28,
                                expirationDate: "2025-06-30",
                            }
                        ]
                    };
                    
                    setMedicine(transformedMedicine);
                } else {
                    throw new Error('Product not found');
                }
            } else {
                // POST request but it's for data fetching - show error alert only
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Failed to load product details',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                });
                setError('Failed to load product details');
            }
        } catch (error) {
            console.error('Error fetching medicine data:', error);
            // POST request but it's for data fetching - show error alert only
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Network error occurred. Please try again.',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true
            });
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        const initializeData = async () => {
            await fetchMedicineData();
            // After medicine data is loaded, fetch the lots
            await fetchLotsByProductId();
        };
        initializeData();
    }, [fetchMedicineData, fetchLotsByProductId]);

    // Handler functions for Add Lot modal
    const handleOpenAddLotModal = () => {
        setShowAddLotModal(true);
        // Reset form
        setNewLot({
            lotNo: '',
            stockedDate: new Date().toISOString().split('T')[0], // Today's date
            totalStock: '',
            reservedStock: '0',
            availableStock: '',
            expirationDate: '',
            cost: ''
        });
    };

    const handleCloseAddLotModal = () => {
        setShowAddLotModal(false);
        setNewLot({
            lotNo: '',
            stockedDate: new Date().toISOString().split('T')[0], // Reset to today's date
            totalStock: '',
            reservedStock: '',
            availableStock: '',
            expirationDate: '',
            cost: ''
        });
    };

    const handleLotInputChange = (field: string, value: string) => {
        setNewLot(prev => {
            const updated = { ...prev, [field]: value };
            
            // Auto-calculate available stock when total or reserved changes
            if (field === 'totalStock' || field === 'reservedStock') {
                const total = field === 'totalStock' ? parseInt(value) || 0 : parseInt(prev.totalStock) || 0;
                const reserved = field === 'reservedStock' ? parseInt(value) || 0 : parseInt(prev.reservedStock) || 0;
                updated.availableStock = Math.max(0, total - reserved).toString();
            }
            
            return updated;
        });
    };

    const handleAddLot = async () => {
        // Validation
        if (!newLot.lotNo.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please enter a lot number',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true
            });
            return;
        }

        if (!newLot.totalStock || parseInt(newLot.totalStock) <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please enter a valid total stock quantity',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true
            });
            return;
        }

        if (!newLot.expirationDate) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please select an expiration date',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true
            });
            return;
        }

        if (!newLot.cost || parseFloat(newLot.cost) <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please enter a valid cost per unit',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true
            });
            return;
        }

        // API integration to actually add the lot
        try {
            setIsAddingLot(true); // Set loading state
            
            const lotData = {
                lot_no: newLot.lotNo,
                init_amount: parseInt(newLot.totalStock),
                added_date: newLot.stockedDate,
                expired_date: newLot.expirationDate,
                cost: parseFloat(newLot.cost),
                product_id: parseInt(id) // Current medicine ID from URL params
            };

            console.log('Adding new lot:', lotData);

            const response = await fetch(`${API_URL}/lot/add-lot`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(lotData)
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.status) {
                    // Success - show success message and refresh data
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: 'Lot added successfully',
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true
                    });
                    
                    // Close modal and refresh data to show new lot
                    handleCloseAddLotModal();
                    await fetchLotsByProductId(); // Refresh the lots data specifically
                } else {
                    throw new Error(data.error || 'Failed to add lot');
                }
            } else {
                // API error - show error alert
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Failed to add lot. Please try again.',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                });
            }
        } catch (error) {
            console.error('Error adding lot:', error);
            // Network error - show error alert
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Network error occurred. Please check your connection.',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true
            });
        } finally {
            setIsAddingLot(false); // Reset loading state
        }
    };

    // Optimize lots calculation with useMemo
    const lots = useMemo(() => medicine?.lots || [], [medicine?.lots]);
    const total = useMemo(() => lots.reduce((a, r) => a + r.totalStock, 0), [lots]);
    const available = useMemo(() => lots.reduce((a, r) => a + r.availableStock, 0), [lots]);
    const expSoon = useMemo(
        () =>
            lots.filter((r) => {
                const { text } = expStatus(r.expirationDate);
                return text.includes("orange") || text.includes("red");
            }).length,
        [lots]
    );

    const imageSrc = useMemo(() => {
        if (!medicine) return null;
        if (medicine.image && medicine.image.startsWith("http")) {
            return medicine.image;
        }
        if (medicine.image) {
            return `${API_URL}${medicine.image}`;
        }
        // No image available - return null to show placeholder
        return null;
    }, [medicine]);

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#f7f8fa' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}>Loading product details...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error || !medicine) {
        return (
            <div className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#f7f8fa' }}>
                <div className="text-center">
                    <div className="text-red-500 mb-4">
                        <Box className="w-16 h-16 mx-auto mb-2" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2"
                        style={{ color: document.documentElement.classList.contains('dark') ? 'white' : '#111827' }}>
                        Product Not Found
                    </h2>
                    <p className="mb-4"
                        style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}>
                        {error || 'The requested product could not be found.'}
                    </p>
                    <Link 
                        to="/inventory" 
                        className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                    >
                        Back to Inventory
                    </Link>
                </div>
            </div>
        );
    }

    return (
   
        <div className="min-h-screen"
            style={{ backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#f7f8fa' }}>
            {/* Top */}
            <div className="px-6 pt-6">
                <h1 className="text-2xl font-semibold"
                    style={{ color: document.documentElement.classList.contains('dark') ? 'white' : '#111827' }}>Medicine</h1>
            </div>

            <div className="px-6 py-4">
                {/* Breadcrumb (no warehouses) */}
                <div className="text-sm mb-3"
                    style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}>
                    <Link to="/inventory" className="text-emerald-600 hover:underline">Inventory</Link>
                    <span className="mx-1">›</span>
                    <span className="font-medium"
                        style={{ color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#1f2937' }}>{medicine.name}</span>
                </div>

                {/* Header cards (same theme as your inventory) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="border rounded-lg p-4 flex items-center"
                        style={{
                            backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                            borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
                        }}>
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center mr-3">
                            <Pill className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm"
                                style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}>Total Lots</div>
                            <div className="text-2xl font-bold"
                                style={{ color: document.documentElement.classList.contains('dark') ? 'white' : '#111827' }}>{lots.length}</div>
                        </div>
                    </div>

                    <div className="border rounded-lg p-4 flex items-center"
                        style={{
                            backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                            borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
                        }}>
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center mr-3">
                            <Box className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm"
                                style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}>Available Units</div>
                            <div className="text-2xl font-bold"
                                style={{ color: document.documentElement.classList.contains('dark') ? 'white' : '#111827' }}>{available}</div>
                        </div>
                    </div>

                    <div className={`rounded-lg p-4 border ${expSoon > 0 ? "bg-gradient-to-r from-orange-500 to-red-500 border-orange-200" : ""}`}
                        style={{
                            backgroundColor: expSoon > 0 ? undefined : (document.documentElement.classList.contains('dark') ? '#374151' : 'white'),
                            borderColor: expSoon > 0 ? undefined : (document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb')
                        }}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Calendar className={`w-8 h-8 ${expSoon > 0 ? "text-white" : (document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280')}`} />
                                <div className="ml-3">
                                    <div className={`text-sm ${expSoon > 0 ? "text-orange-100" : (document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280')}`}>Expire Soon</div>
                                    <div className={`text-2xl font-bold ${expSoon > 0 ? "text-white" : (document.documentElement.classList.contains('dark') ? 'white' : '#111827')}`}>{expSoon}</div>
                                </div>
                            </div>
                            <button className={`px-3 py-1 rounded-md text-sm font-medium ${expSoon > 0 ? "bg-white/20 text-white hover:bg-white/30" : ""}`}
                                style={{
                                    backgroundColor: expSoon > 0 ? undefined : (document.documentElement.classList.contains('dark') ? '#4b5563' : '#f3f4f6'),
                                    color: expSoon > 0 ? undefined : (document.documentElement.classList.contains('dark') ? 'white' : '#374151')
                                }}
                                onMouseEnter={(e) => {
                                    if (expSoon === 0) {
                                        e.currentTarget.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#6b7280' : '#e5e7eb';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (expSoon === 0) {
                                        e.currentTarget.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#4b5563' : '#f3f4f6';
                                    }
                                }}>
                                Manage
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="mb-6">
                    <div className="border-b"
                         style={{borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'}}>
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('lots')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'lots'
                                        ? 'border-emerald-500 text-emerald-600'
                                        : 'border-transparent hover:border-gray-300'
                                }`}
                                style={{
                                    color: activeTab === 'lots' 
                                        ? '#059669' 
                                        : (document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280')
                                }}
                            >
                                Lot Management
                            </button>
                            <button
                                onClick={() => setActiveTab('transactions')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'transactions'
                                        ? 'border-emerald-500 text-emerald-600'
                                        : 'border-transparent hover:border-gray-300'
                                }`}
                                style={{
                                    color: activeTab === 'transactions' 
                                        ? '#059669' 
                                        : (document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280')
                                }}
                            >
                                Stock Movement Log
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'lots' && (
                    <div>
                        {/* Main grid: medicine card + lots table */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Medicine details */}
                    <div className="lg:col-span-3">
                        <div className="border rounded-lg p-4"
                            style={{
                                backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                                borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
                            }}>
                            <div className="h-48 md:h-56 w-full overflow-hidden rounded-md mb-4 border"
                                style={{
                                    backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                                    borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#f3f4f6'
                                }}>
                                {imageSrc ? (
                                    <img
                                        src={imageSrc}
                                        alt={medicine.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            // Replace with SVG placeholder on error
                                            const svgPlaceholder = `data:image/svg+xml;utf8,${encodeURIComponent(
                                                `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>
                                                    <rect width='100%' height='100%' fill='#ecfdf5'/>
                                                    <g fill='none' stroke='#059669' stroke-width='2'>
                                                        <path d='M170 120 l60 60'/>
                                                        <path d='M230 180 a35 35 0 1 1 -50 -50 l20 -20 a35 35 0 1 1 50 50 l-20 20'/>
                                                    </g>
                                                    <text x='50%' y='90%' text-anchor='middle' fill='#065f46' font-family='sans-serif' font-size='14'>No image — ${medicine.productType || "Medicine"}</text>
                                                </svg>`
                                            )}`;
                                            e.currentTarget.src = svgPlaceholder;
                                        }}
                                    />
                                ) : (
                                    // Show SVG placeholder directly when no image
                                    <div className="w-full h-full flex items-center justify-center"
                                        style={{ backgroundColor: '#ecfdf5' }}>
                                        <svg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 400 300'>
                                            <rect width='100%' height='100%' fill='#ecfdf5'/>
                                            <g fill='none' stroke='#059669' strokeWidth='2'>
                                                <path d='M170 120 l60 60'/>
                                                <path d='M230 180 a35 35 0 1 1 -50 -50 l20 -20 a35 35 0 1 1 50 50 l-20 20'/>
                                            </g>
                                            <text x='50%' y='90%' textAnchor='middle' fill='#065f46' fontFamily='sans-serif' fontSize='14'>
                                                No image — {medicine.productType || "Medicine"}
                                            </text>
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <div className="text-xs"
                                        style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}>Name</div>
                                    <div className="font-medium"
                                        style={{ color: document.documentElement.classList.contains('dark') ? 'white' : '#111827' }}>{medicine.name}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <div className="text-xs"
                                            style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}>Brand</div>
                                        <div style={{ color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#1f2937' }}>{medicine.brand}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs"
                                            style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}>Type</div>
                                        <div style={{ color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#1f2937' }}>{medicine.productType ?? "-"}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <div className="text-xs"
                                            style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}>Unit</div>
                                        <div style={{ color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#1f2937' }}>{medicine.unit ?? "-"}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs"
                                            style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}>Controlled</div>
                                        <div style={{ color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#1f2937' }}>{medicine.isControlled ? "Yes" : "No"}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <div className="text-xs"
                                            style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}>Price</div>
                                        <div style={{ color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#1f2937' }}>{medicine.price}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs"
                                            style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}>Next Expiration</div>
                                        <div style={{ color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#1f2937' }}>{fmt(medicine.expiredDate)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lots table */}
                    <div className="lg:col-span-9">
                        <div className="border rounded-lg overflow-hidden"
                            style={{
                                backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                                borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
                            }}>
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={handleOpenAddLotModal}
                                        className="inline-flex items-center px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                                        <Plus className="w-4 h-4 mr-1" /> Add New Lot
                                    </button>
                                    <button 
                                        onClick={fetchLotsByProductId}
                                        disabled={lotsLoading}
                                        className="inline-flex items-center px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                                        style={{
                                            color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151',
                                            backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white'
                                        }}>
                                        {lotsLoading ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1"></div>
                                        ) : (
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                        )}
                                        {lotsLoading ? 'Refreshing...' : 'Refresh Lots'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-t border-b text-sm font-medium"
                                style={{
                                    backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f9fafb',
                                    borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#e5e7eb',
                                    color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'
                                }}>
                                <div className="col-span-2">Lot no.</div>
                                <div className="col-span-2">Stocked Date</div>
                                <div className="col-span-2">Total Stock Unit</div>
                                <div className="col-span-2">Reserved Stock Unit</div>
                                <div className="col-span-2">Available Stock Unit</div>
                                <div className="col-span-2">Expiration Date</div>
                            </div>

                            <div className="divide-y"
                                style={{ borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb' }}>
                                {lotsLoading ? (
                                    <div className="px-6 py-8 text-center">
                                        <div className="inline-flex items-center text-sm" 
                                            style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                            Loading lots data...
                                        </div>
                                    </div>
                                ) : lots.length === 0 ? (
                                    <div className="px-6 py-8 text-center">
                                        <div className="text-sm"
                                            style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}>
                                            No lots found for this product.
                                        </div>
                                    </div>
                                ) : (
                                    lots.map((r) => {
                                        const exp = expStatus(r.expirationDate);
                                        return (
                                            <div key={r.lotNo} className="grid grid-cols-12 gap-4 px-6 py-4"
                                                style={{ color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#1f2937' }}>
                                                <div className="col-span-2">{r.lotNo}</div>
                                                <div className="col-span-2">{fmt(r.stockedDate)}</div>
                                                <div className="col-span-2">{r.totalStock}</div>
                                                <div className="col-span-2">{r.reservedStock}</div>
                                                <div className="col-span-2">{r.availableStock}</div>
                                                <div className="col-span-2 flex items-center justify-between">
                                                    <span className={`flex items-center ${exp.text}`}>
                                                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${exp.dot}`} />
                                                        {exp.label}
                                                    </span>
                                                    <button className="hover:text-gray-600"
                                                        style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}>
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="px-6 py-3 text-sm"
                                style={{
                                    backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f9fafb',
                                    color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
                                }}>
                                Total stock: <span className="font-medium"
                                    style={{ color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#1f2937' }}>{total}</span> • Available:{" "}
                                <span className="font-medium"
                                    style={{ color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#1f2937' }}>{available}</span>
                            </div>
                        </div>

                        <div className="mt-4">
                            <Link to="/inventory" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                                ← Back to Inventory
                            </Link>
                        </div>
                    </div>
                </div>
                    </div>
                )}

                {/* Stock Transactions Tab */}
                {activeTab === 'transactions' && (
                    <StockTransactionsTab lotId={id} />
                )}
            </div>
        </div>
    );
}
