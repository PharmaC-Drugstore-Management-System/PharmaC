import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Wifi, WifiOff } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface OrderItem {
  cart_id: number;
  product_id: number;
  product_name: string;
  price: number;
  amount: number;
  unit_price: number;
  product?: {
    product_name: string;
    brand: string;
    producttype: string;
  };
}

interface Order {
  order_id: string;
  employee_id: number;
  total_amount: number;
  total_price: number;
  items: OrderItem[];
  status: 'pending' | 'paid' | 'completed';
  timestamp: string;
  qrCode?: string;
  payment_intent_id?: string;
}

const CustomerPaymentPage: React.FC = () => {
  const { logout } = useAuth();
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [qrCode, setQrCode] = useState<string>('');
  const socketRef = useRef<Socket | null>(null);

  // Socket.IO connection
  useEffect(() => {
    connectSocket();
    return () => {
      console.log('🧹 CustomerPaymentPage component unmounting, cleaning up socket...');
      if (socketRef.current && socketRef.current.connected) {
        console.log('🔌 Disconnecting socket:', socketRef.current.id);
        socketRef.current.disconnect();
      }
    };
  }, []);

  const connectSocket = () => {
    try {
      // Don't create a new connection if one already exists and is connected
      if (socketRef.current && socketRef.current.connected) {
        console.log('🔌 Socket already connected, reusing existing connection');
        return;
      }

      console.log('🔌 Creating new Socket.IO connection...');
      setConnectionStatus('connecting');

      // Connect to Socket.IO server
      const socket = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true
      });

      socket.on('connect', () => {
        console.log('✅ Socket.IO connected:', socket.id);
        setConnectionStatus('connected');

        // Subscribe to customer display updates
        socket.emit('join-customer-display');
      });

      socket.on('disconnect', (reason: any) => {
        console.log('❌ Socket.IO disconnected:', socket.id, 'Reason:', reason);
        setConnectionStatus('disconnected');
        
        // Auto-reconnect after a delay if not intentional disconnect
        if (reason !== 'io client disconnect') {
          console.log('🔄 Attempting to reconnect in 3 seconds...');
          setTimeout(() => {
            if (socketRef.current && !socketRef.current.connected) {
              connectSocket();
            }
          }, 3000);
        }
      });

      socket.on('connect_error', (error: any) => {
        console.error('❌ Socket.IO connection error:', error);
        setConnectionStatus('disconnected');
      });

      // Listen for new orders with QR codes
      socket.on('new-order-qr', (data: any) => {
        console.log('📦 New order received:', data);

        const orderData: Order = {
          order_id: data.order.order_id.toString(),
          employee_id: data.order.employee_id,
          total_amount: data.order.total_amount,
          total_price: data.order.total_price,
          items: data.order.carts || [],
          status: 'pending',
          timestamp: data.order.date || new Date().toISOString(),
          qrCode: data.qrCode,
          payment_intent_id: data.payment_intent_id
        };

        setCurrentOrder(orderData);
        setQrCode(data.qrCode || '');
      });

      // Listen for payment updates
      socket.on('payment-status-update', (data: any) => {
        console.log('💳 Payment status update:', data);

        if (currentOrder && data.payment_intent_id === currentOrder.payment_intent_id) {
          setCurrentOrder(prev => prev ? { ...prev, status: data.status } : null);

          if (data.status === 'completed') {
            setTimeout(() => {
              setCurrentOrder(null);
              setQrCode('');
            }, 5000);
          }
        }
      });

      // Test connection
      socket.on('connection-test', (data: any) => {
        console.log('🎉 Connection test received:', data);
      });

      socketRef.current = socket;
    } catch (error) {
      console.error('Socket connection error:', error);
      setConnectionStatus('disconnected');
    }
  };

  // Mock data for demo when no real order
  const mockOrder: Order = {
    order_id: 'NONE',
    employee_id: 1,
    total_amount: 0,
    total_price: 0,
    items: [],
    status: 'pending',
    timestamp: new Date().toISOString()
  };

  const displayOrder = currentOrder || mockOrder;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Customer Display</h1>
              <p className="text-sm text-gray-600">iPad Panel</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Connection Status & Reconnect */}
            <div className="flex items-center space-x-2">
              {connectionStatus === 'connected' ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
              <span className={`text-sm ${connectionStatus === 'connected' ? 'text-green-600' :
                  connectionStatus === 'connecting' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                {connectionStatus === 'connected' && '✅ เชื่อมต่อแล้ว'}
                {connectionStatus === 'connecting' && '🔄 กำลังเชื่อมต่อ...'}
                {connectionStatus === 'disconnected' && '❌ ไม่ได้เชื่อมต่อ'}
              </span>
              
              {/* Reconnect button when disconnected */}
              {connectionStatus === 'disconnected' && (
                <button
                  onClick={connectSocket}
                  className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                >
                  เชื่อมต่อใหม่
                </button>
              )}
            </div>

            {/* Test Connection Button */}
            {connectionStatus === 'connected' && (
              <button
                onClick={() => socketRef.current?.emit('ping', { message: 'Test from customer display' })}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                Test
              </button>
            )}

            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Order Details */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">รายการสั่งซื้อ</h2>
              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span>Order ID: <span className="font-semibold text-blue-600">#{displayOrder.order_id}</span></span>
                <span>{displayOrder.timestamp ? new Date(displayOrder.timestamp).toLocaleTimeString('th-TH') : 'N/A'}</span>
              </div>
              {currentOrder ? (
                <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  🔴 Live Order
                </div>
              ) : (
                <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                  📋 Items
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="space-y-4 mb-6">
              {displayOrder.items.map((item) => (
                <div key={item.cart_id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {item.product?.product_name || item.product_name || 'Unknown Product'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {item.product?.brand} - {item.product?.producttype}
                    </p>
                    <p className="text-sm text-blue-600">
                      ฿{(item.unit_price || item.price || 0).toLocaleString()} × {item.amount || 0}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-green-600">
                      ฿{(((item.unit_price || item.price || 0) * (item.amount || 0))).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <span className="text-xl font-bold text-gray-800">รวมทั้งสิ้น:</span>
                <span className="text-2xl font-bold text-green-600">
                  ฿{(displayOrder.total_amount || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                สแกน QR Code เพื่อชำระเงิน
              </h2>

              <div className="bg-gray-50 p-8 rounded-xl mb-6">
                {qrCode ? (
                  <div className="space-y-4">
                    <img
                      src={qrCode}
                      alt="QR Code for Payment"
                      className="w-64 h-64 mx-auto border-2 border-gray-200 rounded-lg shadow-sm"
                      onError={(e) => {
                        console.error('QR Code image failed to load');
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <p className="text-green-600 font-semibold">✅ QR Code พร้อมใช้งาน</p>
                    <p className="text-xs text-gray-500">PromptPay QR Code</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-64 h-64 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                      {connectionStatus === 'connected' ? (
                        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                      ) : (
                        <div className="text-gray-500">
                          <WifiOff className="w-12 h-12 mx-auto mb-2" />
                          <p className="text-sm">ไม่ได้เชื่อมต่อ</p>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600">
                      {connectionStatus === 'connected' ? 'รอ QR Code จากระบบ...' : 'รอการเชื่อมต่อ...'}
                    </p>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="space-y-2 text-sm text-gray-600">
                <p>📱 เปิดแอปธนาคาร → สแกน QR</p>
                <p>💰 ตรวจสอบยอดเงิน → ยืนยันการชำระ</p>
                <p>✅ รอการยืนยันจากระบบ</p>
              </div>

              {/* Status */}
              <div className="mt-6">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${displayOrder.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : displayOrder.status === 'paid'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {displayOrder.status === 'completed' && '✅ ชำระเงินสำเร็จ'}
                  {displayOrder.status === 'paid' && '⏳ กำลังตรวจสอบ'}
                  {displayOrder.status === 'pending' && '💰 รอการชำระเงิน'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            🔄 หน้าจอจะอัปเดตอัตโนมัติ |
            Socket.IO: <span className={connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'}>
              {connectionStatus}
            </span>
            {currentOrder?.payment_intent_id && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                PI: {currentOrder.payment_intent_id.slice(-8)}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerPaymentPage;
