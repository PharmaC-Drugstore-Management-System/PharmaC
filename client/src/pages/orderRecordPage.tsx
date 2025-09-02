import { useEffect, useState } from 'react';
import { Edit, Package, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


export default function OrderRecord() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
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
      const response = await fetch('http://localhost:5000/order/list', {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();

      if (data.status && data.data) {
        setOrders(data.data);
        console.log('Order data with customer info:', data.data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.log('Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };
  
  const checkme = async () => {
    try {
      const authme = await fetch('http://localhost:5000/api/me', {
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
            Order Records
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
                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>Completed Orders</p>
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
                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>Cancelled Orders</p>
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
                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>Total Orders</p>
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
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                  Customer Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                  Order Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                    style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y"
                   style={{
                     backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                     borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
                   }}>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center"
                      style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                    Loading orders...
                  </td>
                </tr>
              ) : currentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center"
                      style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                    No orders found
                  </td>
                </tr>
              ) : (
                currentOrders.map((order) => (
                  <tr key={order.order_id} className="transition-colors"
                      style={{
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#4b5563' : '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#374151' : 'white';
                      }}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
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
                            {order.customer?.name || 'Walk-in Customer'}
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
                        <span className="ml-2">{order.status || 'Pending'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
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
          Showing {startIndex + 1} to {Math.min(endIndex, orders.length)} of {orders.length} orders
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
            <span className="sr-only">Previous</span>
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
            <span className="sr-only">Next</span>
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