import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL;

type LotData = {
  lot_id: number;
  lot_no: string;
  init_amount: number;
  added_date: string;
  expired_date: string;
  cost: number;
  product_id: number;
  product?: {
    product_id: number;
    product_name: string;
    brand?: string;
  };
};

type ExpiryStatus = 'expired' | 'critical' | 'warning' | 'safe';

export default function ExpiryMonitor() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [lots, setLots] = useState<LotData[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ExpiryStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get expiry status based on remaining days
  const getExpiryStatus = (expiredDate: string): ExpiryStatus => {
    const today = new Date();
    const expiryDate = new Date(expiredDate);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'expired';
    if (diffDays <= 90) return 'critical'; // Less than 3 months
    if (diffDays <= 180) return 'warning'; // Less than 6 months
    return 'safe';
  };

  // Get status color and styling
  const getStatusStyle = (status: ExpiryStatus) => {
    switch (status) {
      case 'expired':
        return {
          bgColor: 'bg-red-200',
          textColor: 'text-red-800',
          borderColor: 'border-red-500',
          icon: AlertTriangle,
          label: 'Expired',
          priority: 4
        };
      case 'critical':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          icon: AlertTriangle,
          label: 'Critical',
          priority: 3
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200',
          icon: Clock,
          label: 'Warning',
          priority: 2
        };
      case 'safe':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          icon: CheckCircle,
          label: 'Safe',
          priority: 1
        };
    }
  };

  // Get remaining days
  const getRemainingDays = (expiredDate: string): number => {
    const today = new Date();
    const expiryDate = new Date(expiredDate);
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Format date to display format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/lot/getLotProduct`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lot data');
      }

      const result = await response.json();
      
      if (result.status && result.data) {
        setLots(result.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load expiry data',
        timer: 2000,
        showConfirmButton: false
      });
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_URL}/api/me`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.status === 401 || response.status === 403) {
        navigate('/login');
        return;
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  // Filter lots based on search term and status filter
  const filteredLots = lots.filter(lot => {
    const matchesSearch = !searchTerm || 
      (lot.product?.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       lot.product?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       lot.lot_no.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || getExpiryStatus(lot.expired_date) === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Sort by expiry status priority
  const sortedLots = [...filteredLots].sort((a, b) => {
    const statusA = getExpiryStatus(a.expired_date);
    const statusB = getExpiryStatus(b.expired_date);
    return getStatusStyle(statusB).priority - getStatusStyle(statusA).priority;
  });

  // Get summary statistics
  const getStats = () => {
    const stats = {
      expired: lots.filter(lot => getExpiryStatus(lot.expired_date) === 'expired').length,
      critical: lots.filter(lot => getExpiryStatus(lot.expired_date) === 'critical').length,
      warning: lots.filter(lot => getExpiryStatus(lot.expired_date) === 'warning').length,
      safe: lots.filter(lot => getExpiryStatus(lot.expired_date) === 'safe').length,
    };
    return stats;
  };

  useEffect(() => {
    checkAuth();
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = getStats();

  return (
    <div className="min-h-screen p-6"
         style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#f9fafb'}}>
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-1 h-8 bg-green-600 mr-3"></div>
            <h1 className="text-2xl font-bold"
                style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
              {t('expiryMonitor')}
            </h1>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { status: 'expired', label: 'Expired', count: stats.expired, color: 'red' },
          { status: 'critical', label: 'Critical (<3 months)', count: stats.critical, color: 'red' },
          { status: 'warning', label: 'Warning (<6 months)', count: stats.warning, color: 'yellow' },
          { status: 'safe', label: 'Safe', count: stats.safe, color: 'green' },
        ].map((stat) => (
          <div
            key={stat.status}
            className="rounded-lg border p-6 cursor-pointer hover:shadow-lg transition-shadow"
            style={{
              backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
              borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
            }}
            onClick={() => setFilterStatus(filterStatus === stat.status ? 'all' : stat.status as ExpiryStatus)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium"
                   style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                  {stat.label}
                </p>
                <p className="text-2xl font-bold"
                   style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                  {stat.count}
                </p>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                {stat.status === 'expired' && <AlertTriangle className={`h-6 w-6 text-${stat.color}-600`} />}
                {stat.status === 'critical' && <AlertTriangle className={`h-6 w-6 text-${stat.color}-600`} />}
                {stat.status === 'warning' && <Clock className={`h-6 w-6 text-${stat.color}-600`} />}
                {stat.status === 'safe' && <CheckCircle className={`h-6 w-6 text-${stat.color}-600`} />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by product name, brand, or lot number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{
                backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
                color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'
              }}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ExpiryStatus | 'all')}
            className="px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            style={{
              backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
              borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
              color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'
            }}
          >
            <option value="all">All Status</option>
            <option value="expired">Expired</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="safe">Safe</option>
          </select>
        </div>
      </div>

      {/* Lots Table */}
      <div className="rounded-lg shadow-sm overflow-hidden"
           style={{
             backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
             borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
           }}>
        {/* Table Header */}
        <div className="px-6 py-4 border-b grid grid-cols-6 gap-4 font-medium text-sm"
             style={{
               backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f9fafb',
               borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#e5e7eb',
               color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'
             }}>
          <div>Product</div>
          <div>Brand</div>
          <div>Lot Number</div>
          <div>Amount</div>
          <div>Expiry Date</div>
          <div>Status</div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                Loading expiry data...
              </p>
            </div>
          </div>
        ) : sortedLots.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
              No lots found matching your criteria
            </p>
          </div>
        ) : (
          <div className="divide-y overflow-y-auto" 
               style={{
                 borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
               }}>
            {sortedLots.map((lot) => {
              const status = getExpiryStatus(lot.expired_date);
              const statusStyle = getStatusStyle(status);
              const remainingDays = getRemainingDays(lot.expired_date);
              const StatusIcon = statusStyle.icon;

              return (
                <div key={lot.lot_id} 
                     className="px-6 py-4 grid grid-cols-6 gap-4 hover:shadow-sm transition-all duration-300 border-b border-gray-300"
                     style={{
                       backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                       borderBottomColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db'
                     }}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#4b5563' : '#f9fafb';
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#374151' : 'white';
                     }}>
                  <div className="flex flex-col">
                    <span className="font-medium"
                          style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                      {lot.product?.product_name || 'Unknown Product'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm"
                          style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                      {lot.product?.brand || 'Unknown Brand'}
                    </span>
                  </div>
                  <div>
                    <span className="font-mono text-sm px-2 py-1 rounded bg-gray-100 text-gray-800">
                      {lot.lot_no}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold"
                          style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                      {lot.init_amount}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium"
                          style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                      {formatDate(lot.expired_date)}
                    </span>
                    <span className="text-xs"
                          style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                      {remainingDays >= 0 ? `${remainingDays} days left` : `${Math.abs(remainingDays)} days overdue`}
                    </span>
                  </div>
                  <div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bgColor} ${statusStyle.textColor} ${statusStyle.borderColor} border`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusStyle.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
