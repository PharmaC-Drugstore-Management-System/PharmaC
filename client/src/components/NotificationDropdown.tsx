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

  // Debug: log notifications เมื่อ dropdown เปิด
  console.log('🔔 NotificationDropdown received notifications:', notifications.length);
  console.log('📋 First 3 notification order IDs:', notifications.slice(0, 3).map(n => n.orderId));


  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="w-8 h-8 text-blue-500 bg-blue-100 rounded-full p-1.5" />;
      case 'user':
        return <User className="w-8 h-8 text-green-500 bg-green-100 rounded-full p-1.5" />;
      default:
        return <Clock className="w-8 h-8 text-gray-500 bg-gray-100 rounded-full p-1.5" />;
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
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
              ชำระแล้ว
            </span>
          </div>
        );
      case 'PENDING':
        return (
          <div className="flex items-center space-x-1">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
              รอชำระ
            </span>
          </div>
        );
      case 'FAILED':
      case 'CANCELLED':
        return (
          <div className="flex items-center space-x-1">
            <X className="w-4 h-4 text-red-500" />
            <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
              ยกเลิก
            </span>
          </div>
        );
      default:
        return (
          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
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
      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-800">การแจ้งเตือน</h3>
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
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>รีเฟรช</span>
            </button>
          
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm">ไม่มีการแจ้งเตือน</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => {
                  onNotificationClick(notification);
                 
                }}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium ${
                          !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        <p className={`text-sm mt-1 ${
                          !notification.isRead ? 'text-gray-800' : 'text-gray-600'
                        }`}>
                          {notification.message}
                        </p>
                        
                        {/* แสดงชื่อลูกค้า */}
                        {notification.customerName && (
                          <p className="text-xs text-blue-600 mt-1">
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
                    <p className="text-xs text-gray-500 mt-2">
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
          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium py-2">
              ดูการแจ้งเตือนทั้งหมด
            </button>
          </div>
        )}
      </div>
    </>
  );
}
