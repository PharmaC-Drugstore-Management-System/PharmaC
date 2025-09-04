import { useMemo, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Plus, MoreVertical, Calendar, Pill, Box, TrendingUp, TrendingDown, RotateCcw, Search } from "lucide-react";

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

// --- Mock one medicine like your Pharmac inventory item ---
const MOCK_MEDICINES: Record<string, Medicine> = {
    "1": {
        id: 1,
        name: "Paracetamol",
        brand: "Tylenol",
        price: 50,
        image: "https://images.unsplash.com/photo-1588776814546-ec3d13b665df?q=80&w=1600&auto=format&fit=crop",
        productType: "Tablet",
        unit: "Box",
        isControlled: false,
        expiredDate: "2025-12-31",
        amount: 25,
        lots: [
            {
                lotNo: "P-2401",
                stockedDate: "2025-06-01",
                totalStock: 120,
                reservedStock: 10,
                availableStock: 110,
                expirationDate: "2026-05-31",
            },
            {
                lotNo: "P-2402",
                stockedDate: "2025-03-15",
                totalStock: 80,
                reservedStock: 5,
                availableStock: 75,
                expirationDate: "2025-12-20",
            }, // soon
            {
                lotNo: "P-2309",
                stockedDate: "2024-11-10",
                totalStock: 30,
                reservedStock: 0,
                availableStock: 30,
                expirationDate: "2024-12-15",
            }, // expired
            {
                lotNo: "P-2405",
                stockedDate: "2025-08-20",
                totalStock: 60,
                reservedStock: 6,
                availableStock: 54,
                expirationDate: "2027-01-10",
            },
        ],
    },
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
    const [activeTab, setActiveTab] = useState<'lots' | 'transactions'>('lots');
    const med = MOCK_MEDICINES[id] ?? MOCK_MEDICINES["1"];
    const lots = med.lots;

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

    return (
        <div className="min-h-screen"
             style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#f7f8fa'}}>
            {/* Top */}
            <div className="px-6 pt-6">
                <h1 className="text-2xl font-semibold"
                    style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>Medicine</h1>
            </div>

            <div className="px-6 py-4">
                {/* Breadcrumb (no warehouses) */}
                <div className="text-sm mb-3"
                     style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                    <Link to="/inventory" className="text-emerald-600 hover:underline">Inventory</Link>
                    <span className="mx-1">›</span>
                    <span className="font-medium"
                          style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#1f2937'}}>{med.name}</span>
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
                                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>Total Lots</div>
                            <div className="text-2xl font-bold"
                                 style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>{lots.length}</div>
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
                                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>Available Units</div>
                            <div className="text-2xl font-bold"
                                 style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>{available}</div>
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
                    <>
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
                                <img
                                    src={med.image!} // you set a fixed mock URL in MOCK_MEDICINES
                                    alt={med.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src =
                                            "data:image/svg+xml;utf8," +
                                            encodeURIComponent(
                                                `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>
            <rect width='100%' height='100%' fill='#ecfdf5'/>
            <g fill='none' stroke='#059669' stroke-width='2'>
              <path d='M170 120 l60 60'/>
              <path d='M230 180 a35 35 0 1 1 -50 -50 l20 -20 a35 35 0 1 1 50 50 l-20 20'/>
            </g>
            <text x='50%' y='90%' text-anchor='middle' fill='#065f46' font-family='sans-serif' font-size='14'>No image — ${med.productType || "Medicine"}</text>
          </svg>`
                                            );
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <div className="text-xs"
                                         style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>Name</div>
                                    <div className="font-medium"
                                         style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>{med.name}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <div className="text-xs"
                                             style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>Brand</div>
                                        <div style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#1f2937'}}>{med.brand}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs"
                                             style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>Type</div>
                                        <div style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#1f2937'}}>{med.productType ?? "-"}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <div className="text-xs"
                                             style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>Unit</div>
                                        <div style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#1f2937'}}>{med.unit ?? "-"}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs"
                                             style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>Controlled</div>
                                        <div style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#1f2937'}}>{med.isControlled ? "Yes" : "No"}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <div className="text-xs"
                                             style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>Price</div>
                                        <div style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#1f2937'}}>{med.price}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs"
                                             style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>Next Expiration</div>
                                        <div style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#1f2937'}}>{fmt(med.expiredDate)}</div>
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
                                <button className="inline-flex items-center px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
                                    <Plus className="w-4 h-4 mr-1" /> Add New Lot
                                </button>
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
                                 style={{borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'}}>
                                {lots.map((r) => {
                                    const exp = expStatus(r.expirationDate);
                                    return (
                                        <div key={r.lotNo} className="grid grid-cols-12 gap-4 px-6 py-4"
                                             style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#1f2937'}}>
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
                                                        style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="px-6 py-3 text-sm"
                                 style={{
                                   backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f9fafb',
                                   color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
                                 }}>
                                Total stock: <span className="font-medium"
                                                   style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#1f2937'}}>{total}</span> • Available:{" "}
                                <span className="font-medium"
                                      style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#1f2937'}}>{available}</span>
                            </div>
                        </div>

                        <div className="mt-4">
                            <Link to="/inventory" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                                ← Back to Inventory
                            </Link>
                        </div>
                    </div>
                </div>
                    </>
                )}

                {/* Stock Transactions Tab */}
                {activeTab === 'transactions' && (
                    <StockTransactionsTab lotId={id} />
                )}
            </div>
        </div>
    );
}

// Stock Transactions Component
function StockTransactionsTab({ lotId }: { lotId:  string }) {
    const [transactions, setTransactions] = useState<StockTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch stock transactions from API
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                setError(null);

                // Call the API endpoint to get stock transactions by lot ID
                const response = await fetch(`http://localhost:5000/stock/lot/${lotId}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch transactions: ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log('Fetched transactions:', data);
                setTransactions(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
                console.error('Error fetching stock transactions:', err);
            } finally {
                setLoading(false);
            }
        };

        if (lotId) {
            fetchTransactions();
        }
    }, [lotId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                        Loading stock transactions...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="text-red-500 mb-4">
                        <Box className="w-12 h-12 mx-auto mb-2" />
                        <p className="font-medium">Error loading transactions</p>
                        <p className="text-sm">{error}</p>
                    </div>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const getTransactionTypeIcon = (type: string) => {
        switch (type) {
            case 'IN':
                return <TrendingUp className="w-4 h-4" />;
            case 'OUT':
                return <TrendingDown className="w-4 h-4" />;
            case 'ADJUST':
                return <RotateCcw className="w-4 h-4" />;
            default:
                return <Box className="w-4 h-4" />;
        }
    };

    const getTransactionTypeColor = (type: string) => {
        switch (type) {
            case 'IN':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'OUT':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'ADJUST':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calculate statistics
    const totalIn = transactions
        .filter(t => t.trans_type === 'IN')
        .reduce((sum, t) => sum + t.qty, 0);
    
    const totalOut = Math.abs(transactions
        .filter(t => t.trans_type === 'OUT')
        .reduce((sum, t) => sum + t.qty, 0));
    
    const totalAdjust = transactions
        .filter(t => t.trans_type === 'ADJUST')
        .reduce((sum, t) => sum + t.qty, 0);

    return (
        <div>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="border rounded-lg p-4"
                     style={{
                       backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                       borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
                     }}>
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center mr-3">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <div className="text-sm"
                                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                                Total IN
                            </div>
                            <div className="text-xl font-bold text-green-600">+{totalIn}</div>
                        </div>
                    </div>
                </div>

                <div className="border rounded-lg p-4"
                     style={{
                       backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                       borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
                     }}>
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center mr-3">
                            <TrendingDown className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <div className="text-sm"
                                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                                Total OUT
                            </div>
                            <div className="text-xl font-bold text-red-600">-{totalOut}</div>
                        </div>
                    </div>
                </div>

                <div className="border rounded-lg p-4"
                     style={{
                       backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                       borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
                     }}>
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center mr-3">
                            <RotateCcw className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <div className="text-sm"
                                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                                Adjustments
                            </div>
                            <div className="text-xl font-bold text-yellow-600">{totalAdjust}</div>
                        </div>
                    </div>
                </div>

                <div className="border rounded-lg p-4"
                     style={{
                       backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                       borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
                     }}>
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                            <Box className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-sm"
                                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                                Net Stock
                            </div>
                            <div className="text-xl font-bold text-blue-600">{totalIn + totalOut + totalAdjust}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2"
                                style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}} />
                        <input
                            type="text"
                            placeholder="Search by reference number..."
                            className="pl-10 pr-4 py-2 border rounded-lg"
                            style={{
                                backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                                borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb',
                                color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'
                            }}
                        />
                    </div>
                    
                    <select className="px-4 py-2 border rounded-lg"
                            style={{
                                backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                                borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb',
                                color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'
                            }}>
                        <option value="">All Types</option>
                        <option value="IN">Stock IN</option>
                        <option value="OUT">Stock OUT</option>
                        <option value="ADJUST">Adjustments</option>
                    </select>
                </div>

                <div className="text-sm"
                     style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                    📊 Stock Movement History Log
                </div>
            </div>

            {/* Transactions Table */}
            <div className="border rounded-lg overflow-hidden"
                 style={{
                   backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                   borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
                 }}>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f9fafb'}}>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                    style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                                    Date & Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                    style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                    style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                                    Quantity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                    style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                                    Lot Number
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                    style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                                    Reference
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                    style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                                    Note
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                    style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200"
                               style={{
                                   backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white'
                               }}>
                            {transactions.map((transaction, index) => (
                                <tr key={transaction.stock_trans_id || `transaction-${index}`}
                                    className="hover:bg-gray-50"
                                    style={{
                                        backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#4b5563' : '#f9fafb';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#374151' : 'white';
                                    }}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"
                                        style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                                        {formatDate(transaction.trans_date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTransactionTypeColor(transaction.trans_type)}`}>
                                            {getTransactionTypeIcon(transaction.trans_type)}
                                            <span className="ml-1">{transaction.trans_type}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <span className={`${
                                            transaction.trans_type === 'IN' ? 'text-green-600' :
                                            transaction.trans_type === 'OUT' ? 'text-red-600' :
                                            'text-yellow-600'
                                        }`}>
                                            {transaction.trans_type === 'IN' ? '+' : ''}{transaction.qty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"
                                        style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                                        {transaction.lot?.lot_no || `Lot ID: ${transaction.lot_id_fk}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"
                                        style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                                        {transaction.ref_no}
                                    </td>
                                    <td className="px-6 py-4 text-sm"
                                        style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                                        {transaction.note}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                                            Recorded
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
                <div className="text-sm"
                     style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                    Showing 1 to {transactions.length} of {transactions.length} transactions
                </div>
                <div className="flex space-x-2">
                    <button className="px-3 py-2 border rounded-lg"
                            style={{
                                backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                                borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb',
                                color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'
                            }}>
                        Previous
                    </button>
                    <button className="px-3 py-2 bg-emerald-600 text-white rounded-lg">
                        1
                    </button>
                    <button className="px-3 py-2 border rounded-lg"
                            style={{
                                backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                                borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb',
                                color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'
                            }}>
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
