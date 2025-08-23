import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Wifi, WifiOff } from 'lucide-react';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'completed';
  timestamp: string;
  qrCode?: string;
}

const CustomerPaymentPage: React.FC = () => {
  const { logout } = useAuth();
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [qrCode, setQrCode] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket connection
  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      setConnectionStatus('connecting');
      const ws = new WebSocket('ws://localhost:5000');
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('connected');
        ws.send(JSON.stringify({ 
          type: 'subscribe', 
          channel: 'customer-display' 
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received:', data);
          
          switch (data.type) {
            case 'new-order':
              setCurrentOrder(data.order);
              setQrCode('');
              break;
            case 'qr-generated':
              setQrCode(data.qrCode);
              break;
            case 'order-completed':
              setTimeout(() => {
                setCurrentOrder(null);
                setQrCode('');
              }, 3000);
              break;
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      ws.onclose = () => {
        setConnectionStatus('disconnected');
        setTimeout(() => connectWebSocket(), 3000);
      };

      ws.onerror = () => {
        setConnectionStatus('disconnected');
      };

      wsRef.current = ws;
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  // Mock data for demo
  const mockOrder: Order = {
    id: 'ORD-001',
    items: [
      { id: 1, name: 'พาราเซตามอล 500mg', price: 25, quantity: 2, category: 'ยาแก้ปวด' },
      { id: 2, name: 'วิตามินซี 1000mg', price: 150, quantity: 1, category: 'วิตามิน' }
    ],
    total: 200,
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
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {connectionStatus === 'connected' ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
              <span className="text-sm text-gray-600">{connectionStatus}</span>
            </div>
            
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
                <span>Order ID: <span className="font-semibold text-blue-600">{displayOrder.id}</span></span>
                <span>{new Date(displayOrder.timestamp).toLocaleTimeString('th-TH')}</span>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4 mb-6">
              {displayOrder.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.category}</p>
                    <p className="text-sm text-blue-600">฿{item.price.toLocaleString()} × {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-green-600">
                      ฿{(item.price * item.quantity).toLocaleString()}
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
                  ฿{displayOrder.total.toLocaleString()}
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
                      className="w-64 h-64 mx-auto border-2 border-gray-200 rounded-lg"
                    />
                    <p className="text-green-600 font-semibold">QR Code พร้อมใช้งาน</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-64 h-64 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                      <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                    </div>
                    <p className="text-gray-600">กำลังสร้าง QR Code...</p>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="space-y-2 text-sm text-gray-600">
                <p>📱 ใช้แอปธนาคารสแกน QR Code</p>
                <p>💰 ชำระเงินตามจำนวนที่แสดง</p>
                <p>✅ รอการยืนยันการชำระเงิน</p>
              </div>

              {/* Status */}
              <div className="mt-6">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                  displayOrder.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : displayOrder.status === 'paid'
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {displayOrder.status === 'completed' && '✅ เสร็จสิ้น'}
                  {displayOrder.status === 'paid' && '⏳ กำลังเตรียมสินค้า'}
                  {displayOrder.status === 'pending' && '💰 รอการชำระเงิน'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            🔄 หน้านี้จะอัปเดตอัตโนมัติเมื่อมีรายการใหม่ | 
            WebSocket: <span className={connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'}>
              {connectionStatus}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerPaymentPage;
