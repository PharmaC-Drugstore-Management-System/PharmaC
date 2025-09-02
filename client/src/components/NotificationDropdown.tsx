import { Clock, Package, User, X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface Notification {
  id: string;
  type: 'order' | 'system' | 'user';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  orderId?: number;
  customerName?: string;
  orderStatus?: string; // เพิ่มฟิลด์สำหรับสถานะ order
}

interface NotificationDropdownProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  onNotificationClick: (notification: Notification) => void;
  socketConnected?: boolean; // เพิ่มสถานะ WebSocket connection
}

export default function NotificationDropdown({
  notifications,
  isOpen,
  onClose,
  onNotificationClick,
  socketConnected = false
}: NotificationDropdownProps) {
  if (!isOpen) return null;

  // Check if dark mode is enabled
  const isDark = document.documentElement.classList.contains('dark');

  // Debug: log notifications เมื่อ dropdown เปิด
  console.log('🔔 NotificationDropdown received notifications:', notifications.length);
  console.log('📋 First 3 notification order IDs:', notifications.slice(0, 3).map(n => n.orderId));


  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="w-8 h-8 text-blue-500 rounded-full p-1.5"
                        style={{backgroundColor: isDark ? '#1e3a8a' : '#dbeafe'}} />;
      case 'user':
        return <User className="w-8 h-8 text-green-500 rounded-full p-1.5"
                     style={{backgroundColor: isDark ? '#166534' : '#dcfce7'}} />;
      default:
        return <Clock className="w-8 h-8 text-gray-500 rounded-full p-1.5"
                      style={{backgroundColor: isDark ? '#4b5563' : '#f3f4f6'}} />;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    switch (status.toUpperCase()) {
      case 'PAID':
      case 'COMPLETED':
        return (
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium text-green-600 px-2 py-1 rounded-full"
                  style={{backgroundColor: isDark ? '#166534' : '#dcfce7'}}>
              ชำระแล้ว
            </span>
          </div>
        );
      case 'PENDING':
        return (
          <div className="flex items-center space-x-1">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-medium text-orange-600 px-2 py-1 rounded-full"
                  style={{backgroundColor: isDark ? '#ea580c' : '#fed7aa'}}>
              รอชำระ
            </span>
          </div>
        );
      case 'FAILED':
      case 'CANCELLED':
        return (
          <div className="flex items-center space-x-1">
            <X className="w-4 h-4 text-red-500" />
            <span className="text-xs font-medium text-red-600 px-2 py-1 rounded-full"
                  style={{backgroundColor: isDark ? '#dc2626' : '#fecaca'}}>
              ยกเลิก
            </span>
          </div>
        );
      default:
        return (
          <span className="text-xs font-medium px-2 py-1 rounded-full"
                style={{
                  color: isDark ? '#d1d5db' : '#4b5563',
                  backgroundColor: isDark ? '#4b5563' : '#f3f4f6'
                }}>
            {status}
          </span>
        );
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    
    // Debug: log timestamp conversion
    console.log('🕐 Formatting timestamp:', timestamp, '→', time.toLocaleString());
    
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'เมื่อสักครู่';
    if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ชั่วโมงที่แล้ว`;
    return `${Math.floor(diffInMinutes / 1440)} วันที่แล้ว`;
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      
      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-80 rounded-lg shadow-2xl border z-50 max-h-96 overflow-hidden transition-colors duration-300"
           style={{
             backgroundColor: isDark ? '#374151' : 'white',
             borderColor: isDark ? '#4b5563' : '#e5e7eb'
           }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b transition-colors duration-300"
             style={{
               borderColor: isDark ? '#4b5563' : '#e5e7eb',
               backgroundColor: isDark ? '#4b5563' : '#f9fafb'
             }}>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold transition-colors duration-300"
                style={{color: isDark ? 'white' : '#1f2937'}}>การแจ้งเตือน</h3>
            <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`} 
                 title={socketConnected ? 'Real-time connected' : 'Real-time disconnected'}></div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                console.log('🔄 Manual refresh notifications clicked');
                if ((window as any).refreshNotifications) {
                  (window as any).refreshNotifications();
                }
              }}
              className="text-sm font-medium flex items-center space-x-1 transition-colors duration-200"
              style={{color: isDark ? '#60a5fa' : '#2563eb'}}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.color = isDark ? '#93c5fd' : '#1d4ed8';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.color = isDark ? '#60a5fa' : '#2563eb';
              }}
            >
              <RefreshCw className="w-3 h-3" />
              <span>รีเฟรช</span>
            </button>
          
            <button
              onClick={onClose}
              className="transition-colors duration-200"
              style={{color: isDark ? '#9ca3af' : '#6b7280'}}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.color = isDark ? '#d1d5db' : '#4b5563';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.color = isDark ? '#9ca3af' : '#6b7280';
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="w-12 h-12 mx-auto mb-3 transition-colors duration-300"
                     style={{color: isDark ? '#6b7280' : '#d1d5db'}} />
              <p className="text-sm transition-colors duration-300"
                 style={{color: isDark ? '#9ca3af' : '#6b7280'}}>ไม่มีการแจ้งเตือน</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => {
                  onNotificationClick(notification);
                 
                }}
                className={`p-4 border-b cursor-pointer transition-colors duration-200 ${
                  !notification.isRead ? 'border-l-4 border-l-blue-500' : ''
                }`}
                style={{
                  borderColor: isDark ? '#4b5563' : '#f3f4f6',
                  backgroundColor: !notification.isRead 
                    ? (isDark ? '#1e3a8a' : '#eff6ff')
                    : 'transparent'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLDivElement;
                  if (!notification.isRead) return;
                  target.style.backgroundColor = isDark ? '#4b5563' : '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLDivElement;
                  if (!notification.isRead) return;
                  target.style.backgroundColor = 'transparent';
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium transition-colors duration-300 ${
                          !notification.isRead ? '' : ''
                        }`}
                            style={{
                              color: !notification.isRead 
                                ? (isDark ? 'white' : '#111827')
                                : (isDark ? '#e5e7eb' : '#374151')
                            }}>
                          {notification.title}
                        </h4>
                        <p className={`text-sm mt-1 transition-colors duration-300 ${
                          !notification.isRead ? '' : ''
                        }`}
                           style={{
                             color: !notification.isRead 
                               ? (isDark ? '#d1d5db' : '#1f2937')
                               : (isDark ? '#9ca3af' : '#4b5563')
                           }}>
                          {notification.message}
                        </p>
                        
                        {/* แสดงชื่อลูกค้า */}
                        {notification.customerName && (
                          <p className="text-xs mt-1 transition-colors duration-300"
                             style={{color: isDark ? '#60a5fa' : '#2563eb'}}>
                            ลูกค้า: {notification.customerName}
                          </p>
                        )}
                        
                        {/* แสดงสถานะ order */}
                        {notification.orderStatus && (
                          <div className="mt-2">
                            {getStatusBadge(notification.orderStatus)}
                          </div>
                        )}
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-2"></div>
                      )}
                    </div>
                    <p className="text-xs mt-2 transition-colors duration-300"
                       style={{color: isDark ? '#6b7280' : '#9ca3af'}}>
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t transition-colors duration-300"
               style={{
                 backgroundColor: isDark ? '#4b5563' : '#f9fafb',
                 borderColor: isDark ? '#4b5563' : '#e5e7eb'
               }}>
            <button className="w-full text-sm font-medium py-2 transition-colors duration-200"
                    style={{color: isDark ? '#60a5fa' : '#2563eb'}}
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.color = isDark ? '#93c5fd' : '#1d4ed8';
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLButtonElement;
                      target.style.color = isDark ? '#60a5fa' : '#2563eb';
                    }}>
              ดูการแจ้งเตือนทั้งหมด
            </button>
          </div>
        )}
      </div>
    </>
  );
}
