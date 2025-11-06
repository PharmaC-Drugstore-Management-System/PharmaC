import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Package, User, Clock, CheckCircle, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export default function OrderRecord() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const recordsPerPage = 5;

  // Calculate pagination values
  const totalPages = Math.ceil(orders.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  // Reset to first page when orders change
  useEffect(() => {
    setCurrentPage(1);
  }, [orders.length]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'SUCCEEDED':
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
      case 'REQUIRES_ACTION':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'SUCCEEDED':
      case 'PAID':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'CANCELLED':
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };
  
  const orderLoadData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/order/list`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok && data.status && data.data) {
        setOrders(data.data);
        console.log('Order data with customer info:', data.data);
      } else {
        setOrders([]);
        // GET request - show error alert only
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to load orders',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
      }
    } catch (error) {
      console.log('Error loading orders:', error);
      setOrders([]);
      // GET request - show error alert only
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Network error occurred. Please try again.',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
    } finally {
      setLoading(false);
    }
  };
  
  const checkme = async () => {
    try {
      const authme = await fetch(`${API_URL}/me`, {
        method: 'GET',
        credentials: 'include'
      })
      const data = await authme.json();
      if (authme.status === 401 || authme.status === 403) {
        navigate('/login');
        return;
      }

      console.log('Authme data:', data);
    } catch (error) {
      console.log('Error', error)

    }
  }


  useEffect(() => {
    checkme()
    orderLoadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  return (
    <div className="min-h-screen"
         style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#f9fafb'}}>
      <div className="p-4">
      {/* Header */}
      <div className="mb-8">
        {/* Inventory Title */}
        <div className="flex items-center mb-6">
          <div className="w-1 h-8 bg-green-600 mr-2"></div>
          <h2 className="text-xl font-bold"
              style={{color: document.documentElement.classList.contains('dark') ? 'white' : 'black'}}>
            {t('orderRecords')}
          </h2>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 mb-3">
        <div className="p-6 rounded-lg shadow-sm border"
             style={{
               backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
               borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
             }}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium"
                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>{t('completedOrders')}</p>
              <p className="text-2xl font-bold"
                 style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                {orders.filter(order =>
                  order.status?.toUpperCase() === 'COMPLETED' ||
                  order.status?.toUpperCase() === 'SUCCEEDED' ||
                  order.status?.toUpperCase() === 'PAID'
                ).length}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg shadow-sm border"
             style={{
               backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
               borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
             }}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium"
                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>{t('cancelledOrders')}</p>
              <p className="text-2xl font-bold"
                 style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                {orders.filter(order => order.status?.toUpperCase() === 'CANCELLED' || order.status?.toUpperCase() === 'FAILED').length}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg shadow-sm border"
             style={{
               backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
               borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
             }}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium"
                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>{t('totalOrders')}</p>
              <p className="text-2xl font-bold"
                 style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>{orders.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-lg shadow-sm border"
           style={{
             backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
             borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
           }}>
        <table className="w-full">
          <thead className="border-b"
                 style={{
                   backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f9fafb',
                   borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#e5e7eb'
                 }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                  {t('orderId')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                  {t('customerName')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                  {t('orderDate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                  {t('status')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                    style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody style={{
                     backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white'
                   }}>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center"
                      style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                    {t('loadingOrders')}
                  </td>
                </tr>
              ) : currentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center"
                      style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                    {t('noOrdersFound')}
                  </td>
                </tr>
              ) : (
                currentOrders.map((order) => (
                  <>
                    <tr key={order.order_id} className="transition-colors border-b border-gray-300 cursor-pointer"
                        style={{
                          backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                          borderBottomColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db'
                        }}
                        onClick={() => setExpandedOrderId(expandedOrderId === order.order_id ? null : order.order_id)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#4b5563' : '#f9fafb';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#374151' : 'white';
                        }}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {expandedOrderId === order.order_id ? (
                            <ChevronDown className="w-5 h-5 mr-2 text-blue-600" />
                          ) : (
                            <ChevronRight className="w-5 h-5 mr-2 text-gray-400" />
                          )}
                          <div className="text-sm font-medium"
                               style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>#{order.order_id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium"
                                 style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                              {order.customer?.name || t('walkInCustomer')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm"
                             style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                          {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-xs"
                             style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                          {order.date ? `(${new Date(order.date).toLocaleTimeString()})` : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status || 'Pending')}`}>
                          {getStatusIcon(order.status || 'Pending')}
                          <span className="ml-2">{order.status || t('pending')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}>
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded row showing order items */}
                    {expandedOrderId === order.order_id && (
                      <tr key={`${order.order_id}-details`}>
                        <td colSpan={5} className="px-6 py-4 border-b"
                            style={{
                              backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#f3f4f6',
                              borderBottomColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db'
                            }}>
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold flex items-center"
                                style={{color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151'}}>
                              <Package className="w-4 h-4 mr-2" />
                              {t('orderItems')}
                            </h4>
                            
                            {/* Display order_items if available, otherwise show carts */}
                            {order.order_items && order.order_items.length > 0 ? (
                              <div className="space-y-2">
                                {order.order_items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border"
                                       style={{
                                         backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                                         borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
                                       }}>
                                    <div className="flex items-center space-x-3 flex-1">
                                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <span className="text-sm font-semibold text-blue-600">
                                          {idx + 1}
                                        </span>
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-sm font-medium"
                                           style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                                          {item.product?.product_name || 'Unknown Product'}
                                        </p>
                                        <p className="text-xs"
                                           style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                                          {item.product?.producttype && `Type: ${item.product.producttype}`}
                                          {item.product?.unit && ` • Unit: ${item.product.unit}`}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-semibold"
                                         style={{color: document.documentElement.classList.contains('dark') ? '#60a5fa' : '#2563eb'}}>
                                        Qty: {item.quantity}
                                      </p>
                                      <p className="text-xs font-medium"
                                         style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                                        ฿{item.unit_price?.toFixed(2) || '0.00'} each
                                      </p>
                                      <p className="text-sm font-bold mt-1"
                                         style={{color: document.documentElement.classList.contains('dark') ? '#34d399' : '#059669'}}>
                                        ฿{((item.unit_price || 0) * item.quantity).toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : order.carts && order.carts.length > 0 ? (
                              <div className="space-y-2">
                                {order.carts.map((cart: any, idx: number) => (
                                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border"
                                       style={{
                                         backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                                         borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
                                       }}>
                                    <div className="flex items-center space-x-3 flex-1">
                                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                        <span className="text-sm font-semibold text-green-600">
                                          {idx + 1}
                                        </span>
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-sm font-medium"
                                           style={{color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'}}>
                                          {cart.product?.product_name || 'Unknown Product'}
                                        </p>
                                        <p className="text-xs"
                                           style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                                          {cart.product?.producttype && `Type: ${cart.product.producttype}`}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-semibold"
                                         style={{color: document.documentElement.classList.contains('dark') ? '#34d399' : '#059669'}}>
                                        Qty: {cart.amount}
                                      </p>
                                      <p className="text-xs font-medium"
                                         style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                                        ฿{cart.unit_price?.toFixed(2) || '0.00'} each
                                      </p>
                                      <p className="text-sm font-bold mt-1"
                                         style={{color: document.documentElement.classList.contains('dark') ? '#10b981' : '#047857'}}>
                                        ฿{((cart.unit_price || 0) * cart.amount).toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm"
                                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                                No items found for this order
                              </p>
                            )}
                            
                            {/* Order Summary */}
                            <div className="mt-4 pt-3 border-t"
                                 style={{borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'}}>
                              <div className="space-y-2">
                                {order.discount_amount > 0 && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm"
                                          style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                                      Discount ({order.discount_type}):
                                    </span>
                                    <span className="text-sm font-medium text-red-600">
                                      -฿{order.discount_amount?.toFixed(2)}
                                    </span>
                                  </div>
                                )}
                                {order.vat > 0 && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm"
                                          style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                                      VAT:
                                    </span>
                                    <span className="text-sm font-medium"
                                          style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                                      ฿{order.vat?.toFixed(2)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        {/* Records info */}
        <div className="text-sm"
             style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#374151'}}>
          {t('showingOrders', { start: startIndex + 1, end: Math.min(endIndex, orders.length), total: orders.length })}
        </div>

        {/* Pagination controls */}
        <nav className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`p-2 text-sm font-medium rounded-lg transition-colors ${
              currentPage === 1 
                ? 'cursor-not-allowed' 
                : 'hover:bg-gray-100'
            }`}
            style={{
              color: currentPage === 1 
                ? (document.documentElement.classList.contains('dark') ? '#6b7280' : '#9ca3af')
                : (document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151')
            }}
            onMouseEnter={(e) => {
              if (currentPage !== 1) {
                e.currentTarget.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#4b5563' : '#f3f4f6';
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== 1) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span className="sr-only">{t('previous')}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center space-x-1">
            <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg">
              {currentPage.toString().padStart(2, '0')}
            </button>
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`p-2 text-sm font-medium rounded-lg transition-colors ${
              currentPage === totalPages 
                ? 'cursor-not-allowed' 
                : 'hover:bg-gray-100'
            }`}
            style={{
              color: currentPage === totalPages 
                ? (document.documentElement.classList.contains('dark') ? '#6b7280' : '#9ca3af')
                : (document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151')
            }}
            onMouseEnter={(e) => {
              if (currentPage !== totalPages) {
                e.currentTarget.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#4b5563' : '#f3f4f6';
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== totalPages) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span className="sr-only">{t('next')}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </nav>
      </div>

      </div>
    </div>
  );
}