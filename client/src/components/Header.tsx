import { useEffect, useState } from "react";
import { Plus, User, Settings, ChevronDown, LogOut, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationDropdown from "./NotificationDropdown";
import { io, Socket } from 'socket.io-client';

interface UserProfile {
  firstname: string;
  lastname: string;
  email: string;
  profile_image?: string;
}

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

export default function Header() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const checkme = async () => {
    try {
      console.log('Loading profile data from API...');
      
      // Step 1: Get employee_id from JWT token
      const authResponse = await fetch('http://localhost:5000/api/me', {
        method: 'GET',
        credentials: 'include'
      });

      if (authResponse.status === 401 || authResponse.status === 403) {
        navigate('/login');
        return;
      }

      const authResult = await authResponse.json();
      const employeeIdFromToken = authResult.user.employee_id || authResult.user.id;

      if (!employeeIdFromToken) {
        console.error('No employee ID found in token');
        navigate('/login');
        return;
      }

      setEmployeeId(employeeIdFromToken);

      // Step 2: Use employee_id to get full account details
      const accountResponse = await fetch('http://localhost:5000/acc/account-detail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ employee_id: employeeIdFromToken })
      });

      if (accountResponse.status === 401 || accountResponse.status === 403) {
        navigate('/login');
        return;
      }

      const result = await accountResponse.json();
      const user = result.data;

      console.log('User account data:', user);

      // Set user profile data including profile image
      setUserProfile({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        email: user.email || '',
        profile_image: user.profile_image || '',
      });

    } catch (error) {
      console.log('Error loading profile data:', error);
    }
  };

  // Load initial notifications from recent orders
  const loadInitialNotifications = async (markAsRead: boolean = true) => {
    try {
      console.log('🔄 Loading initial notifications from database...');
      
      // เก็บ notifications ที่ยังไม่ได้อ่านไว้ก่อน
      const currentUnreadNotifications = notifications.filter(n => !n.isRead);
      console.log('💾 Preserving unread notifications:', currentUnreadNotifications.length);
      
      const response = await fetch('http://localhost:5000/order/latest?limit=20', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Latest orders from API:', data);
        console.log('🏆 Latest order ID from API:', data.orders?.[0]?.order_id);
        console.log('📋 All latest order IDs:', data.orders?.slice(0, 5).map((o: any) => o.order_id));
        
        if (data.orders && data.orders.length > 0) {
          const initialNotifications = data.orders.slice(0, 10).map((order: any) => {
            const statusText = order.status === 'PAID' ? 'ชำระแล้ว' : 
                              order.status === 'PENDING' ? 'รอชำระ' : 
                              order.status || 'ไม่ระบุ';
            
            // ตรวจสอบว่า notification นี้เป็น unread อยู่แล้วหรือไม่
            const existingUnread = currentUnreadNotifications.find(n => n.orderId === order.order_id);
            const shouldBeRead = existingUnread ? false : markAsRead;
            
            return {
              id: `initial-${order.order_id}-${Date.now()}`,
              type: 'order' as const,
              title: 'Order ในระบบ',
              message: `Order #${order.order_id} มีมูลค่า ฿${order.total_amount} (${statusText})`,
              timestamp: order.date,
              isRead: shouldBeRead, // คงสถานะ unread ถ้าเป็น notification ใหม่
              orderId: order.order_id,
              customerName: order.customer?.name || 'ลูกค้าทั่วไป',
              orderStatus: order.status || 'PENDING'
            };
          });
          
          console.log('✅ Setting initial notifications:', initialNotifications);
          console.log('🎯 First notification order ID:', initialNotifications[0]?.orderId);
          console.log('🔍 Unread notifications after refresh:', initialNotifications.filter((n: any) => !n.isRead).length);
          setNotifications(initialNotifications);
        }
      }
    } catch (error) {
      console.log('❌ Error loading initial notifications:', error);
    }
  };

  // Refresh notifications - expose this function globally for POS page to call
  const refreshNotifications = async () => {
    console.log('🔄 Force refreshing notifications from POS...');
    console.log('💾 Current unread count before refresh:', notifications.filter(n => !n.isRead).length);
    
    // ไม่ clear notifications ก่อน เพื่อเก็บข้อมูล unread ไว้
    await loadInitialNotifications(true);
  };

  // Make refresh function available globally
  useEffect(() => {
    (window as any).refreshNotifications = refreshNotifications;
    
    return () => {
      delete (window as any).refreshNotifications;
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Clear local storage
      localStorage.clear();
      
      // Navigate to login page
      navigate('/login');
      
    } catch (error) {
      console.log('Error during logout:', error);
      // Still navigate to login even if API call fails
      localStorage.clear();
      navigate('/login');
    }
  };

  const handleMarkAsRead = (id: string) => {
    console.log('📖 Marking notification as read:', id);
    setNotifications(prev => {
      const updated = prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      );
      console.log('📊 Unread count after marking as read:', updated.filter(n => !n.isRead).length);
      return updated;
    });
  };

  const handleMarkAllAsRead = () => {
    console.log('📖 Marking all notifications as read');
    setNotifications(prev => {
      const updated = prev.map(notif => ({ ...notif, isRead: true }));
      console.log('📊 All notifications marked as read, unread count:', updated.filter(n => !n.isRead).length);
      return updated;
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    console.log('Notification clicked:', notification);
    if (notification.type === 'order' && notification.orderId) {
      navigate('/order-record');
    }
    setShowNotificationDropdown(false);
  };

  useEffect(() => {
    checkme();
    loadInitialNotifications();
    
    // Initialize Socket.IO connection for real-time notifications
    const socketConnection = io('http://localhost:5000', {
      transports: ['websocket']
    });
    
    socketConnection.on('connect', () => {
      console.log('Socket.IO connected for notifications');
    });
    
    // ฟัง admin-notification event แทน newOrder
    socketConnection.on('admin-notification', (data: any) => {
      console.log('🔔 Admin notification received via Socket.IO:', data);
      console.log('🔢 Order ID from notification:', data.order?.order_id);
      console.log('💰 Total amount from notification:', data.order?.total_amount);
      console.log('👤 Customer from notification:', data.order?.customer);
      
      if (data.type === 'NEW_ORDER' && data.order) {
        const statusText = data.order.status === 'PAID' ? 'ชำระแล้ว' : 
                          data.order.status === 'PENDING' ? 'รอชำระ' : 
                          data.order.status || 'ไม่ระบุ';
        
        const newNotification: Notification = {
          id: `order-${data.order.order_id}-${Date.now()}`,
          type: 'order',
          title: 'Order ใหม่เข้ามา!',
          message: `Order #${data.order.order_id} มีมูลค่า ฿${data.order.total_amount} (${statusText})`,
          timestamp: data.timestamp || new Date().toISOString(),
          isRead: false,
          orderId: data.order.order_id,
          customerName: data.order.customer?.name || 'ลูกค้าทั่วไป',
          orderStatus: data.order.status || 'PENDING'
        };
        
        console.log('✅ Creating new notification:', newNotification);
        setNotifications(prev => {
          console.log('📋 Previous notifications count:', prev.length);
          
          // ตรวจสอบว่ามี notification ของ order นี้อยู่แล้วหรือไม่
          const existingIndex = prev.findIndex(n => n.orderId === newNotification.orderId);
          
          let updated;
          if (existingIndex !== -1) {
            // ถ้ามีแล้ว ให้แทนที่ด้วยข้อมูลใหม่
            updated = [...prev];
            updated[existingIndex] = newNotification;
            console.log('🔄 Updated existing notification for order:', newNotification.orderId);
          } else {
            // ถ้าไม่มี ให้เพิ่มใหม่
            updated = [newNotification, ...prev];
            console.log('➕ Added new notification for order:', newNotification.orderId);
          }
          
          console.log('📋 Updated notifications count:', updated.length);
          console.log('🔔 Unread notifications count:', updated.filter(n => !n.isRead).length);
          return updated;
        });
      }
    });
    
    // ยังคงฟัง newOrder event เผื่อมีการใช้ที่อื่น
    socketConnection.on('newOrder', (data: any) => {
      console.log('New order received via Socket.IO (legacy):', data);
      
      const statusText = data.order.status === 'PAID' ? 'ชำระแล้ว' : 
                        data.order.status === 'PENDING' ? 'รอชำระ' : 
                        data.order.status || 'ไม่ระบุ';
      
      const newNotification: Notification = {
        id: `order-${data.order.order_id}-${Date.now()}`,
        type: 'order',
        title: 'Order ใหม่เข้ามา!',
        message: `Order #${data.order.order_id} มีมูลค่า ฿${data.order.total_amount} (${statusText})`,
        timestamp: data.timestamp || new Date().toISOString(),
        isRead: false,
        orderId: data.order.order_id,
        customerName: data.order.customer?.name || 'ลูกค้าทั่วไป',
        orderStatus: data.order.status || 'PENDING'
      };
      
      setNotifications(prev => {
        // ตรวจสอบว่ามี notification ของ order นี้อยู่แล้วหรือไม่
        const existingIndex = prev.findIndex(n => n.orderId === newNotification.orderId);
        
        if (existingIndex !== -1) {
          // ถ้ามีแล้ว ให้แทนที่ด้วยข้อมูลใหม่
          const updated = [...prev];
          updated[existingIndex] = newNotification;
          return updated;
        } else {
          // ถ้าไม่มี ให้เพิ่มใหม่
          return [newNotification, ...prev];
        }
      });
    });
    
    socketConnection.on('disconnect', () => {
      console.log('Socket.IO disconnected');
    });
    
    setSocket(socketConnection);
    
    // Listen for page visibility change to refresh notifications
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible, refreshing notifications...');
        loadInitialNotifications();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      socketConnection.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Display name logic - show only first name
  const displayFirstName = userProfile?.firstname || 'User';
  const fullName = userProfile 
    ? `${userProfile.firstname} ${userProfile.lastname}`.trim() || 'User'
    : 'User';

  // Debug: log notification count
  const unreadCount = notifications.filter(n => !n.isRead).length;
  console.log('Current notifications:', notifications.length, 'Unread:', unreadCount);
  
  return (
    <div className="sticky top-0 z-10 w-full bg-#FAF9F8">
      <div className="flex items-center p-4">
        <h1 className="font-bold text-gray-800 text-2xl">PharmaC</h1>
        <div className="ml-auto flex items-center space-x-4">
          <button onClick={()=> navigate('/poedit')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg font-semibold transition duration-200 shadow-lg hover:shadow-xl flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            สั่งซื้อยา
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              className="relative p-2 bg-gray-200 rounded-full shadow-md hover:bg-gray-300 flex items-center transition-colors duration-200"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotificationDropdown && (
              <div className="absolute right-0 top-12">
                <NotificationDropdown
                  notifications={notifications}
                  isOpen={showNotificationDropdown}
                  onClose={() => setShowNotificationDropdown(false)}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  onNotificationClick={handleNotificationClick}
                />
              </div>
            )}
          </div>
          
          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)} 
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition duration-200"
            >
              <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                {userProfile?.profile_image ? (
                  <img 
                    src={userProfile.profile_image.startsWith('http') 
                      ? userProfile.profile_image 
                      : `http://localhost:5000/uploads/${userProfile.profile_image}`
                    }
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      // Fallback to default avatar if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = '<svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                    }}
                  />
                ) : (
                  <User className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <span className="text-gray-800 font-medium hidden sm:block">{displayFirstName}</span>
              <ChevronDown className="w-4 h-4 text-gray-600 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                {/* User Info Section */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                      {userProfile?.profile_image ? (
                        <img 
                          src={userProfile.profile_image.startsWith('http') 
                            ? userProfile.profile_image 
                            : `http://localhost:5000/uploads/${userProfile.profile_image}`
                          }
                          alt="Profile"
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            // Fallback to default avatar if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = '<svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                          }}
                        />
                      ) : (
                        <User className="w-6 h-6 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{fullName}</p>
                      <p className="text-sm text-gray-500">{userProfile?.email || 'No email'}</p>
                      <p className="text-xs text-gray-400">ID: #{employeeId}</p>
                    </div>
                  </div>
                </div>
                
                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate('/accountSetting');
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Profile Settings</span>
                  </button>
                  
                  {/* Logout Button */}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-3"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Overlay to close dropdown when clicking outside */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </div>
  );
}
