import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronDown, Plus, MoreVertical, Calendar, Pill, Box } from "lucide-react";

type LotRow = {
    lotNo: string;
    stockedDate: string;       // YYYY-MM-DD
    totalStock: number;
    reservedStock: number;
    availableStock: number;
    expirationDate: string;    // YYYY-MM-DD
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

    const imageSrc =
        med.image && med.image.startsWith("http")
            ? med.image
            : med.image
                ? `${import.meta.env.VITE_API_BASE || "http://localhost:3000"}${med.image}`
                : "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1600&auto=format&fit=crop";

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
            </div>
        </div>
    );
}
