import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  discount_amount?: number;
  discount_type?: string;
  points_used?: number;
}

const CustomerPaymentPage: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  // For Socket.IO, use base server URL (not /api)
  const SOCKET_URL = API_URL.startsWith('http') ? API_URL.replace('/api', '') : window.location.origin;
  const { logout } = useAuth();
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [qrCode, setQrCode] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const socketRef = useRef<Socket | null>(null);

  const connectSocket = useCallback(() => {
    try {
      // Don't create a new connection if one already exists and is connected
      if (socketRef.current && socketRef.current.connected) {
        console.log('🔌 Socket already connected, reusing existing connection');
        return;
      }

      console.log('🔌 Creating new Socket.IO connection...');
      setConnectionStatus('connecting');

      // Connect to Socket.IO server
      const socket = io(SOCKET_URL, {
        path: '/ws/',  // Use /ws/ instead of default /socket.io/
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
        console.log('🔍 Discount Info from socket:', {
          discount_amount: data.order.discount_amount,
          discount_type: data.order.discount_type,
          points_used: data.order.points_used
        });

        const orderData: Order = {
          order_id: data.order.order_id.toString(),
          employee_id: data.order.employee_id,
          total_amount: data.order.total_amount,
          total_price: data.order.total_price,
          items: data.order.carts || [],
          status: 'pending',
          timestamp: data.order.date || new Date().toISOString(),
          qrCode: data.qrCode,
          payment_intent_id: data.payment_intent_id,
          discount_amount: data.order.discount_amount || 0,
          discount_type: data.order.discount_type || 'none',
          points_used: data.order.points_used || 0
        };

        console.log('✅ Order data set with discount:', {
          discount_amount: orderData.discount_amount,
          discount_type: orderData.discount_type,
          points_used: orderData.points_used,
          total_amount: orderData.total_amount
        });

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
  }, [currentOrder, API_URL]);

  const verifyStatus = useCallback(async () => {
    if (!currentOrder?.payment_intent_id || !currentOrder?.order_id) {
      console.log('⚠️ Missing payment_intent_id or order_id, skipping verification');
      return;
    }

    // Don't verify if payment is already completed
    if (currentOrder.status === 'completed') {
      console.log('✅ Payment already completed, skipping verification');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/payment/check`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            pi: currentOrder.payment_intent_id,  // Fixed: Changed from payment_intent_id to pi
            order_id: currentOrder.order_id
          })
        }
      );
      const data = await response.json();
      console.log('Payment status response:', data);

      // Update the order status based on the payment response
      if (data.success && data.status) {
        console.log('Payment verification status:', data.status);

        // Update the display order status based on Stripe status
        if (data.status === 'succeeded') {
          setCurrentOrder(prev => prev ? { ...prev, status: 'completed' } : null);
          console.log('✅ Payment succeeded - Updated order status to completed');
        } else if (data.status === 'failed') {
          setCurrentOrder(prev => prev ? { ...prev, status: 'pending' } : null);
          console.log('❌ Payment failed - Keeping order status as pending');
        } else if (data.status === 'requires_action') {
          setCurrentOrder(prev => prev ? { ...prev, status: 'paid' } : null);
          console.log('⏳ Payment requires action - Updated order status to paid (processing)');
        }
      }
    } catch (error) {
      console.error('Error verifying payment status:', error);
    }
  }, [currentOrder, API_URL]);

  // Socket.IO connection
  useEffect(() => {
    connectSocket();
    verifyStatus();
    return () => {
      console.log('🧹 CustomerPaymentPage component unmounting, cleaning up socket...');
      if (socketRef.current && socketRef.current.connected) {
        console.log('🔌 Disconnecting socket:', socketRef.current.id);
        socketRef.current.disconnect();
      }
    };
  }, [connectSocket, verifyStatus]);

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Mock data for demo when no real order
  const mockOrder: Order = {
    order_id: 'NONE',
    employee_id: 1,
    total_amount: 0,
    total_price: 0,
    items: [],
    status: 'pending',
    timestamp: new Date().toISOString(),
    discount_amount: 0,
    discount_type: 'none',
    points_used: 0
  };

  const displayOrder = currentOrder || mockOrder;

  // Handle completed order effect
  useEffect(() => {
    if (displayOrder.status === 'completed') {
      const interval = setInterval(() => {
        verifyStatus();
      }, 10000); // 10 seconds

      // Reload window after 5 seconds (show completed for 5s)
      const reloadTimeout = setTimeout(() => {
        window.location.reload();
      }, 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(reloadTimeout);
      };
    }
  }, [displayOrder.status, verifyStatus]);

  return (
    <div className="min-h-screen h-screen bg-gray-50 p-6 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Customer Display</h1>
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
                {connectionStatus === 'connected' && 'Connected'}
                {connectionStatus === 'connecting' && 'Connecting...'}
                {connectionStatus === 'disconnected' && 'Disconnected'}
              </span>

              {/* Reconnect button when disconnected */}
              {connectionStatus === 'disconnected' && (
                <button
                  onClick={connectSocket}
                  className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                >
                  Reconnect
                </button>
              )}
            </div>

            {/* Test Connection Button */}
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto flex-1 flex flex-col overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">

          {/* Order Details */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col h-full overflow-hidden">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Details</h2>
              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span>Order ID: <span className="font-semibold text-blue-600">#{displayOrder.order_id}</span></span>
                <div className="flex flex-col items-end">
                  <span className="text-blue-600 font-medium">🕒 {currentTime.toLocaleTimeString('en-US')}</span>
                  {displayOrder.timestamp && displayOrder.order_id !== 'NONE' && (
                    <span className="text-xs text-gray-500">
                      Order: {new Date(displayOrder.timestamp).toLocaleTimeString('en-US')}
                    </span>
                  )}
                </div>
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
            <div className="space-y-4 mb-6 flex-1 overflow-y-auto">
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
            <div className="border-t pt-6 flex-shrink-0 space-y-3">
            
           
              
              {/* Subtotal - แสดงถ้ามีส่วนลด */}
              {displayOrder.discount_amount && displayOrder.discount_amount > 0 ? (
                <>
                  <div className="flex justify-between items-center px-4">
                    <span className="text-base text-gray-600">Subtotal:</span>
                    <span className="text-lg text-gray-700">
                      ฿{((displayOrder.total_amount || 0) + (displayOrder.discount_amount || 0)).toLocaleString()}
                    </span>
                  </div>

                  {/* Discount */}
                  <div className="flex justify-between items-center px-4 text-red-600">
                    <span className="text-base flex items-center">
                      Discount
                      {displayOrder.discount_type === 'points' && displayOrder.points_used && (
                        <span className="ml-2 text-xs bg-red-100 px-2 py-1 rounded">
                          {displayOrder.points_used} points used
                        </span>
                      )}
                      :
                    </span>
                    <span className="text-lg font-semibold">
                      -฿{(displayOrder.discount_amount || 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Grand Total */}
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <span className="text-xl font-bold text-gray-800">Total amount:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ฿{(displayOrder.total_amount || 0).toLocaleString()}
                    </span>
                  </div>
                </>
              ) : (
                /* No Discount - แสดงแบบเดิม */
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <span className="text-xl font-bold text-gray-800">Total amount:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ฿{(displayOrder.total_amount || 0).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Scan QR Code to Pay
              </h2>

              <div className="bg-gray-50 p-8 rounded-xl mb-6">
                {qrCode ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img
                        src={qrCode}
                        alt="QR Code for Payment"
                        className={`w-64 h-64 mx-auto border-2 border-gray-200 rounded-lg shadow-sm transition-all duration-300 ${displayOrder.status === 'completed' ? 'opacity-75 grayscale' : ''
                          }`}
                        onError={(e) => {
                          console.error('QR Code image failed to load');
                          e.currentTarget.style.display = 'none';
                        }}
                      />

                      {/* Success Overlay on QR Code */}
                      {displayOrder.status === 'completed' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-green-500 rounded-full p-4 shadow-2xl">
                            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>

                    <p className={`font-semibold transition-colors duration-300 ${displayOrder.status === 'completed'
                        ? 'text-green-600'
                        : 'text-green-600'
                      }`}>
                      {displayOrder.status === 'completed'
                        ? '✅ Payment Successful!'
                        : '✅ QR Code Ready'
                      }
                    </p>
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
                          <p className="text-sm">Not Connected</p>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600">
                      {connectionStatus === 'connected' ? 'Waiting for QR Code...' : 'Waiting to connect...'}
                    </p>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="mt-6">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${displayOrder.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : displayOrder.status === 'paid'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {displayOrder.status === 'completed' && '✅ Payment Successful'}
                  {displayOrder.status === 'paid' && '⏳ Processing'}
                  {displayOrder.status === 'pending' && '💰 Waiting for Payment'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPaymentPage;
