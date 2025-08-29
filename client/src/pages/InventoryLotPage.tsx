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
        <div className="min-h-screen bg-[#f7f8fa]">
            {/* Top */}
            <div className="px-6 pt-6">
                <h1 className="text-2xl font-semibold text-gray-900">Medicine</h1>
            </div>

            <div className="px-6 py-4">
                {/* Breadcrumb (no warehouses) */}
                <div className="text-sm text-gray-500 mb-3">
                    <Link to="/inventory" className="text-emerald-700 hover:underline">Inventory</Link>
                    <span className="mx-1">›</span>
                    <span className="text-gray-800 font-medium">{med.name}</span>
                </div>

                {/* Header cards (same theme as your inventory) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center mr-3">
                            <Pill className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm text-gray-500">Total Lots</div>
                            <div className="text-2xl font-bold text-gray-900">{lots.length}</div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center mr-3">
                            <Box className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm text-gray-500">Available Units</div>
                            <div className="text-2xl font-bold text-gray-900">{available}</div>
                        </div>
                    </div>

                    <div className={`rounded-lg p-4 border ${expSoon > 0 ? "bg-gradient-to-r from-orange-500 to-red-500 border-orange-200" : "bg-white border-gray-200"}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Calendar className={`w-8 h-8 ${expSoon > 0 ? "text-white" : "text-gray-400"}`} />
                                <div className="ml-3">
                                    <div className={`text-sm ${expSoon > 0 ? "text-orange-100" : "text-gray-500"}`}>Expire Soon</div>
                                    <div className={`text-2xl font-bold ${expSoon > 0 ? "text-white" : "text-gray-900"}`}>{expSoon}</div>
                                </div>
                            </div>
                            <button className={`px-3 py-1 rounded-md text-sm font-medium ${expSoon > 0 ? "bg-white/20 text-white hover:bg-white/30" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                                Manage
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main grid: medicine card + lots table */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Medicine details */}
                    <div className="lg:col-span-3">
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="h-48 md:h-56 w-full overflow-hidden rounded-md mb-4 border border-gray-100 bg-white">
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
                                    <div className="text-xs text-gray-500">Name</div>
                                    <div className="text-gray-900 font-medium">{med.name}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <div className="text-xs text-gray-500">Brand</div>
                                        <div className="text-gray-800">{med.brand}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Type</div>
                                        <div className="text-gray-800">{med.productType ?? "-"}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <div className="text-xs text-gray-500">Unit</div>
                                        <div className="text-gray-800">{med.unit ?? "-"}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Controlled</div>
                                        <div className="text-gray-800">{med.isControlled ? "Yes" : "No"}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <div className="text-xs text-gray-500">Price</div>
                                        <div className="text-gray-800">{med.price}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Next Expiration</div>
                                        <div className="text-gray-800">{fmt(med.expiredDate)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lots table */}
                    <div className="lg:col-span-9">
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <div className="p-4 flex items-center justify-between">
                                <button className="inline-flex items-center px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
                                    <Plus className="w-4 h-4 mr-1" /> Add New Lot
                                </button>
                            </div>

                            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-100 border-t border-b border-gray-200 text-sm font-medium text-gray-700">
                                <div className="col-span-2">Lot no.</div>
                                <div className="col-span-2">Stocked Date</div>
                                <div className="col-span-2">Total Stock Unit</div>
                                <div className="col-span-2">Reserved Stock Unit</div>
                                <div className="col-span-2">Available Stock Unit</div>
                                <div className="col-span-2">Expiration Date</div>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {lots.map((r) => {
                                    const exp = expStatus(r.expirationDate);
                                    return (
                                        <div key={r.lotNo} className="grid grid-cols-12 gap-4 px-6 py-4 text-gray-800">
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
                                                <button className="text-gray-400 hover:text-gray-600">
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="px-6 py-3 bg-gray-50 text-sm text-gray-500">
                                Total stock: <span className="text-gray-800 font-medium">{total}</span> • Available:{" "}
                                <span className="text-gray-800 font-medium">{available}</span>
                            </div>
                        </div>

                        <div className="mt-4">
                            <Link to="/inventory" className="text-emerald-700 hover:text-emerald-800 text-sm font-medium">
                                ← Back to Inventory
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
