import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar, TrendingUp, Package } from 'lucide-react';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL as string;

// --- safe URL builder so /api isn't doubled or missing -------------
const api = (path: string) => {
  const base = (API_URL || '').replace(/\/+$/, '');
  const p = path.replace(/^\/+/, '');
  return `${base}/${p}`;
};

type DateRange = '7days' | '14days' | '1month' | '3months' | '6months';

// backend rows
type ProductRow = {
  product_id: number;
  product_name: string | null;
  brand: string | null;
  total_quantity: number;   // total units sold
  unit_price: number;       // selling price per unit
  total_revenue: number;    // total_quantity * unit_price
  sale_count: number;       // number of distinct orders containing this product
};

// backend summary
type BackendSummary = {
  order_count: number;
  total_products: number;
  total_quantity: number;   // sum of all quantities
  total_revenue: number;    // sum of all total_revenue
};

// ---- group labels ------------------------------------------------
const GROUP_LABELS: Record<string, string> = {
  M01AB: 'Anti-inflammatory and antirheumatic products, non-steroids, Acetic acid derivatives and related substances',
  M01AE: 'Anti-inflammatory and antirheumatic products, non-steroids, Propionic acid derivatives',
  N02BA: 'Other analgesics and antipyretics, Salicylic acid and derivatives',
  'N02BE/B': 'Other analgesics and antipyretics, Pyrazolones and Anilides',
  N05B: 'Psycholeptics drugs, Anxiolytic drugs',
  N05C: 'Psycholeptics drugs, Hypnotics and sedatives drugs',
  R03: 'Drugs for obstructive airway diseases',
  R06: 'Antihistamines for systemic use',
};
const getGroupLabel = (code: string) =>
  GROUP_LABELS[code] ? `${code} - ${GROUP_LABELS[code]}` : code;

// ---- helpers ------------------------------------------------------
const iso = (d: Date) => d.toISOString().split('T')[0];

function calculateDateRange(range: DateRange, anchorEnd = new Date()) {
  const end = new Date(anchorEnd);
  const start = new Date(anchorEnd);

  switch (range) {
    case '7days':
      start.setDate(end.getDate() - 6);
      break;
    case '14days':
      start.setDate(end.getDate() - 13);
      break;
    case '1month':
      start.setMonth(end.getMonth() - 1);
      break;
    case '3months':
      start.setMonth(end.getMonth() - 3);
      break;
    case '6months':
      start.setMonth(end.getMonth() - 6);
      break;
  }

  return { start: iso(start), end: iso(end) };
}

function computeEndFromStart(startStr: string, range: DateRange) {
  const start = new Date(startStr);
  const end = new Date(start);

  switch (range) {
    case '7days':
      end.setDate(start.getDate() + 6);
      break;
    case '14days':
      end.setDate(start.getDate() + 13);
      break;
    case '1month':
      end.setMonth(start.getMonth() + 1);
      end.setDate(end.getDate() - 1);
      break;
    case '3months':
      end.setMonth(start.getMonth() + 3);
      end.setDate(end.getDate() - 1);
      break;
    case '6months':
      end.setMonth(start.getMonth() + 6);
      end.setDate(end.getDate() - 1);
      break;
  }

  const today = new Date(iso(new Date()));
  return end > today ? iso(today) : iso(end);
}

