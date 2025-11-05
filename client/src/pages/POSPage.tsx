import { useState, useEffect, useRef } from "react";
import { Search, Plus, Minus, ShoppingCart,  Banknote, Trash2, X, User, Star, QrCode } from "lucide-react";
import "../styles/pos.css";
import { useNavigate } from "react-router-dom";
import { io } from 'socket.io-client';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Product {
  product_id: number | string; // Can be string for lot-specific IDs
  original_product_id?: number; // Store original product ID
  product_name: string;
  brand: string;
  unit: string;
  price?: number;
  stock?: number;
  barcode: string;
  image?: string;
  lots?: any[]; // Add lots information to display
  lot_no?: string; // Lot number for display
  lot_id?: number; // Lot ID for reference
  expired_date?: string; // Expiration date
}

interface CartItem extends Product {
  quantity: number;
  total: number;
}

interface Member {
  id: string;
  name: string;
  phone: string;
  points: number;
  level: string;
}

export default function POSPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<"cash" | "promptpay" | "transfer">("cash");
  const [customerPaid, setCustomerPaid] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [employee_id, setEmployeeId] = useState<number | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  // QR Code Payment States
  const [showQRModal, setShowQRModal] = useState(false);
  const [showQRConfirmModal, setShowQRConfirmModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<any>(null);
  const [qrPaymentStatus, setQrPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [qrSentToDisplay, setQrSentToDisplay] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Payment verification states
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
  const [showRequiresActionModal, setShowRequiresActionModal] = useState(false);

  // Auto verification states
  const [isAutoVerifying, setIsAutoVerifying] = useState(false);
  const [autoVerifyInterval, setAutoVerifyInterval] = useState<NodeJS.Timeout | null>(null);
  
  // 🔒 CRITICAL: Synchronous lock using useRef to prevent duplicate stock reduction
  // State updates are async - ref.current is checked/set synchronously!
  const isProcessingStockReductionRef = useRef(false);
  
  // Member System States
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberPhone, setMemberPhone] = useState("");
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [memberSearching, setMemberSearching] = useState(false);
  const [memberModalMode, setMemberModalMode] = useState<'search' | 'add'>('search');
  const [newMemberData, setNewMemberData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  // Discount States
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountType, setDiscountType] = useState<'none' | 'percentage' | 'amount' | 'points'>('none');
  const [discountValue, setDiscountValue] = useState<string>('');
  const [pointsToUse, setPointsToUse] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    type: 'none' | 'percentage' | 'amount' | 'points';
    value: number;
    pointsUsed?: number;
  }>({ type: 'none', value: 0 });
  const [quickMembers, setQuickMembers] = useState<any[]>([]);
  
  // Cash Payment Confirmation Modal
  const [showCashConfirmModal, setShowCashConfirmModal] = useState(false);

  useEffect(() => {
    fetchProducts();
    checkme();
    loadQuickCustomers();

    // Initialize socket connection using env
    // If VITE_SOCKET_BASE is /api, ignore it and use empty string for production
    const envSocketBase = import.meta.env.VITE_SOCKET_BASE;
    const SOCKET_BASE = (envSocketBase === '/api' || !envSocketBase) 
      ? '' 
      : envSocketBase;
    const SOCKET_PATH = import.meta.env.VITE_SOCKET_PATH || '/ws/';
    
    console.log('🔌 POS Socket connecting to:', { SOCKET_BASE, SOCKET_PATH, envSocketBase });
    
    const socket = io(SOCKET_BASE, {
      withCredentials: true,
      path: SOCKET_PATH,
      transports: ['websocket', 'polling'],
    });

    // Listen for payment status updates
    socket.on('payment-status-update', (data: any) => {
      console.log('💳 Payment status update received:', data);
      console.log('🔍 Current paymentIntentId:', paymentIntentId);
      console.log('🔍 Received paymentIntentId:', data.paymentIntentId);

      // Check if this payment update is for current order
      if (paymentIntentId && data.paymentIntentId === paymentIntentId) {
        console.log('📦 Payment update matches current order');

        // Stop auto verification when status update received
        if (autoVerifyInterval) {
          clearInterval(autoVerifyInterval);
          setAutoVerifyInterval(null);
          setIsAutoVerifying(false);
          console.log('🛑 Auto verification stopped due to status update');
        }

        if (data.status === 'completed' || data.status === 'succeeded') {
          console.log('✅ Payment completed - showing success modal');
          setQrPaymentStatus('success');
          setShowRequiresActionModal(false);
          setShowPaymentSuccessModal(true);
          
          // ❌ REMOVED: handlePaymentSuccess() call here - causes duplicate!
          // Auto-verification will handle stock reduction already
          console.log('💡 Stock reduction will be handled by auto-verification or manual verify');
          
          // Add points if member exists
          if (currentMember) {
            addPoints();
            console.log("Adding points automatically after payment success");
          }
        } else if (data.status === 'failed' || data.status === 'canceled') {
          console.log('❌ Payment failed');
          setQrPaymentStatus('failed');
          setShowPaymentSuccessModal(false);
          setShowRequiresActionModal(false);
          setErrorMessage(`Payment ${data.status} - Please try again`);
          setShowErrorPopup(true);
          setTimeout(() => setShowErrorPopup(false), 5000);
        }
      }
    });

    // Cleanup socket connection on unmount
    return () => {
      socket.disconnect();
    };
  }, [paymentIntentId, currentMember]);

  const loadQuickCustomers = async () => {
    try {
      const response = await fetch(`${API_URL}/customer/get-customers`);
      if (response.ok) {
        const customers = await response.json();
        setQuickMembers(customers.slice(0, 3)); // Get first 3 customers for quick access
      }
    } catch (error) {
      console.error("Error loading quick customers:", error);
      // If API fails, use empty array (no demo customers)
      setQuickMembers([]);
    }
  };

  const verifyStatus = async () => {
    try {
      console.log(qrCodeData?.pi)
      console.log(qrCodeData?.order_id)
  const response = await fetch(`${API_URL}/payment/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          pi: qrCodeData?.pi,
          order_id: orderId,
        })
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Payment verification response:', data);

        // Check if payment is actually successful
        if (data.success && (data.status === 'succeeded')) {
          setQrPaymentStatus('success');
          setShowRequiresActionModal(false); // Close requires action modal if open
          setShowPaymentSuccessModal(true);
        } else if (data.status === 'requires_action') {
          setQrPaymentStatus('pending');
          setShowPaymentSuccessModal(false); // Close success modal if open
          setShowRequiresActionModal(true);
        } else if (data.status === 'pending') {
          setQrPaymentStatus('pending');
          setShowPaymentSuccessModal(false);
          setShowRequiresActionModal(false);
          // Don't show success modal for pending payments
        } else if (data.status === 'failed' || data.status === 'canceled') {
          setQrPaymentStatus('failed');
          setShowPaymentSuccessModal(false);
          setShowRequiresActionModal(false);
        } else {
          // For any other status, keep it pending
          setQrPaymentStatus('pending');
          setShowPaymentSuccessModal(false);
          setShowRequiresActionModal(false);
        }
      }
    } catch (error) {
      console.error("Error verifying payment status:", error);
      setQrPaymentStatus('failed');
    }
  }

  const fetchProducts = async () => {
    try {
  const response = await fetch(`${API_URL}/inventory/get-medicine`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();

        // ดึงข้อมูล lots และสร้างการ์ดแยกสำหรับแต่ละ lot
        const allProductLots = await Promise.all(
          data.data.map(async (product: Product) => {
            try {
              // ดึงข้อมูล lots ของแต่ละ product
              const lotsResponse = await fetch(`${API_URL}/lot/get-lots-by-product/${product.product_id}`, {
                credentials: "include",
              });

              if (lotsResponse.ok) {
                const lotsData = await lotsResponse.json();

                if (lotsData.status && lotsData.data && lotsData.data.length > 0) {
                  // กรอง lots ที่ยังไม่หมดอายุ
                  const today = new Date();
                  const validLots = lotsData.data.filter((lot: any) => {
                    const expDate = new Date(lot.expired_date);
                    return expDate > today && lot.init_amount > 0;
                  });

                  // เรียง lots ตามวันหมดอายุ (ใกล้หมดอายุก่อน - FEFO)
                  validLots.sort((a: any, b: any) => {
                    return new Date(a.expired_date).getTime() - new Date(b.expired_date).getTime();
                  });

                  // สร้างการ์ดแยกสำหรับแต่ละ lot
                  return validLots.map((lot: any) => ({
                    ...product,
                    product_id: `${product.product_id}_lot_${lot.lot_id}`, // Unique ID for each lot card
                    original_product_id: product.product_id, // Keep original product ID for cart
                    lot_no: lot.lot_no, // Lot number to display
                    lot_id: lot.lot_id, // Lot ID for reference
                    price: lot.sell_price || 50.00, // ราคาขายจาก lot
                    stock: lot.init_amount, // จำนวนสต็อกในแต่ละ lot
                    expired_date: lot.expired_date, // วันหมดอายุ
                    lots: [lot], // เก็บ lot เดียวสำหรับการ checkout
                  }));
                } else {
                  // ถ้าไม่มี lot ให้แสดงสินค้าแบบเดิม (out of stock)
                  return [{
                    ...product,
                    price: 50.00,
                    stock: 0,
                    lots: [],
                  }];
                }
              } else {
                // ถ้า API error ให้แสดงสินค้าแบบเดิม
                return [{
                  ...product,
                  price: 50.00,
                  stock: 0,
                  lots: [],
                }];
              }
            } catch (error) {
              console.error(`Error fetching lots for product ${product.product_id}:`, error);
              return [{
                ...product,
                price: 50.00,
                stock: 0,
                lots: [],
              }];
            }
          })
        );

        // Flatten array of arrays into single array of product-lot combinations
        const flattenedProducts = allProductLots.flat();
        setProducts(flattenedProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const filteredProducts = products.filter(product =>
    product.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode?.includes(searchQuery)
  );

  const addToCart = async (product: Product) => {
    try {
      // Since each product card now represents a specific lot, we can directly add it
      // Use the lot information already embedded in the product
      if (!product.lots || product.lots.length === 0 || (product.stock || 0) <= 0) {
      // ดึงข้อมูล lots ของ product นี้
  const lotsResponse = await fetch(`${API_URL}/lot/get-lots-by-product/${product.product_id}`, {
        credentials: "include",
      });
      
      if (!lotsResponse.ok) {
        console.error('Failed to fetch lots for product:', product.product_id);
        return;
      }
      
      const lotsData = await lotsResponse.json();
      
      if (!lotsData.status || !lotsData.data) {
        console.error('No lots data available for product:', product.product_id);
        return;
      }
      
      // กรองและเรียง lots ตามวันหมดอายุ (ใกล้หมดอายุก่อน)
      const today = new Date();
      const availableLots = lotsData.data
        .filter((lot: any) => {
          const expDate = new Date(lot.expired_date);
          return expDate > today && lot.init_amount > 0; // ยังไม่หมดอายุและมีของเหลือ
        })
        .sort((a: any, b: any) => {
          return new Date(a.expired_date).getTime() - new Date(b.expired_date).getTime();
        });
      
      if (availableLots.length === 0) {
        alert('สินค้านี้หมดสต็อกหรือหมดอายุแล้ว');
        return;
      }
      }

      // Check if this specific lot is already in the cart
      const existingItem = cart.find(item => item.product_id === product.product_id);

      if (existingItem) {
        // Update quantity for existing item
        setCart(cart.map(item =>
          item.product_id === product.product_id
            ? {
              ...item,
              quantity: item.quantity + 1,
              total: (item.quantity + 1) * (item.price || 0),
            }
            : item
        ));
      } else {
        // Add new item to cart with lot information
        const newItem: CartItem = {
          ...product,
          quantity: 1,
          total: product.price || 0,
        };
        setCart([...cart, newItem]);
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
      alert('Failed to add product to cart');
    }
  };

  const updateQuantity = (productId: number | string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(item =>
      item.product_id === productId
        ? { ...item, quantity: newQuantity, total: newQuantity * (item.price || 0) }
        : item
    ));
  };

  const removeFromCart = (productId: number | string) => {
    const newCart = cart.filter(item => item.product_id !== productId);
    setCart(newCart);
    
    // Reset discount if cart becomes empty
    if (newCart.length === 0) {
      setAppliedDiscount({ type: 'none', value: 0 });
      setDiscountType('none');
      setDiscountValue('');
      setPointsToUse('');
    }
  };

  // Member System Functions
  const searchMember = async (phone: string) => {
    setMemberSearching(true);
    try {
      // Call real API to get all customers and search by phone
  const response = await fetch(`${API_URL}/customer/get-customers`);
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const customers = await response.json();
      const member = customers.find((customer: any) => customer.phone_number === phone);

      if (member) {
        // Convert database customer to Member interface
        const convertedMember: Member = {
          id: member.customer_id.toString(), // Convert to string for UI compatibility
          name: member.name || 'Unknown Customer',
          phone: member.phone_number || '',
          points: member.point || 0,
          level: member.point >= 500 ? 'Gold' : member.point >= 200 ? 'Silver' : 'Bronze'
        };
        setCurrentMember(convertedMember);
        setShowMemberModal(false);
      } else {
        alert(t('memberNotFound'));
      }
    } catch (error) {
      console.error("Error searching member:", error);
      alert(t('errorSearchingMember'));
    } finally {
      setMemberSearching(false);
    }
  };

  const removeMember = () => {
    setCurrentMember(null);
    setMemberPhone("");
  };

  const addNewMember = async () => {
    if (!newMemberData.name || !newMemberData.phone) {
      alert(t('pleaseProvideNameAndPhone'));
      return;
    }

    setMemberSearching(true);
    try {
      // Call real API to add new customer
      const customerData = {
        name: newMemberData.name,
        phone_number: newMemberData.phone,
        citizen_id: null, // Optional
        birthday: null, // Optional
        gender: null, // Optional
        point: 0 // Start with 0 points
      };

  const response = await fetch(`${API_URL}/customer/add-customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData)
      });

      if (!response.ok) {
        throw new Error('Failed to add customer');
      }

      const newCustomer = await response.json();

      // Convert database customer to Member interface
      const convertedMember: Member = {
        id: newCustomer.customer_id.toString(), // Convert to string for UI compatibility
        name: newCustomer.name || 'Unknown Customer',
        phone: newCustomer.phone_number || '',
        points: newCustomer.point || 0,
        level: 'Bronze' // New members start at Bronze
      };

      setCurrentMember(convertedMember);
      setShowMemberModal(false);
      setNewMemberData({ name: '', phone: '', email: '', address: '' });
      setMemberModalMode('search');

      alert(`New member added successfully: ${convertedMember.name}`);
    } catch (error) {
      console.error("Error adding member:", error);
      alert("Error occurred while adding member");
    } finally {
      setMemberSearching(false);
    }
  };

  const calculatePoints = () => {
    const totalAmount = getTotalAfterDiscount();
    return Math.floor(totalAmount / 10); // 1 point per 10 baht
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const getDiscountAmount = () => {
    const subtotal = getTotalAmount();
    
    if (appliedDiscount.type === 'none') return 0;
    
    if (appliedDiscount.type === 'percentage') {
      return (subtotal * appliedDiscount.value) / 100;
    } else if (appliedDiscount.type === 'amount') {
      return Math.min(appliedDiscount.value, subtotal); // ไม่เกินยอดรวม
    } else if (appliedDiscount.type === 'points') {
      // 1 แต้ม = 1 บาท
      return Math.min(appliedDiscount.value, subtotal);
    }
    
    return 0;
  };

  const getTotalAfterDiscount = () => {
    const subtotal = getTotalAmount();
    const discount = getDiscountAmount();
    return Math.max(subtotal - discount, 0);
  };

  const applyDiscount = () => {
    if (discountType === 'percentage') {
      const value = parseFloat(discountValue);
      if (isNaN(value) || value < 0 || value > 100) {
        alert(t('invalidDiscountPercentage') || 'กรุณากรอกส่วนลด 0-100%');
        return;
      }
      setAppliedDiscount({ type: 'percentage', value });
    } else if (discountType === 'amount') {
      const value = parseFloat(discountValue);
      if (isNaN(value) || value < 0) {
        alert(t('invalidDiscountAmount') || 'กรุณากรอกจำนวนเงินที่ถูกต้อง');
        return;
      }
      setAppliedDiscount({ type: 'amount', value });
    } else if (discountType === 'points') {
      const points = parseInt(pointsToUse);
      if (isNaN(points) || points < 0) {
        alert(t('invalidPoints') || 'กรุณากรอกจำนวนแต้มที่ถูกต้อง');
        return;
      }
      if (!currentMember || points > currentMember.points) {
        alert(t('insufficientPoints') || 'แต้มไม่เพียงพอ');
        return;
      }
      setAppliedDiscount({ type: 'points', value: points, pointsUsed: points });
    }
    
    setShowDiscountModal(false);
    setDiscountValue('');
    setPointsToUse('');
  };

  const removeDiscount = () => {
    setAppliedDiscount({ type: 'none', value: 0 });
    setDiscountType('none');
    setDiscountValue('');
    setPointsToUse('');
  };

  const getChange = () => {
    const paid = parseFloat(customerPaid) || 0;
    const total = getTotalAfterDiscount();
    return paid - total;
  };

  // ฟังก์ชันสำหรับการลดจำนวนสินค้าจาก lots ตามลำดับวันหมดอายุ
  const processStockReduction = async () => {
    console.log('🎉 ===== STARTING STOCK REDUCTION PROCESS =====');

    for (const cartItem of cart) {
      console.log("IN FOR LOOP", cartItem);
      if (!cartItem.lots || cartItem.lots.length === 0) {
        console.error(`❌ No lots data for product ${cartItem.product_id}`);
        continue;
      }

      let remainingQuantity = cartItem.quantity;
      const reductionHistory: any[] = [];

      console.log(`📋 Available lots for ${cartItem.product_name}:`, cartItem.lots.map(lot => ({
        lot_id: lot.lot_id,
        init_amount: lot.init_amount,
        expired_date: lot.expired_date
      })));

      // 🚀 BATCH PROCESSING - ลดจำนวนจาก lots แบบ batch เพื่อป้องกันการเบิ้ล
      console.log(`\n🎯 Starting BATCH processing for ${cartItem.product_name}`);

      // สร้าง batch data สำหรับ lots ที่ต้องการลด
      const batchOperations = [];
      let tempRemainingQuantity = remainingQuantity;

      for (const lot of cartItem.lots) {
        if (tempRemainingQuantity <= 0) break;

        const availableInLot = lot.init_amount || 0;
        const toReduceFromLot = Math.min(tempRemainingQuantity, availableInLot);

        if (toReduceFromLot > 0) {
          batchOperations.push({
            lot_id: lot.lot_id,
            current_amount: availableInLot,
            reduce_amount: toReduceFromLot,
            new_amount: availableInLot - toReduceFromLot,
            product_name: cartItem.product_name
          });
          tempRemainingQuantity -= toReduceFromLot;
        }
      }

      console.log(`📦 Batch operations prepared:`, batchOperations);

      if (batchOperations.length > 0) {
        try {
          // สร้าง unique batch ID เพื่อป้องกันการเบิ้ล
          const batchId = `batch-${Date.now()}-${cartItem.product_id}`;
          console.log(`🆔 Batch ID: ${batchId}`);

          // ทำการอัพเดต lots และสร้าง stock transactions แบบ batch
          for (const operation of batchOperations) {
            console.log(`\n🔄 Processing lot ${operation.lot_id} in batch...`);

            // 1. อัพเดต lot quantity
            const updateResponse = await fetch(`${API_URL}/lot/update-lot/${operation.lot_id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                init_amount: operation.new_amount
              })
            });

            if (updateResponse.ok) {
              console.log(`✅ Lot ${operation.lot_id} updated successfully. New amount: ${operation.new_amount}`);

              // 2. สร้าง stock transaction with unique batch reference
              const stockTransactionData = {
                trans_type: 'OUT',
                trans_date: new Date().toISOString(),
                qty: operation.reduce_amount,
                ref_no: `${batchId}-lot-${operation.lot_id}`, // Unique ref per batch and lot
                note: `POS Sale - ${operation.product_name} (Batch: ${batchId})`,
                lot_id_fk: operation.lot_id
              };

              console.log(`📝 Creating stock transaction for batch:`, stockTransactionData);
              
              const stockTransResponse = await fetch(`${API_URL}/stock/add-stock`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(stockTransactionData)
              });

              if (stockTransResponse.ok) {
                const stockResponseData = await stockTransResponse.json();
                console.log(`✅ Stock transaction created successfully for lot ${operation.lot_id}:`, stockResponseData);

                reductionHistory.push({
                  lot_id: operation.lot_id,
                  quantity: operation.reduce_amount,
                  remaining_in_lot: operation.new_amount,
                  transaction_created: true,
                  batch_id: batchId
                });
                remainingQuantity -= operation.reduce_amount;
              } else {
                const errorData = await stockTransResponse.text();
                console.error(`❌ Failed to create stock transaction for lot ${operation.lot_id}:`, errorData);
                console.error(`❌ Response status: ${stockTransResponse.status}`);
              }
            } else {
              const errorData = await updateResponse.text();
              console.error(`❌ Failed to update lot ${operation.lot_id}:`, errorData);
              console.error(`❌ Response status: ${updateResponse.status}`);
            }
          }

          console.log(`✅ Batch processing completed for ${cartItem.product_name}`);
        } catch (error) {
          console.error(`❌ Error during batch processing:`, error);
        }



      } else {
        console.log(`❌ No available lots for product ${cartItem.product_name}`);
      }

      if (remainingQuantity > 0) {
        console.warn(`⚠️ Could not fulfill ${remainingQuantity} units for product ${cartItem.product_name}`);
      }

      console.log(`📊 Stock reduction summary for ${cartItem.product_name}:`, reductionHistory);
      console.log(`✅ Completed processing ${cartItem.product_name}\n`);
    }

    console.log('🎉 ===== STOCK REDUCTION PROCESS COMPLETED =====\n');
  };

  // ฟังก์ชันจัดการเมื่อการชำระเงินสำเร็จ
  const handlePaymentSuccess = async () => {
    console.log('🚨 ===== PAYMENT SUCCESS HANDLER CALLED =====');
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('🔒 Is already processing (REF):', isProcessingStockReductionRef.current);
    console.log('🛒 Current cart:', cart.map(item => ({
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity
    })));
    
    // ✅ CRITICAL: Check ref synchronously - blocks immediately!
    if (isProcessingStockReductionRef.current) {
      console.log('⚠️ ⛔ Stock reduction ALREADY IN PROGRESS - BLOCKING duplicate call!');
      console.log('🚨 ===== PAYMENT SUCCESS HANDLER FINISHED (BLOCKED) =====\n');
      return;
    }
    
    // ✅ Set lock immediately (synchronous)
    isProcessingStockReductionRef.current = true;
    console.log('🔓 Lock acquired - proceeding with stock reduction');
    
    try {
      console.log('💳 Payment successful - processing stock reduction...');
      
      await processStockReduction();
      console.log('✅ Stock reduction completed and flag confirmed as true');

      console.log('✅ Stock reduction completed in handlePaymentSuccess');
    } catch (error) {
      console.error('❌ Error during payment success handling:', error);
    } finally {
      // ✅ Always release lock
      isProcessingStockReductionRef.current = false;
      console.log('🔓 Lock released');
    }
    
    console.log('🚨 ===== PAYMENT SUCCESS HANDLER FINISHED =====\n');
  };

  const processPayment = async () => {
    console.log('🎯 ===== PROCESS PAYMENT CALLED =====');
    console.log('💰 Selected payment method:', selectedPayment);

    setIsProcessing(true);
    try {

      if (selectedPayment === "promptpay") {
        console.log('📱 PromptPay payment - showing QR confirmation modal');
        // Show QR confirmation modal first instead of creating payment immediately
        setShowQRConfirmModal(true);
        setIsProcessing(false); // Reset processing state since we're showing modal
        return;
      } else if (selectedPayment === "cash") {
        console.log('� Cash payment - showing confirmation modal');
        // Show Cash confirmation modal for staff to verify cash received
        setShowCashConfirmModal(true);
        setIsProcessing(false);
        return;
      }

    } catch (error) {
      if (error instanceof Error) {
        console.error("Payment processing error:", error.message);
      } else {
        console.error("Payment processing error:", error);
      }
      alert("Payment processing error occurred");
    } finally {
      setIsProcessing(false);
    }

    console.log('🎯 ===== PROCESS PAYMENT FINISHED =====\n');
  };
  const navigate = useNavigate();


  const checkme = async () => {
    try {
      const authme = await fetch(`${API_URL}/me`, {
        method: 'GET',
        credentials: 'include'
      })
      const data = await authme.json();
      console.log(data)
      setEmployeeId(data.user.employee_id)
      if (authme.status === 401 || authme.status === 403) {
        navigate('/login');
        return;
      }

      console.log('Authme data:', data);
    } catch (error) {
      console.log('Error', error)

    }
  }

  const canProcessPayment = () => {
    const total = getTotalAfterDiscount();
    const paid = parseFloat(customerPaid) || 0;
    return cart.length > 0 && (selectedPayment !== "cash" || paid >= total);
  };

  // Handle QR Payment Creation after confirmation
  const confirmQRPayment = async () => {
    setIsProcessing(true);
    setShowQRConfirmModal(false);
    console.log('Employee ID:', employee_id);
    try {
      const orderData = {
        items: cart.map(item => ({
          product_id: item.original_product_id || item.product_id, // Use original product ID for order
          price: item.price,
          quantity: item.quantity
        })),
        employee_id: employee_id,
        customer_id: currentMember?.id ? (isNaN(parseInt(currentMember.id)) ? null : parseInt(currentMember.id)) : null, // Convert string ID back to integer safely
        payment_method_types: "promptpay",
        total_amount: getTotalAfterDiscount(), // ใช้ราคาหลังหักส่วนลด
        discount_amount: getDiscountAmount(), // ส่งจำนวนส่วนลดไปด้วย
        discount_type: appliedDiscount.type,
        points_used: appliedDiscount.pointsUsed || 0
      };

      console.log('Sending order data to create QR for customer display:', orderData);

  const response = await fetch(`${API_URL}/order/createOrder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      console.log('RESULT', result.data);

      if (result.status) {
        // Store order ID and payment intent ID for verification
        const newOrderId = result.data.order_id;
        const newPaymentIntentId = result.data.pi;
        
        setOrderId(newOrderId);
        setPaymentIntentId(newPaymentIntentId);
        setQrCodeData(result.data);
        setQrPaymentStatus('pending');
        setQrSentToDisplay(true);
        setShowSuccessPopup(true);
        
        console.log('Stored Order ID:', newOrderId);
        console.log('Stored Payment Intent ID:', newPaymentIntentId);
        
        // Start auto verification after QR Code is sent successfully
        // Use local variables to avoid stale closure
        setTimeout(() => {
          console.log('🎯 Attempting to start auto verification...');
          console.log('📋 Using IDs:', { orderId: newOrderId, paymentIntentId: newPaymentIntentId });
          startAutoVerification(newOrderId, newPaymentIntentId);
        }, 2000); // Wait 2 seconds before starting auto verification

        // Auto-hide success popup after 3 seconds
        setTimeout(() => {
          setShowSuccessPopup(false);
        }, 3000);
      } else {
        throw new Error(result.message || result.error || 'Failed to create QR payment');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Payment processing error:", error.message);
        setErrorMessage(`Payment processing error: ${error.message}`);
      } else {
        console.error("Payment processing error:", error);
        setErrorMessage("Payment processing error occurred");
      }

      setShowErrorPopup(true);
      // Auto-hide error popup after 5 seconds
      setTimeout(() => {
        setShowErrorPopup(false);
      }, 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Cash Payment Confirmation
  const confirmCashPayment = async () => {
    setIsProcessing(true);
    setShowCashConfirmModal(false);
    
    try {
      console.log('💵 Processing cash payment...');
      
      // Create order via API
      const orderData = {
        items: cart.map(item => ({
          product_id: item.original_product_id || item.product_id,
          price: item.price,
          quantity: item.quantity
        })),
        employee_id: employee_id,
        point: calculatePoints(),
        customer_id: currentMember?.id || null,
        total_amount: getTotalAfterDiscount(),
        total_price: getTotalAmount(),
        discount_amount: getDiscountAmount(),
        discount_type: appliedDiscount.type,
        points_used: appliedDiscount.pointsUsed || 0,
        payment_method: 'CASH'
      };

      const response = await fetch(`${API_URL}/order/createOrder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      console.log('Cash order creation response:', result);

      if (result.status) {
        // Add points to member if applicable
        if (currentMember && calculatePoints() > 0) {
          await addPoints();
        }

        // Deduct points if used for discount
        if (appliedDiscount.type === 'points' && appliedDiscount.pointsUsed && currentMember) {
          await deductPoints(appliedDiscount.pointsUsed);
        }

        // Create receipt
        const receipt = {
          id: `POS-${result.order.order_id || Date.now()}`,
          date: new Date().toLocaleString('th-TH'),
          items: cart,
          subtotal: getTotalAmount(),
          discount: getDiscountAmount(),
          total: getTotalAfterDiscount(),
          payment: 'cash',
          amountPaid: parseFloat(customerPaid),
          change: getChange(),
          member: currentMember,
          pointsEarned: currentMember ? calculatePoints() : 0,
          discountType: appliedDiscount.type,
          pointsUsed: appliedDiscount.pointsUsed || 0
        };

        setReceiptData(receipt);
        setShowReceipt(true);
        setCart([]);
        setCustomerPaid("");
        
        console.log('✅ Cash payment completed successfully');
      } else {
        throw new Error(result.message || 'Failed to create cash order');
      }
    } catch (error) {
      console.error('Cash payment error:', error);
      await Swal.fire({
        title: t('errorOccurredTitle'),
        text: error instanceof Error ? error.message : 'Error processing cash payment',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const addPoints = async () => {
    const calculated = calculatePoints();

    // Only add points if member exists and points are positive
    if (!currentMember?.id || calculated <= 0) {
      console.log('No member selected or no points to add');
      return;
    }

    try {
  const response = await fetch(`${API_URL}/customer/add-point/${currentMember.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          point: calculated,
        })
      });

      const data = await response.json();
      console.log('Add points response:', data);

      if (data.status) {
        console.log(`✅ Successfully added ${calculated} points to ${currentMember.name}`);
      } else {
        console.error('❌ Failed to add points:', data.error);
        alert(`Failed to add points: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Error adding points:', error);
      alert('Error occurred while adding points');
    }
  }

  const deductPoints = async (pointsToDeduct: number) => {
    if (!currentMember?.id || pointsToDeduct <= 0) {
      console.log('No member selected or no points to deduct');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/customer/deduct-point/${currentMember.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          point: pointsToDeduct,
        })
      });

      const data = await response.json();
      console.log('Deduct points response:', data);

      if (data.status) {
        console.log(`✅ Successfully deducted ${pointsToDeduct} points from ${currentMember.name}`);
      } else {
        console.error('❌ Failed to deduct points:', data.error);
      }
    } catch (error) {
      console.error('❌ Error deducting points:', error);
    }
  }

  const verifyPayment = async () => {
    if (!orderId || !paymentIntentId) {
      setErrorMessage('ไม่พบข้อมูลการสั่งซื้อหรือข้อมูลการชำระเงิน');
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 5000);
      return;
    }

    // Stop auto verification when manual verification is triggered
    if (autoVerifyInterval) {
      clearInterval(autoVerifyInterval);
      setAutoVerifyInterval(null);
      setIsAutoVerifying(false);
      console.log('🛑 Auto verification stopped - manual verification initiated');
    }

    setIsVerifyingPayment(true);

    try {
      console.log('Verifying payment with order_id:', orderId, 'pi:', paymentIntentId);

  const response = await fetch(`${API_URL}/payment/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          order_id: orderId,
          pi: paymentIntentId
        })
      });

      const result = await response.json();
      console.log('Payment verification result:', result);

      if (result.success && result.status === 'succeeded') {
        // Payment successful - show success modal
        setQrPaymentStatus('success');

        // ลดจำนวนสินค้าจาก lots เมื่อการชำระเงินสำเร็จ
        await handlePaymentSuccess();

        if (currentMember) {
          addPoints();
          console.log("Addpoint successfully")
        }
        setShowRequiresActionModal(false);
        setShowPaymentSuccessModal(true);
      } else if (result.status === 'requires_action') {
        setQrPaymentStatus('pending');
        setShowPaymentSuccessModal(false);
        setShowRequiresActionModal(true);
      } else if (result.status === 'pending') {
        setQrPaymentStatus('pending');
        setShowPaymentSuccessModal(false);
        setShowRequiresActionModal(false);
        setErrorMessage(`Payment Status: ${result.status} - Please wait and try again`);
        setShowErrorPopup(true);
        setTimeout(() => setShowErrorPopup(false), 5000);
      } else if (result.status === 'failed' || result.status === 'canceled') {
        setQrPaymentStatus('failed');
        setShowPaymentSuccessModal(false);
        setShowRequiresActionModal(false);
        setErrorMessage(`Payment ${result.status} - Please try again`);
        setShowErrorPopup(true);
        setTimeout(() => setShowErrorPopup(false), 5000);
      } else if (result.status && result.data) {
        // Legacy handling - check if result.data contains the actual status
        const paymentStatus = result.data;
        if (paymentStatus === 'succeeded') {
          setQrPaymentStatus('success');
          setShowRequiresActionModal(false);
          setShowPaymentSuccessModal(true);
        } else if (paymentStatus === 'requires_action') {
          setQrPaymentStatus('pending');
          setShowPaymentSuccessModal(false);
          setShowRequiresActionModal(true);
        } else {
          setQrPaymentStatus('pending');
          setShowPaymentSuccessModal(false);
          setShowRequiresActionModal(false);
          setErrorMessage(`Payment Status: ${paymentStatus} - Please wait and try again`);
          setShowErrorPopup(true);
          setTimeout(() => setShowErrorPopup(false), 5000);
        }
      } else {
        // Verification failed
        setShowPaymentSuccessModal(false);
        setShowRequiresActionModal(false);
        setErrorMessage(result.error || 'Unable to verify payment');
        setShowErrorPopup(true);
        setTimeout(() => setShowErrorPopup(false), 5000);
      }

    } catch (error) {
      console.error('Payment verification error:', error);
      setErrorMessage('Error verifying payment');
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 5000);
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const startAutoVerification = (orderIdParam?: number | null, paymentIntentIdParam?: string | null) => {
    const verifyOrderId = orderIdParam ?? orderId;
    const verifyPaymentIntentId = paymentIntentIdParam ?? paymentIntentId;
    
    console.log('🎯 startAutoVerification called');
    console.log('📋 Validation check:', { 
      orderId: !!verifyOrderId, 
      paymentIntentId: !!verifyPaymentIntentId, 
      isAutoVerifying,
      orderIdValue: verifyOrderId,
      paymentIntentIdValue: verifyPaymentIntentId 
    });
    
    if (!verifyOrderId || !verifyPaymentIntentId || isAutoVerifying) {
      console.log('❌ Cannot start auto verification:', { orderId: verifyOrderId, paymentIntentId: verifyPaymentIntentId, isAutoVerifying });
      return;
    }

    console.log('🚀 Starting auto verification for order:', verifyOrderId);
    setIsAutoVerifying(true);

    const interval = setInterval(async () => {
      try {
        console.log('🔍 Auto verification check...');
        
        const response = await fetch(`${API_URL}/payment/check`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            order_id: verifyOrderId,
            pi: verifyPaymentIntentId
          })
        });

        const result = await response.json();
        console.log('🔍 Auto verification result:', result);
        
        if (result.success && result.status === 'succeeded') {
          console.log('✅ Auto verification success!');
          
          // ✅ CRITICAL: Clear interval IMMEDIATELY before doing anything else
          clearInterval(interval);
          setAutoVerifyInterval(null);
          setIsAutoVerifying(false);
          console.log('🛑 Auto verification interval cleared BEFORE stock reduction');
          
          setQrPaymentStatus('success');
          
          // Stock reduction is now handled in handlePaymentSuccess
          await handlePaymentSuccess();
          
          if (currentMember) {
            addPoints();
          }
          setShowRequiresActionModal(false);
          setShowPaymentSuccessModal(true);
        } else if (result.status === 'failed' || result.status === 'canceled') {
          console.log('❌ Auto verification failed');
          clearInterval(interval);
          setAutoVerifyInterval(null);
          setIsAutoVerifying(false);
          setQrPaymentStatus('failed');
          setErrorMessage(`Payment ${result.status} - Please try again`);
          setShowErrorPopup(true);
          setTimeout(() => setShowErrorPopup(false), 5000);
        }
        // Continue polling for pending status
      } catch (error) {
        console.error('Auto verification error:', error);
      }
    }, 3000); // Check every 3 seconds

    setAutoVerifyInterval(interval);

    // Stop auto verification after 5 minutes
    setTimeout(() => {
      if (interval) {
        console.log('⏱️ Auto verification timeout after 5 minutes');
        clearInterval(interval);
        setAutoVerifyInterval(null);
        setIsAutoVerifying(false);
      }
    }, 300000); // 5 minutes
  };

  // Handle new transaction - reset all states including auto verification
  const handleNewTransaction = () => {
    // Stop auto verification
    if (autoVerifyInterval) {
      clearInterval(autoVerifyInterval);
      setAutoVerifyInterval(null);
      setIsAutoVerifying(false);
    }

    // Reset all payment states
    setShowPaymentSuccessModal(false);
    setShowQRConfirmModal(false);
    setCart([]);
    setQrSentToDisplay(false);
    setOrderId(null);
    setPaymentIntentId(null);
    setQrPaymentStatus('pending');
    setQrCodeData(null);
    setSelectedPayment('cash');
    setIsVerifyingPayment(false);
    isProcessingStockReductionRef.current = false; // Reset stock reduction flag (REF)
    
    // Reset discount states
    setAppliedDiscount({ type: 'none', value: 0 });
    setDiscountType('none');
    setDiscountValue('');
    setPointsToUse('');
    
    console.log('🔄 New transaction started, all states reset including discount');
  };

  // Get dynamic button text based on verification state
  const getPaymentButtonText = () => {
    if (qrSentToDisplay && selectedPayment === "promptpay") {
      if (isAutoVerifying) {
        return t('autoVerifying');
      } else if (isVerifyingPayment) {
        return t('verifying');
      } else {
        return t('verifyPayment');
      }
    } else {
      if (isProcessing) {
        return t('processing');
      } else {
        return t('pay');
      }
    }
  };

  return (
    <div className="min-h-screen p-4"
      style={{ backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#f9fafb' }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6"
          style={{ color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151' }}>{t('posSystem')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Search & List */}
          <div className="lg:col-span-2 rounded-lg shadow-md p-6"
            style={{ backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white' }}>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5"
                  style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#9ca3af' }} />
                <input
                  type="text"
                  placeholder={t('searchProducts')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                    borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#e5e7eb',
                    color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.product_id}
                  className={`border rounded-lg p-4 transition-shadow ${(product.stock || 0) > 0
                      ? 'hover:shadow-md cursor-pointer'
                      : 'cursor-not-allowed opacity-75'
                    }`}
                  style={{
                    borderColor: (product.stock || 0) > 0
                      ? (document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb')
                      : '#9ca3af',
                    backgroundColor: (product.stock || 0) > 0
                      ? (document.documentElement.classList.contains('dark') ? '#4b5563' : 'white')
                      : (document.documentElement.classList.contains('dark') ? '#374151' : '#f3f4f6')
                  }}
                  onClick={() => (product.stock || 0) > 0 ? addToCart(product) : null}
                >
                  {/* Lot Number Badge - Show at top if exists */}
                  {product.lot_no && (
                    <div className="mb-2 inline-flex items-center px-2 py-1 rounded text-xs font-semibold"
                      style={{ 
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#1e40af' : '#dbeafe',
                        color: document.documentElement.classList.contains('dark') ? '#bfdbfe' : '#1e40af'
                      }}>
                       Lot #{product.lot_no}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm truncate"
                      style={{ color: document.documentElement.classList.contains('dark') ? 'white' : '#1f2937' }}>
                      {product.product_name}
                    </h3>
                    <span className="text-xs"
                      style={{ color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#6b7280' }}>
                      {t('stock')}: {product.stock}
                    </span>
                  </div>
                  
                  <p className="text-xs mb-2"
                    style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}>{product.brand}</p>
                  
                  {/* Expiration Date if exists */}
                  {product.expired_date && (
                    <div className="text-xs mb-2 flex items-center"
                      style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}>
                      <span className="mr-1">📅</span>
                      Exp: {new Date(product.expired_date).toLocaleDateString()}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    {(product.stock || 0) > 0 ? (
                      <span className="text-lg font-bold text-green-600">
                        ฿{product.price?.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-lg font-bold text-gray-500">
                        SOLD OUT
                      </span>
                    )}
                    <span className="text-xs"
                      style={{ color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#6b7280' }}>{product.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart & Payment */}
          <div className="rounded-lg shadow-md p-6"
            style={{ backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white' }}>
            <h2 className="text-xl font-bold mb-4 flex items-center"
              style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>
              <ShoppingCart className="mr-2" />
              {t('cartItems')}
            </h2>

            {/* Member Section */}
            <div className="mb-4 p-3 rounded-lg"
              style={{ backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f9fafb' }}>
              {currentMember ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User size={20} className="text-blue-600" />
                    <div>
                      <p className="font-medium text-sm"
                        style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>{currentMember.name}</p>
                      <p className="text-xs"
                        style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}>
                        <Star size={12} className="inline mr-1" />
                        {currentMember.points} {t('points')} | {currentMember.level}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeMember}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowMemberModal(true)}
                  className="w-full flex items-center justify-center space-x-2 py-2 border-2 border-dashed hover:border-blue-400 transition-colors"
                  style={{
                    borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
                    color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#60a5fa';
                    e.currentTarget.style.color = '#2563eb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db';
                    e.currentTarget.style.color = document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280';
                  }}
                >
                  <User size={20} />
                  <span>{t('addMember')}</span>
                </button>
              )}
            </div>

            <div className="mb-4 max-h-64 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">{t('noItemsInCart')}</p>
              ) : (
                cart.map((item) => (
                  <div key={item.product_id} className="border-b border-gray-200 py-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-sm" style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>
                          {item.product_name}
                        </h4>
                        {/* Show Lot Number if available */}
                        {item.lot_no && (
                          <span className="text-xs inline-flex items-center px-2 py-0.5 rounded mt-1"
                            style={{ 
                              backgroundColor: document.documentElement.classList.contains('dark') ? '#1e40af' : '#dbeafe',
                              color: document.documentElement.classList.contains('dark') ? '#bfdbfe' : '#1e40af'
                            }}>
                            📦 Lot #{item.lot_no}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="bg-gray-200 hover:bg-gray-300 rounded px-2 py-1"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-medium" style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="bg-gray-200 hover:bg-gray-300 rounded px-2 py-1"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <span className="font-bold text-green-600">
                        ฿{item.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <>
                <div className="border-t pt-4 mb-4"
                  style={{ borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb' }}>
                  {/* Subtotal */}
                  <div className="flex justify-between items-center mb-2">
                    <span style={{ color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#6b7280' }}>{t('subtotal')}:</span>
                    <span style={{ color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#6b7280' }}>฿{getTotalAmount().toFixed(2)}</span>
                  </div>

                  {/* Discount Section */}
                  {appliedDiscount.type !== 'none' ? (
                    <div className="flex justify-between items-center mb-2 text-red-600">
                      <span className="flex items-center">
                        {t('discount')}
                        {appliedDiscount.type === 'points' && ` (${appliedDiscount.pointsUsed} ${t('points')})`}:
                      </span>
                      <span>-฿{getDiscountAmount().toFixed(2)}</span>
                    </div>
                  ) : null}

                  {/* Discount Button */}
                  <div className="mb-3">
                    {appliedDiscount.type === 'none' ? (
                      <button
                        onClick={() => setShowDiscountModal(true)}
                        className="w-full py-2 rounded-lg text-sm font-medium transition-colors"
                        style={{
                          backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb',
                          color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'
                        }}
                      >
                        + {t('addDiscount')}
                      </button>
                    ) : (
                      <button
                        onClick={removeDiscount}
                        className="w-full py-2 rounded-lg text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                      >
                        ✕ {t('removeDiscount')}
                      </button>
                    )}
                  </div>

                  {/* Total After Discount */}
                  <div className="flex justify-between items-center text-xl font-bold mb-2 pt-2 border-t"
                    style={{ borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb' }}>
                    <span style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>{t('total')}:</span>
                    <span className="text-green-600">฿{getTotalAfterDiscount().toFixed(2)}</span>
                  </div>

                  {/* Points Section */}
                  {currentMember && (
                    <div className="flex justify-between items-center text-sm mb-2"
                      style={{ color: document.documentElement.classList.contains('dark') ? '#60a5fa' : '#2563eb' }}>
                      <span className="flex items-center">
                        <Star size={16} className="mr-1" />
                        {t('pointsToEarn')}:
                      </span>
                      <span className="font-medium">+{calculatePoints()} {t('points')}</span>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="mb-4">
                  <h3 className="font-medium mb-2"
                    style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>Payment Method</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSelectedPayment("cash")}
                      className="p-2 rounded text-sm flex flex-col items-center"
                      style={{
                        backgroundColor: selectedPayment === "cash"
                          ? "#3b82f6"
                          : document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb',
                        color: selectedPayment === "cash"
                          ? "white"
                          : document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'
                      }}
                    >
                      <Banknote size={20} />
                      <span>Cash</span>
                    </button>
                    <button
                      onClick={() => setSelectedPayment("promptpay")}
                      className="p-2 rounded text-sm flex flex-col items-center"
                      style={{
                        backgroundColor: selectedPayment === "promptpay"
                          ? "#3b82f6"
                          : document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb',
                        color: selectedPayment === "promptpay"
                          ? "white"
                          : document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'
                      }}
                    >
                      <QrCode size={20} />
                      <span>Pay with QR</span>
                    </button>
                  </div>
                </div>

                {selectedPayment === "cash" && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2"
                      style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>
                      Amount Received
                    </label>
                    <input
                      type="number"
                      value={customerPaid}
                      onChange={(e) => setCustomerPaid(e.target.value)}
                      placeholder="0.00"
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                        borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#e5e7eb',
                        color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                      }}
                    />
                    {customerPaid && getChange() >= 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        Change: ฿{getChange().toFixed(2)}
                      </p>
                    )}
                    {customerPaid && getChange() < 0 && (
                      <p className="text-sm text-red-600 mt-1">
                        Insufficient Amount
                      </p>
                    )}
                  </div>
                )}

                {qrSentToDisplay && selectedPayment === "promptpay" ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={verifyPayment}
                      disabled={isVerifyingPayment}
                      className={`flex-1 py-3 rounded-lg font-medium ${
                        isVerifyingPayment
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {getPaymentButtonText()}
                    </button>
                    <button
                      onClick={async () => {
                        const result = await Swal.fire({
                          title: t('confirmCancelOrder'),
                          text: t('confirmCancelOrderText'),
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonColor: '#ef4444',
                          cancelButtonColor: '#6b7280',
                          confirmButtonText: t('yesCancelIt'),
                          cancelButtonText: t('noKeepIt')
                        });

                        if (result.isConfirmed) {
                          try {
                            // Cancel order via API
                            const response = await fetch(`${API_URL}/order/cancelOrder`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              credentials: 'include',
                              body: JSON.stringify({
                                order_id: orderId,
                                payment_intent_id: paymentIntentId
                              })
                            });
                            
                            if (response.ok) {
                              await Swal.fire({
                                title: t('cancelledSuccessfully'),
                                text: t('orderCancelledText'),
                                icon: 'success',
                                confirmButtonColor: '#10b981'
                              });
                              
                              // Reset all states
                              setCart([]);
                              setQrSentToDisplay(false);
                              setOrderId(null);
                              setPaymentIntentId(null);
                              setSelectedPayment('cash');
                              setAppliedDiscount({ type: 'none', value: 0 });
                              setDiscountType('none');
                              setDiscountValue('');
                              setPointsToUse('');
                            } else {
                              await Swal.fire({
                                title: t('errorOccurredTitle'),
                                text: t('cannotCancelOrder'),
                                icon: 'error',
                                confirmButtonColor: '#ef4444'
                              });
                            }
                          } catch (error) {
                            console.error('Cancel order error:', error);
                            await Swal.fire({
                              title: t('errorOccurredTitle'),
                              text: t('errorCancellingOrder'),
                              icon: 'error',
                              confirmButtonColor: '#ef4444'
                            });
                          }
                        }
                      }}
                      className="flex-1 py-3 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={processPayment}
                    disabled={!canProcessPayment() || isProcessing}
                    className={`w-full py-3 rounded-lg font-medium ${
                      canProcessPayment() && !isProcessing
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {getPaymentButtonText()}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 backdrop-blur-xl flex items-center justify-center z-50">
          <div className="rounded-lg p-8 max-w-md w-full mx-4 border shadow-lg"
            style={{
              backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
              borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#60a5fa'
            }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold"
                style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>
                {t('addDiscount')}
              </h3>
              <button
                onClick={() => {
                  setShowDiscountModal(false);
                  setDiscountType('none');
                  setDiscountValue('');
                  setPointsToUse('');
                }}
                className="hover:text-gray-700"
                style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Discount Type Selection */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setDiscountType('percentage')}
                className="w-full p-4 rounded-lg border-2 text-left transition-all"
                style={{
                  borderColor: discountType === 'percentage' ? '#3b82f6' : (document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'),
                  backgroundColor: discountType === 'percentage' ? (document.documentElement.classList.contains('dark') ? '#1e3a8a' : '#dbeafe') : 'transparent',
                  color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                }}
              >
                <div className="font-medium">{t('percentageDiscount')}</div>
                <div className="text-sm"
                  style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}>
                  {t('discountByPercentage')}
                </div>
              </button>

              <button
                onClick={() => setDiscountType('amount')}
                className="w-full p-4 rounded-lg border-2 text-left transition-all"
                style={{
                  borderColor: discountType === 'amount' ? '#3b82f6' : (document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'),
                  backgroundColor: discountType === 'amount' ? (document.documentElement.classList.contains('dark') ? '#1e3a8a' : '#dbeafe') : 'transparent',
                  color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                }}
              >
                <div className="font-medium">{t('amountDiscount')}</div>
                <div className="text-sm"
                  style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}>
                  {t('discountByAmount')}
                </div>
              </button>

              {currentMember && (
                <button
                  onClick={() => setDiscountType('points')}
                  className="w-full p-4 rounded-lg border-2 text-left transition-all"
                  style={{
                    borderColor: discountType === 'points' ? '#3b82f6' : (document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'),
                    backgroundColor: discountType === 'points' ? (document.documentElement.classList.contains('dark') ? '#1e3a8a' : '#dbeafe') : 'transparent',
                    color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                  }}
                >
                  <div className="font-medium flex items-center">
                    <Star size={16} className="mr-2 text-yellow-500" />
                    {t('usePoints')}
                  </div>
                  <div className="text-sm"
                    style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}>
                    {t('availablePoints')}: {currentMember.points} {t('points')} (1 {t('point')} = 1 ฿)
                  </div>
                </button>
              )}
            </div>

            {/* Input Section */}
            {discountType === 'percentage' && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2"
                  style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>
                  {t('discountPercentage')} (%)
                </label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder="0-100"
                  min="0"
                  max="100"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                    borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#e5e7eb',
                    color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                  }}
                />
              </div>
            )}

            {discountType === 'amount' && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2"
                  style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>
                  {t('discountAmount')} (฿)
                </label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                    borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#e5e7eb',
                    color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                  }}
                />
              </div>
            )}

            {discountType === 'points' && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2"
                  style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>
                  {t('pointsToUse')}
                </label>
                <input
                  type="number"
                  value={pointsToUse}
                  onChange={(e) => setPointsToUse(e.target.value)}
                  placeholder={`0 - ${currentMember?.points || 0}`}
                  min="0"
                  max={currentMember?.points || 0}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                    borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#e5e7eb',
                    color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                  }}
                />
                <p className="text-sm mt-2"
                  style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}>
                  {t('willReduce')}: ฿{pointsToUse ? parseFloat(pointsToUse).toFixed(2) : '0.00'}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDiscountModal(false);
                  setDiscountType('none');
                  setDiscountValue('');
                  setPointsToUse('');
                }}
                className="flex-1 py-3 rounded-lg font-medium"
                style={{
                  backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb',
                  color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'
                }}
              >
                {t('cancel')}
              </button>
              <button
                onClick={applyDiscount}
                disabled={discountType === 'none' || 
                         (discountType === 'percentage' && !discountValue) ||
                         (discountType === 'amount' && !discountValue) ||
                         (discountType === 'points' && !pointsToUse)}
                className="flex-1 py-3 rounded-lg font-medium"
                style={{
                  backgroundColor: (discountType === 'none' || 
                                  (discountType === 'percentage' && !discountValue) ||
                                  (discountType === 'amount' && !discountValue) ||
                                  (discountType === 'points' && !pointsToUse))
                    ? (document.documentElement.classList.contains('dark') ? '#4b5563' : '#9ca3af')
                    : '#10b981',
                  color: 'white',
                  cursor: (discountType === 'none' || 
                          (discountType === 'percentage' && !discountValue) ||
                          (discountType === 'amount' && !discountValue) ||
                          (discountType === 'points' && !pointsToUse))
                    ? 'not-allowed' : 'pointer'
                }}
              >
                {t('applyDiscount')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Search Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 backdrop-blur-xl flex items-center justify-center z-50">
          <div className="rounded-lg p-8 max-w-lg w-full mx-4 border shadow-lg overflow-y-auto"
            style={{
              maxHeight: '90vh',
              backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
              borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#60a5fa'
            }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center"
                style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>
                <User className="mr-2" />
                {memberModalMode === 'search' ? t('searchMember') : t('addNewMember')}
              </h3>
              <button
                onClick={() => {
                  setShowMemberModal(false);
                  setMemberModalMode('search');
                  setNewMemberData({ name: '', phone: '', email: '', address: '' });
                }}
                className="hover:text-gray-700"
                style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Mode Toggle */}
            <div className="flex mb-4 rounded-lg p-1"
              style={{ backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f3f4f6' }}>
              <button
                onClick={() => setMemberModalMode('search')}
                className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors"
                style={{
                  backgroundColor: memberModalMode === 'search'
                    ? (document.documentElement.classList.contains('dark') ? '#374151' : 'white')
                    : 'transparent',
                  color: memberModalMode === 'search'
                    ? '#2563eb'
                    : document.documentElement.classList.contains('dark') ? '#d1d5db' : '#4b5563',
                  boxShadow: memberModalMode === 'search' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
                }}
              >
                {t('searchMember')}
              </button>
              <button
                onClick={() => setMemberModalMode('add')}
                className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors"
                style={{
                  backgroundColor: memberModalMode === 'add'
                    ? (document.documentElement.classList.contains('dark') ? '#374151' : 'white')
                    : 'transparent',
                  color: memberModalMode === 'add'
                    ? '#2563eb'
                    : document.documentElement.classList.contains('dark') ? '#d1d5db' : '#4b5563',
                  boxShadow: memberModalMode === 'add' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
                }}
              >
                {t('addNewMember')}
              </button>
            </div>

            {memberModalMode === 'search' ? (
              // Search Member Mode
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2"
                    style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>
                    {t('phoneNumber')}
                  </label>
                  <input
                    type="tel"
                    value={memberPhone}
                    onChange={(e) => setMemberPhone(e.target.value)}
                    placeholder={t('enterPhoneNumber')}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                      borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#e5e7eb',
                      color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                    }}
                    maxLength={10}
                  />
                </div>

                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => searchMember(memberPhone)}
                    disabled={!memberPhone || memberSearching}
                    className={`flex-1 py-2 rounded-lg font-medium ${memberPhone && !memberSearching
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                  >
                    {memberSearching ? t('searching') : t('search')}
                  </button>
                  <button
                    onClick={() => {
                      setShowMemberModal(false);
                      setMemberPhone("");
                    }}
                    className="flex-1 py-2 rounded-lg"
                    style={{
                      backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb',
                      color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'
                    }}
                  >
                    {t('cancel')}
                  </button>
                </div>

                {/* Quick Member Selection */}
                <div className="pt-4 border-t"
                  style={{ borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb' }}>
                  <p className="text-sm mb-3"
                    style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}>{t('quickAccessCustomers')}:</p>
                  <div className="space-y-2">
                    {quickMembers.length > 0 ? quickMembers.map((customer, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          // Directly set the customer instead of searching by phone
                          const convertedMember: Member = {
                            id: customer.customer_id.toString(),
                            name: customer.name || 'Unknown Customer',
                            phone: customer.phone_number || '',
                            points: customer.point || 0,
                            level: customer.point >= 500 ? 'Gold' : customer.point >= 200 ? 'Silver' : 'Bronze'
                          };
                          setCurrentMember(convertedMember);
                          setMemberPhone(customer.phone_number);
                          setShowMemberModal(false);
                        }}
                        className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm"
                        style={{ backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f9fafb' }}
                      >
                        <div className="font-medium"
                          style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>{customer.name}</div>
                        <div style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}>{customer.phone_number}</div>
                      </button>
                    )) : (
                      <p className="text-sm text-center py-2"
                        style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}>{t('noCustomersFound')}</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              // Add New Member Mode
              <>
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2"
                      style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>
                      {t('fullName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newMemberData.name}
                      onChange={(e) => setNewMemberData({ ...newMemberData, name: e.target.value })}
                      placeholder={t('enterFullName')}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                        borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#e5e7eb',
                        color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2"
                      style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>
                      {t('phoneNumber')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={newMemberData.phone}
                      onChange={(e) => setNewMemberData({ ...newMemberData, phone: e.target.value })}
                      placeholder="08X-XXX-XXXX"
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                        borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#e5e7eb',
                        color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                      }}
                      maxLength={10}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2"
                      style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>
                      {t('email')}
                    </label>
                    <input
                      type="email"
                      value={newMemberData.email}
                      onChange={(e) => setNewMemberData({ ...newMemberData, email: e.target.value })}
                      placeholder={t('emailPlaceholder')}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                        borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#e5e7eb',
                        color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2"
                      style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>
                      {t('address')}
                    </label>
                    <textarea
                      value={newMemberData.address}
                      onChange={(e) => setNewMemberData({ ...newMemberData, address: e.target.value })}
                      placeholder={t('enterAddress')}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : 'white',
                        borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#e5e7eb',
                        color: document.documentElement.classList.contains('dark') ? 'white' : 'black'
                      }}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={addNewMember}
                    disabled={!newMemberData.name || !newMemberData.phone || memberSearching}
                    className={`flex-1 py-2 rounded-lg font-medium ${newMemberData.name && newMemberData.phone && !memberSearching
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                  >
                    {memberSearching ? t('addingMember') : t('addMember')}
                  </button>
                  <button
                    onClick={() => {
                      setShowMemberModal(false);
                      setMemberModalMode('search');
                      setNewMemberData({ name: '', phone: '', email: '', address: '' });
                    }}
                    className="flex-1 py-2 rounded-lg"
                    style={{
                      backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb',
                      color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'
                    }}
                  >
                    {t('cancel')}
                  </button>
                </div>

                <div className="mt-4 p-3 rounded-lg"
                  style={{ backgroundColor: document.documentElement.classList.contains('dark') ? '#1e3a8a' : '#dbeafe' }}>
                  <p className="text-sm"
                    style={{ color: document.documentElement.classList.contains('dark') ? '#93c5fd' : '#1d4ed8' }}>
                    💡 <strong>{t('note')}:</strong> {t('newMemberNote')}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && receiptData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-lg p-6 max-w-md w-full mx-4"
            style={{ backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold"
                style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>ใบเสร็จรับเงิน</h3>
              <button
                onClick={() => setShowReceipt(false)}
                className="hover:text-gray-700"
                style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}
              >
                <X size={24} />
              </button>
            </div>

            <div className="text-center mb-4">
              <h4 className="font-bold"
                style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>ร้านขายยา PharmaC</h4>
              <p className="text-sm"
                style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}>เลขที่: {receiptData.id}</p>
              <p className="text-sm"
                style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}>{receiptData.date}</p>
            </div>

            {/* Member Info in Receipt */}
            {receiptData.member && (
              <div className="border-t border-b py-3 mb-4"
                style={{ borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb' }}>
                <div className="flex items-center justify-center space-x-2">
                  <User size={16} style={{ color: document.documentElement.classList.contains('dark') ? '#60a5fa' : '#2563eb' }} />
                  <span className="font-medium"
                    style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>สมาชิก: {receiptData.member.name}</span>
                </div>
                <p className="text-center text-sm"
                  style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}>
                  {receiptData.member.phone} | {receiptData.member.level}
                </p>
              </div>
            )}

            <div className="border-t border-b py-4 mb-4"
              style={{ borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb' }}>
              {receiptData.items.map((item: CartItem) => (
                <div key={item.product_id} className="flex justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm"
                      style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>{item.product_name}</p>
                    <p className="text-xs"
                      style={{ color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' }}>
                      {item.quantity} x ฿{item.price?.toFixed(2)}
                    </p>
                  </div>
                  <span className="font-medium"
                    style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>฿{item.total.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>รวม:</span>
                <span className="font-bold"
                  style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>฿{receiptData.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>รับเงิน:</span>
                <span style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>฿{receiptData.amountPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>เงินทอน:</span>
                <span style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>฿{receiptData.change.toFixed(2)}</span>
              </div>

              {/* Points Earned */}
              {receiptData.member && receiptData.pointsEarned > 0 && (
                <div className="flex justify-between font-medium"
                  style={{ color: document.documentElement.classList.contains('dark') ? '#60a5fa' : '#2563eb' }}>
                  <span className="flex items-center">
                    <Star size={16} className="mr-1" />
                    แต้มที่ได้รับ:
                  </span>
                  <span>+{receiptData.pointsEarned} แต้ม</span>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
              >
                พิมพ์
              </button>
              <button
                onClick={() => {
                  setShowReceipt(false);
                  // Reset discount after closing receipt
                  setAppliedDiscount({ type: 'none', value: 0 });
                  setDiscountType('none');
                  setDiscountValue('');
                  setPointsToUse('');
                }}
                className="flex-1 py-2 rounded-lg"
                style={{
                  backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb',
                  color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'
                }}
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Payment Modal */}
      {showQRModal && qrCodeData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center">
                <QrCode className="mr-2" />
                ชำระเงินด้วย QR Code
              </h3>
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setQrCodeData(null);
                  setQrPaymentStatus('pending');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="text-center mb-6">
              <h4 className="font-bold mb-2">สแกน QR Code เพื่อชำระเงิน</h4>
              <p className="text-sm text-gray-600 mb-4">
                จำนวนเงิน: ฿{getTotalAmount().toFixed(2)}
              </p>

              {/* QR Code Display */}
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
                {qrCodeData.qr_code_url ? (
                  <img
                    src={qrCodeData.qr_code_url}
                    alt="QR Code for Payment"
                    className="w-48 h-48 mx-auto"
                  />
                ) : (
                  <div className="w-48 h-48 mx-auto bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-500">กำลังโหลด QR Code...</p>
                  </div>
                )}
              </div>

              {/* Payment Status */}
              <div className="mb-4">
                {qrPaymentStatus === 'pending' && (
                  <div className="flex items-center justify-center text-orange-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600 mr-2"></div>
                    รอการชำระเงิน...
                  </div>
                )}
                {qrPaymentStatus === 'success' && (
                  <div className="text-green-600 font-medium">
                    ✅ ชำระเงินสำเร็จ!
                  </div>
                )}
                {qrPaymentStatus === 'failed' && (
                  <div className="text-red-600 font-medium">
                    ❌ การชำระเงินล้มเหลว
                  </div>
                )}
              </div>

              {/* Order Details */}
              <div className="text-left p-3 rounded-lg mb-4"
                style={{ backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f9fafb' }}>
                <p className="text-sm font-medium mb-2"
                  style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>รายการสินค้า:</p>
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm mb-1">
                    <span style={{ color: document.documentElement.classList.contains('dark') ? '#d1d5db' : 'black' }}>{item.product_name} x{item.quantity}</span>
                    <span style={{ color: document.documentElement.classList.contains('dark') ? '#d1d5db' : 'black' }}>฿{item.total.toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2"
                  style={{ borderColor: document.documentElement.classList.contains('dark') ? '#6b7280' : '#e5e7eb' }}>
                  <div className="flex justify-between font-bold">
                    <span style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>รวมทั้งหมด:</span>
                    <span style={{ color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }}>฿{getTotalAmount().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              {qrPaymentStatus === 'success' ? (
                <button
                  onClick={() => {
                    // Clear cart and close modal after successful payment
                    setCart([]);
                    setShowQRModal(false);
                    setQrCodeData(null);
                    setQrPaymentStatus('pending');
                    // Reset discount
                    setAppliedDiscount({ type: 'none', value: 0 });
                    setDiscountType('none');
                    setDiscountValue('');
                    setPointsToUse('');
                    alert('ขายสำเร็จ! ขอบคุณครับ');
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                >
                  เสร็จสิ้น
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {

                      verifyStatus();
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                  >
                    ตรวจสอบการชำระเงิน
                  </button>
                  <button
                    onClick={() => {
                      setShowQRModal(false);
                      setQrCodeData(null);
                      setQrPaymentStatus('pending');
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg"
                  >
                    ยกเลิก
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR Payment Confirmation Modal */}
      {showQRConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center">
                <QrCode className="mr-2" />
                {qrSentToDisplay ? t('verifyPaymentStatus') : t('confirmQRPayment')}
              </h3>
              <button
                onClick={() => {
                  setShowQRConfirmModal(false);
                  setQrSentToDisplay(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Status Indicator */}
            {qrSentToDisplay && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center text-orange-700">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-sm font-medium">
                    {t('qrCodeSentToDisplay')}
                  </span>
                </div>
              </div>
            )}

            <div className="mb-6">
              <h4 className="font-bold mb-4">{t('orderItems')}</h4>

              {/* Order Details */}
              <div className="space-y-2 mb-4">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-sm">{item.product_name}</p>
                      <p className="text-xs text-gray-600">
                        ฿{item.price?.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium text-green-600">฿{item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Member Info */}
              {currentMember && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <div className="flex items-center space-x-2">
                    <User size={16} className="text-blue-600" />
                    <span className="text-sm font-medium">{t('member')}: {currentMember.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Star size={14} className="text-yellow-500" />
                    <span className="text-xs text-gray-600">
                      {t('willReceive')} +{calculatePoints()} {t('points')}
                    </span>
                  </div>
                </div>
              )}

              {/* Subtotal, Discount, Total */}
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t('subtotal')}:</span>
                  <span className="text-sm">฿{getTotalAmount().toFixed(2)}</span>
                </div>
                
                {appliedDiscount.type !== 'none' && (
                  <div className="flex justify-between items-center text-red-600">
                    <span className="text-sm">
                      {t('discount')}
                      {appliedDiscount.type === 'points' && ` (${appliedDiscount.pointsUsed} ${t('points')})`}:
                    </span>
                    <span className="text-sm">-฿{getDiscountAmount().toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-lg font-bold">{t('grandTotal')}:</span>
                  <span className="text-xl font-bold text-green-600">
                    ฿{getTotalAfterDiscount().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {!qrSentToDisplay ? (
                <>
                  <button
                    onClick={() => {
                      setShowQRConfirmModal(false);
                      setQrSentToDisplay(false);
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg font-medium"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={confirmQRPayment}
                    disabled={isProcessing}
                    className={`flex-2 py-3 rounded-lg font-medium ${isProcessing
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    style={{ flex: 2 }}
                  >
                    {isProcessing ? t('sendingQRCode') : t('sendQRToCustomerDisplay')}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      // Cancel payment - close modal and reset QR sent status
                      setShowQRConfirmModal(false);
                      setQrSentToDisplay(false);
                      setIsProcessing(false);
                      // Optionally notify backend to cancel the order
                      console.log('Payment cancelled by user');
                    }}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium"
                  >
                    {t('cancelPayment')}
                  </button>
                  <button
                    onClick={() => {
                      verifyStatus();
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
                  >
                    {t('checkPaymentStatus')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-slide-in">
            <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
              <span className="text-green-900 font-bold text-sm">✓</span>
            </div>
            <div>
              <p className="font-medium">{t('qrCodeSentSuccess')}</p>
              <p className="text-sm text-green-100">{t('sentToCustomerDisplay')}</p>
            </div>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="ml-4 text-green-100 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Payment Success Modal */}
      {showPaymentSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-green-900 font-bold text-xl">✓</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">{t('paymentSuccessful')}</h3>
              <p className="text-gray-600 mb-4">{t('paymentCompleted')}</p>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">{t('orderId')}:</span>
                  <span className="font-semibold">#{orderId}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">{t('subtotal')}:</span>
                  <span className="font-semibold">฿{getTotalAmount().toFixed(2)}</span>
                </div>
                {appliedDiscount.type !== 'none' && (
                  <div className="flex justify-between mb-2 text-red-600">
                    <span>{t('discount')}:</span>
                    <span className="font-semibold">-฿{getDiscountAmount().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between mb-2 border-t pt-2">
                  <span className="text-gray-600 font-bold">{t('totalAmount')}:</span>
                  <span className="font-semibold text-green-600">฿{getTotalAfterDiscount().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('paymentMethod')}:</span>
                  <span className="font-semibold">PromptPay QR</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
              >
                {t('printReceipt')}
              </button>
              <button
                onClick={handleNewTransaction}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium"
              >
                {t('newTransaction')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Requires Action Modal */}
      {showRequiresActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-yellow-900 font-bold text-xl">!</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-yellow-600 mb-2">{t('actionRequired')}</h3>
              <p className="text-gray-600 mb-4">{t('paymentRequiresAction')}</p>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">{t('orderId')}:</span>
                  <span className="font-semibold">#{orderId}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">{t('subtotal')}:</span>
                  <span className="font-semibold">฿{getTotalAmount().toFixed(2)}</span>
                </div>
                {appliedDiscount.type !== 'none' && (
                  <div className="flex justify-between mb-2 text-red-600">
                    <span>{t('discount')}:</span>
                    <span className="font-semibold">-฿{getDiscountAmount().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between mb-2 border-t pt-2">
                  <span className="text-gray-600 font-bold">{t('totalAmount')}:</span>
                  <span className="font-semibold text-yellow-600">฿{getTotalAfterDiscount().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('status')}:</span>
                  <span className="font-semibold text-yellow-600">{t('requiresAction')}</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-700">
                  {t('customerNeedsAction')}
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRequiresActionModal(false);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium"
              >
                {t('close')}
              </button>
              <button
                onClick={() => {
                  setShowRequiresActionModal(false);
                  verifyStatus(); // Check again
                }}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-medium"
              >
                {t('checkAgain')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cash Payment Confirmation Modal */}
      {showCashConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center text-gray-900">
                <Banknote className="mr-2" />
                {t('confirmCashPayment')}
              </h3>
              <button
                onClick={() => {
                  setShowCashConfirmModal(false);
                  setIsProcessing(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-6">
                {t('confirmCashReceived')}
              </p>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-bold mb-3 text-gray-900">{t('orderItems')}:</h4>
                <div className="space-y-2 mb-3">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.product_name} x{item.quantity}</span>
                      <span className="font-medium text-gray-900">฿{item.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Member Info */}
                {currentMember && (
                  <div className="border-t pt-3 mb-3">
                    <div className="flex items-center text-sm text-blue-600">
                      <User size={16} className="mr-2" />
                      <span>{currentMember.name}</span>
                    </div>
                    <div className="text-xs text-gray-600 ml-6">
                      {t('willReceive')} +{calculatePoints()} {t('points')}
                    </div>
                  </div>
                )}

                {/* Discount Display */}
                {appliedDiscount.type !== 'none' && (
                  <div className="border-t pt-3 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t('subtotal')}:</span>
                      <span className="text-gray-900">฿{getTotalAmount().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-red-600">
                      <span>
                        {t('discount')}
                        {appliedDiscount.type === 'points' && ` (${appliedDiscount.pointsUsed} ${t('points')})`}:
                      </span>
                      <span>-฿{getDiscountAmount().toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Total and Cash Details */}
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900">{t('grandTotal')}:</span>
                    <span className="text-green-600">฿{getTotalAfterDiscount().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold">
                    <span className="text-gray-700">{t('cashAmount')}:</span>
                    <span className="text-blue-600">฿{parseFloat(customerPaid).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold">
                    <span className="text-gray-700">{t('changeAmount')}:</span>
                    <span className="text-orange-600">฿{getChange().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCashConfirmModal(false);
                  setIsProcessing(false);
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-medium"
              >
                {t('cancelTransaction')}
              </button>
              <button
                onClick={confirmCashPayment}
                disabled={isProcessing}
                className={`flex-1 py-3 rounded-lg font-medium ${
                  isProcessing
                    ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isProcessing ? t('processing') : t('confirmReceived')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {showErrorPopup && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-slide-in max-w-md">
            <div className="w-6 h-6 bg-red-400 rounded-full flex items-center justify-center">
              <span className="text-red-900 font-bold text-sm">!</span>
            </div>
            <div className="flex-1">
              <p className="font-medium">{t('errorOccurred')}</p>
              <p className="text-sm text-red-100">{errorMessage}</p>
            </div>
            <button
              onClick={() => setShowErrorPopup(false)}
              className="ml-4 text-red-100 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