export default function ProductSalesHistory() {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productType = searchParams.get('type') || 'Unknown';
  const productTypeLabel = getGroupLabel(productType);

  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('7days');

  const [rows, setRows] = useState<ProductRow[]>([]);
  const [summary, setSummary] = useState<BackendSummary | null>(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [customStartDate, setCustomStartDate] = useState('');
  const [useCustomDate, setUseCustomDate] = useState(false);

  // ---- auth check -------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(api('me'), {
          method: 'GET',
          credentials: 'include',
        });
        if (res.status === 401 || res.status === 403) navigate('/login');
      } catch (e) {
        console.error('Auth check error:', e);
      }
    })();
  }, [navigate]);

  // ---- date logic ------------------------------------------------
  useEffect(() => {
    if (useCustomDate && customStartDate) {
      const end = computeEndFromStart(customStartDate, dateRange);
      setStartDate(customStartDate);
      setEndDate(end);
    } else {
      const { start, end } = calculateDateRange(dateRange);
      setStartDate(start);
      setEndDate(end);
    }
  }, [dateRange, useCustomDate, customStartDate]);

  // ---- data loading ----------------------------------------------
  const loadSalesData = async (start: string, end: string) => {
    setLoading(true);
    try {
      const url =
        api(`group-sales-history/${encodeURIComponent(productType)}`) +
        `?startDate=${start}&endDate=${end}`;

      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Failed to fetch sales data (${res.status})`);

      const json = await res.json();

      const n = (v: any) => {
        const num = Number(v);
        return Number.isFinite(num) ? num : 0;
      };

      const products: ProductRow[] = Array.isArray(json.products)
        ? json.products.map(
            (p: any): ProductRow => ({
              product_id: n(p.product_id),
              product_name: p.product_name ?? null,
              brand: p.brand ?? null,
              total_quantity: n(p.total_quantity),
              unit_price: n(p.unit_price),
              total_revenue: n(p.total_revenue),
              sale_count: n(p.sale_count),
            })
          )
        : [];

      const sum: BackendSummary | null = json.summary
        ? {
            order_count: n(json.summary.order_count),
            total_products: n(json.summary.total_products),
            total_quantity: n(json.summary.total_quantity),
            total_revenue: n(json.summary.total_revenue),
          }
        : null;

      const fallbackSummary: BackendSummary = {
        order_count: 0,
        total_products: products.length,
        total_quantity: products.reduce(
          (acc, r) => acc + n(r.total_quantity),
          0
        ),
        total_revenue: products.reduce(
          (acc, r) => acc + n(r.total_revenue),
          0
        ),
      };

      setRows(products);
      setSummary(sum ?? fallbackSummary);
    } catch (error) {
      console.error('Error loading sales data:', error);
      Swal.fire({
        icon: 'error',
        title: t('error'),
        text: t('failedToLoadSalesData'),
        timer: 2000,
        showConfirmButton: false,
      });
      setRows([]);
      setSummary({
        order_count: 0,
        total_products: 0,
        total_quantity: 0,
        total_revenue: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      loadSalesData(startDate, endDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, productType]);

  // ---- totals / formatting --------------------------------------
  const totals = useMemo(() => {
    const totalQty = Number(summary?.total_quantity ?? 0);
    const totalRev = Number(summary?.total_revenue ?? 0);
    const totalProducts = Number(summary?.total_products ?? rows.length);
    return {
      totalQuantity: totalQty,
      totalRevenue: totalRev,
      totalProducts,
    };
  }, [summary, rows]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(Number.isFinite(amount) ? amount : 0);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const dateRangeOptions = [
    { value: '7days', label: t('last7Days') },
    { value: '14days', label: t('last14Days') },
    { value: '1month', label: t('last1Month') },
    { value: '3months', label: t('last3Months') },
    { value: '6months', label: t('last6Months') },
  ];

  const safeDiv = (a: number, b: number) => (b > 0 ? a / b : 0);

  const groupRevenue = totals.totalRevenue || 0;

  // ---- UI --------------------------------------------------------
  return (
    <div
      className="min-h-screen p-6"
      style={{
        backgroundColor: document.documentElement.classList.contains('dark')
          ? '#111827'
          : '#f9fafb',
      }}
    >
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {t('backToDashboard')}
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-1 h-8 bg-blue-600 mr-3"></div>
            <div>
              <h1
                className="text-2xl font-bold"
                style={{
                  color: document.documentElement.classList.contains('dark')
                    ? 'white'
                    : '#111827',
                }}
              >
                {t('salesHistory')} – {productTypeLabel}
              </h1>
              <p
                className="text-sm mt-1"
                style={{
                  color: document.documentElement.classList.contains('dark')
                    ? '#9ca3af'
                    : '#6b7280',
                }}
              >
                {startDate &&
                  endDate &&
                  `${formatDate(startDate)} - ${formatDate(endDate)}`}
              </p>
            </div>
          </div>

          {summary && (
            <div
              className="text-sm"
              style={{
                color: document.documentElement.classList.contains('dark')
                  ? '#9ca3af'
                  : '#6b7280',
              }}
            >
              {t('ordersInPeriod')}{' '}
              <span
                className="font-semibold"
                style={{
                  color: document.documentElement.classList.contains('dark')
                    ? 'white'
                    : '#111827',
                }}
              >
                {summary.order_count}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Date Range Selector */}
      <div
        className="mb-6 rounded-lg border p-6"
        style={{
          backgroundColor: document.documentElement.classList.contains('dark')
            ? '#374151'
            : 'white',
          borderColor: document.documentElement.classList.contains('dark')
            ? '#4b5563'
            : '#e5e7eb',
        }}
      >
        <div className="flex items-center mb-4">
          <Calendar
            className="h-5 w-5 mr-2"
            style={{
              color: document.documentElement.classList.contains('dark')
                ? '#9ca3af'
                : '#6b7280',
            }}
          />
          <h2
            className="text-lg font-semibold"
            style={{
              color: document.documentElement.classList.contains('dark')
                ? 'white'
                : '#111827',
            }}
          >
            {t('selectTimePeriod')}
          </h2>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          {dateRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setDateRange(option.value as DateRange)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                !useCustomDate && dateRange === option.value
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'hover:bg-gray-200'
              }`}
              style={
                useCustomDate || dateRange !== option.value
                  ? {
                      backgroundColor:
                        document.documentElement.classList.contains('dark')
                          ? '#4b5563'
                          : '#f3f4f6',
                      color: document.documentElement.classList.contains(
                        'dark'
                      )
                        ? 'white'
                        : '#374151',
                    }
                  : {}
              }
            >
              {option.label}
            </button>
          ))}
        </div>

        <div
          className="border-t pt-4"
          style={{
            borderColor: document.documentElement.classList.contains('dark')
              ? '#4b5563'
              : '#e5e7eb',
          }}
        >
          <label
            className="block text-sm font-medium mb-2"
            style={{
              color: document.documentElement.classList.contains('dark')
                ? '#d1d5db'
                : '#374151',
            }}
          >
            {t('customDateHelp')}
          </label>

          <div className="flex items-center gap-4">
            <input
              type="date"
              value={customStartDate}
              max={iso(new Date())}
              onChange={(e) => {
                setUseCustomDate(true);
                setCustomStartDate(e.target.value);
              }}
              className="px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{
                backgroundColor: document.documentElement.classList.contains(
                  'dark'
                )
                  ? '#4b5563'
                  : 'white',
                borderColor: document.documentElement.classList.contains('dark')
                  ? '#6b7280'
                  : '#d1d5db',
                color: document.documentElement.classList.contains('dark')
                  ? 'white'
                  : '#111827',
              }}
            />

            {useCustomDate && customStartDate && (
              <div className="flex items-center gap-2">
                <span
                  style={{
                    color: document.documentElement.classList.contains('dark')
                      ? '#9ca3af'
                      : '#6b7280',
                  }}
                >
                  {t('to')}
                </span>

                <input
                  type="date"
                  value={endDate}
                  disabled
                  className="px-4 py-3 rounded-lg border bg-gray-100"
                  style={{
                    backgroundColor: document.documentElement.classList.contains(
                      'dark'
                    )
                      ? '#374151'
                      : '#f3f4f6',
                    borderColor: document.documentElement.classList.contains(
                      'dark'
                    )
                      ? '#6b7280'
                      : '#d1d5db',
                    color: document.documentElement.classList.contains('dark')
                      ? '#9ca3af'
                      : '#6b7280',
                  }}
                />

                <button
                  onClick={() => {
                    setUseCustomDate(false);
                    setCustomStartDate('');
                  }}
                  className="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  {t('clear')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* total products */}
        <div
          className="rounded-lg border p-6"
          style={{
            backgroundColor: document.documentElement.classList.contains(
              'dark'
            )
              ? '#374151'
              : 'white',
            borderColor: document.documentElement.classList.contains('dark')
              ? '#4b5563'
              : '#e5e7eb',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-medium mb-1"
                style={{
                  color: document.documentElement.classList.contains('dark')
                    ? '#9ca3af'
                    : '#6b7280',
                }}
              >
                {t('totalProducts')}
              </p>
              <p
                className="text-3xl font-bold"
                style={{
                  color: document.documentElement.classList.contains('dark')
                    ? 'white'
                    : '#111827',
                }}
              >
                {totals.totalProducts}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* total units sold */}
        <div
          className="rounded-lg border p-6"
          style={{
            backgroundColor: document.documentElement.classList.contains(
              'dark'
            )
              ? '#374151'
              : 'white',
            borderColor: document.documentElement.classList.contains('dark')
              ? '#4b5563'
              : '#e5e7eb',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-medium mb-1"
                style={{
                  color: document.documentElement.classList.contains('dark')
                    ? '#9ca3af'
                    : '#6b7280',
                }}
              >
                {t('totalUnitsSold')}
              </p>
              <p
                className="text-3xl font-bold"
                style={{
                  color: document.documentElement.classList.contains('dark')
                    ? 'white'
                    : '#111827',
                }}
              >
                {totals.totalQuantity.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* total revenue */}
        <div
          className="rounded-lg border p-6"
          style={{
            backgroundColor: document.documentElement.classList.contains(
              'dark'
            )
              ? '#374151'
              : 'white',
            borderColor: document.documentElement.classList.contains('dark')
              ? '#4b5563'
              : '#e5e7eb',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-medium mb-1"
                style={{
                  color: document.documentElement.classList.contains('dark')
                    ? '#9ca3af'
                    : '#6b7280',
                }}
              >
                {t('totalSalesAmount')}
              </p>
              <p
                className="text-3xl font-bold"
                style={{
                  color: document.documentElement.classList.contains('dark')
                    ? 'white'
                    : '#111827',
                }}
              >
                {formatCurrency(totals.totalRevenue)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl font-bold text-green-600">฿</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div
        className="rounded-lg shadow-sm overflow-hidden"
        style={{
          backgroundColor: document.documentElement.classList.contains('dark')
            ? '#374151'
            : 'white',
          borderColor: document.documentElement.classList.contains('dark')
            ? '#4b5563'
            : '#e5e7eb',
        }}
      >
        <div
          className="px-6 py-4 border-b"
          style={{
            backgroundColor: document.documentElement.classList.contains(
              'dark'
            )
              ? '#4b5563'
              : '#f9fafb',
            borderColor: document.documentElement.classList.contains('dark')
              ? '#6b7280'
              : '#e5e7eb',
          }}
        >
          <h2
            className="text-lg font-semibold"
            style={{
              color: document.documentElement.classList.contains('dark')
                ? 'white'
                : '#111827',
            }}
          >
            {t('productSalesDetails')}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className="border-b"
                style={{
                  backgroundColor: document.documentElement.classList.contains(
                    'dark'
                  )
                    ? '#4b5563'
                    : '#f9fafb',
                  borderColor: document.documentElement.classList.contains(
                    'dark'
                  )
                    ? '#6b7280'
                    : '#e5e7eb',
                }}
              >
                <th
                  className="px-6 py-4 text-left text-xs sm:text-sm font-semibold"
                  style={{
                    color: document.documentElement.classList.contains('dark')
                      ? '#d1d5db'
                      : '#374151',
                  }}
                >
                  {t('productName')}
                </th>

                <th
                  className="px-6 py-4 text-left text-xs sm:text-sm font-semibold"
                  style={{
                    color: document.documentElement.classList.contains('dark')
                      ? '#d1d5db'
                      : '#374151',
                  }}
                >
                  {t('brand')}
                </th>

                <th
                  className="px-6 py-4 text-right text-xs sm:text-sm font-semibold"
                  style={{
                    color: document.documentElement.classList.contains('dark')
                      ? '#d1d5db'
                      : '#374151',
                  }}
                >
                  {t('unitsSold')}
                </th>

                <th
                  className="px-6 py-4 text-right text-xs sm:text-sm font-semibold"
                  style={{
                    color: document.documentElement.classList.contains('dark')
                      ? '#d1d5db'
                      : '#374151',
                  }}
                >
                  {t('ordersShort')}
                </th>

                <th
                  className="px-6 py-4 text-right text-xs sm:text-sm font-semibold"
                  style={{
                    color: document.documentElement.classList.contains('dark')
                      ? '#d1d5db'
                      : '#374151',
                  }}
                >
                  {t('avgUnitPrice')}
                </th>

                <th
                  className="px-6 py-4 text-right text-xs sm:text-sm font-semibold"
                  style={{
                    color: document.documentElement.classList.contains('dark')
                      ? '#d1d5db'
                      : '#374151',
                  }}
                >
                  {t('totalSalesAmount')}
                </th>

                <th
                  className="px-6 py-4 text-right text-xs sm:text-sm font-semibold"
                  style={{
                    color: document.documentElement.classList.contains('dark')
                      ? '#d1d5db'
                      : '#374151',
                  }}
                >
                  {/* No key in resources, show EN fallback text */}
                  {`${t('unitsSold')} / ${t('ordersShort')}`}
                </th>

                <th
                  className="px-6 py-4 text-right text-xs sm:text-sm font-semibold"
                  style={{
                    color: document.documentElement.classList.contains('dark')
                      ? '#d1d5db'
                      : '#374151',
                  }}
                >
                  {/* also no key in resources yet, fallback */}
                  Revenue Share
                </th>
              </tr>
            </thead>

            <tbody
              className="divide-y"
              style={{
                borderColor: document.documentElement.classList.contains(
                  'dark'
                )
                  ? '#4b5563'
                  : '#e5e7eb',
              }}
            >
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                      <span
                        style={{
                          color: document.documentElement.classList.contains(
                            'dark'
                          )
                            ? '#9ca3af'
                            : '#6b7280',
                        }}
                      >
                        {t('loadingSalesData')}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center"
                    style={{
                      color: document.documentElement.classList.contains(
                        'dark'
                      )
                        ? '#9ca3af'
                        : '#6b7280',
                    }}
                  >
                    {t('noSalesData')}
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const qty = Number(r.total_quantity || 0);
                  const orders = Number(r.sale_count || 0);
                  const unitPrice = Number(r.unit_price || 0);
                  const revenue = Number(r.total_revenue || 0);

                  const avgUnitsPerOrder = safeDiv(qty, Math.max(1, orders));
                  const share =
                    groupRevenue > 0 ? (revenue / groupRevenue) * 100 : 0;

                  return (
                    <tr
                      key={r.product_id}
                      className="hover:bg-gray-50 transition-colors"
                      style={{
                        backgroundColor: document.documentElement.classList.contains(
                          'dark'
                        )
                          ? '#374151'
                          : 'white',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          document.documentElement.classList.contains('dark')
                            ? '#4b5563'
                            : '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          document.documentElement.classList.contains('dark')
                            ? '#374151'
                            : 'white';
                      }}
                    >
                      <td className="px-6 py-4">
                        <div
                          className="font-medium"
                          style={{
                            color: document.documentElement.classList.contains(
                              'dark'
                            )
                              ? 'white'
                              : '#111827',
                          }}
                        >
                          {r.product_name ?? '-'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className="text-sm"
                          style={{
                            color: document.documentElement.classList.contains(
                              'dark'
                            )
                              ? '#9ca3af'
                              : '#6b7280',
                          }}
                        >
                          {r.brand ?? '-'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span
                          className="font-semibold"
                          style={{
                            color: document.documentElement.classList.contains(
                              'dark'
                            )
                              ? 'white'
                              : '#111827',
                          }}
                        >
                          {qty.toLocaleString()}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span
                          style={{
                            color: document.documentElement.classList.contains(
                              'dark'
                            )
                              ? '#9ca3af'
                              : '#6b7280',
                          }}
                        >
                          {orders.toLocaleString()}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span
                          style={{
                            color: document.documentElement.classList.contains(
                              'dark'
                            )
                              ? '#d1d5db'
                              : '#374151',
                          }}
                        >
                          {formatCurrency(unitPrice)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-green-600">
                          {formatCurrency(revenue)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span
                          style={{
                            color: document.documentElement.classList.contains(
                              'dark'
                            )
                              ? '#9ca3af'
                              : '#6b7280',
                          }}
                        >
                          {avgUnitsPerOrder.toFixed(2)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span
                          className="font-semibold"
                          style={{
                            color: document.documentElement.classList.contains(
                              'dark'
                            )
                              ? '#d1d5db'
                              : '#374151',
                          }}
                        >
                          {share.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
