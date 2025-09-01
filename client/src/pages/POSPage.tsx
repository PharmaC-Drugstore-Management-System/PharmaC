import { useState, useEffect } from "react";
import { Search, Plus, Minus, ShoppingCart,  Banknote, Trash2, X, User, Star, QrCode } from "lucide-react";
import "../styles/pos.css";
import { useNavigate } from "react-router-dom";

interface Product {
  product_id: number;
  product_name: string;
  brand: string;
  unit: string;
  price?: number;
  stock?: number;
  barcode: string;
  image?: string;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<"cash" | "promptpay" | "transfer">("cash");
  const [customerPaid, setCustomerPaid] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [employee_id, setEmployeeId] = useState<number | null>(null);
  const [orderId, setOrderId]  = useState<number | null>(null);
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
  const [quickMembers, setQuickMembers] = useState<any[]>([]);

  // Mock price data - you can fetch this from your API
  const productPrices: Record<number, number> = {
    26: 120.00,
    27: 85.50,
    // Add more product prices as needed
  };

  useEffect(() => {
    fetchProducts();
    checkme();
    loadQuickCustomers();
  }, []);

  const loadQuickCustomers = async () => {
    try {
      const response = await fetch("http://localhost:5000/customer/get-customers");
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

  const verifyStatus  = async () => {
    try {
      console.log(qrCodeData?.pi)
      console.log(qrCodeData?.order_id)
      const response = await fetch('http://localhost:5000/payment/check', {
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
      const response = await fetch("http://localhost:5000/inventory/get-medicine", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        const productsWithPrices = data.data.map((product: Product) => ({
          ...product,
          price: productPrices[product.product_id] || 50.00, // Default price
          stock: Math.floor(Math.random() * 100) + 10, // Mock stock
        }));
        setProducts(productsWithPrices);
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

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product_id === product.product_id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product_id === product.product_id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * (item.price || 0) }
          : item
      ));
    } else {
      const newItem: CartItem = {
        ...product,
        quantity: 1,
        total: product.price || 0,
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
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

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  // Member System Functions
  const searchMember = async (phone: string) => {
    setMemberSearching(true);
    try {
      // Call real API to get all customers and search by phone
      const response = await fetch("http://localhost:5000/customer/get-customers");
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
        alert("Member not found");
      }
    } catch (error) {
      console.error("Error searching member:", error);
      alert("Error occurred while searching for member");
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
      alert('Please fill in name and phone number');
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

      const response = await fetch("http://localhost:5000/customer/add-customer", {
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
    const totalAmount = getTotalAmount();
    return Math.floor(totalAmount / 10); // 1 point per 10 baht
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const getChange = () => {
    const paid = parseFloat(customerPaid) || 0;
    const total = getTotalAmount();
    return paid - total;
  };

  const processPayment = async () => {
    setIsProcessing(true);
    try {
      
      if (selectedPayment === "promptpay") {
        // Show QR confirmation modal first instead of creating payment immediately
        setShowQRConfirmModal(true);
        setIsProcessing(false); // Reset processing state since we're showing modal
        return;
      } else {
        // Handle Cash Payment (existing logic)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const receipt = {
          id: `POS-${Date.now()}`,
          date: new Date().toLocaleString('th-TH'),
          items: cart,
          subtotal: getTotalAmount(),
          total: getTotalAmount(),
          payment: selectedPayment,
          amountPaid: parseFloat(customerPaid),
          change: getChange(),
          member: currentMember,
          pointsEarned: currentMember ? calculatePoints() : 0,
        };
        
        setReceiptData(receipt);
        setShowReceipt(true);
        setCart([]);
        setCustomerPaid("");
      }
      
    } catch (error) {
      if (error instanceof Error) {
        console.error("Payment processing error:", error.message);
      } else {
        console.error("Payment processing error:", error);
      }
      alert("เกิดข้อผิดพลาดในการชำระเงิน");
    } finally {
      setIsProcessing(false);
    }
  };
    const navigate = useNavigate();
    
    const checkme = async () => {
      try {
        const authme = await fetch('http://localhost:5000/api/me', {
          method: 'GET',
          credentials: 'include'
        })
        const data = await authme.json();
        setEmployeeId(data.user.id)
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
    const total = getTotalAmount();
    const paid = parseFloat(customerPaid) || 0;
    return cart.length > 0 && (selectedPayment !== "cash" || paid >= total);
  };

  // Handle QR Payment Creation after confirmation
  const confirmQRPayment = async () => {
    setIsProcessing(true);
    setShowQRConfirmModal(false);
    
    try {
      const orderData = {
        items: cart.map(item => ({
          product_id: item.product_id,
          price: item.price,
          quantity: item.quantity
        })),
        employee_id: employee_id,
        customer_id: currentMember?.id ? (isNaN(parseInt(currentMember.id)) ? null : parseInt(currentMember.id)) : null, // Convert string ID back to integer safely
        payment_method_types: "promptpay",
        total_amount: getTotalAmount()
      };

      console.log('Sending order data to create QR for customer display:', orderData);

      const response = await fetch('http://localhost:5000/order/createOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      console.log('RESULT',result.data);

      if (result.status) {
        // Store order ID and payment intent ID for verification
        setOrderId(result.data.order_id);
        setPaymentIntentId(result.data.pi); // Store payment intent ID
        setQrCodeData(result.data);
        setQrPaymentStatus('pending');
        setQrSentToDisplay(true);
        setShowSuccessPopup(true);
        
        console.log('Stored Order ID:', result.data.order_id);
        console.log('Stored Payment Intent ID:', result.data.pi);
        
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
        setErrorMessage(`เกิดข้อผิดพลาดในการชำระเงิน: ${error.message}`);
      } else {
        console.error("Payment processing error:", error);
        setErrorMessage("เกิดข้อผิดพลาดในการชำระเงิน");
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
   const [points, setPoints] = useState<number>(0);
  const addPoints = async () => {
    const calculated = calculatePoints();
    setPoints(calculated);
    
    // Only add points if member exists and points are positive
    if (!currentMember?.id || calculated <= 0) {
      console.log('No member selected or no points to add');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/customer/add-point/${currentMember.id}`, {
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
  const verifyPayment = async () => {
    if (!orderId || !paymentIntentId) {
      setErrorMessage('ไม่พบข้อมูลการสั่งซื้อหรือข้อมูลการชำระเงิน');
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 5000);
      return;
    }

    setIsVerifyingPayment(true);
    
    try {
      console.log('Verifying payment with order_id:', orderId, 'pi:', paymentIntentId);

      const response = await fetch('http://localhost:5000/payment/check', {
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
        if(currentMember){
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">ระบบขายหน้าร้าน (POS)</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Search & List */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหาสินค้า (ชื่อ, แบรนด์, บาร์โค้ด)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.product_id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => addToCart(product)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm text-gray-800 truncate">
                      {product.product_name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      คงเหลือ: {product.stock}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{product.brand}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">
                      ฿{product.price?.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500">{product.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart & Payment */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <ShoppingCart className="mr-2" />
              รายการสินค้า
            </h2>

            {/* Member Section */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              {currentMember ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User size={20} className="text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">{currentMember.name}</p>
                      <p className="text-xs text-gray-600">
                        <Star size={12} className="inline mr-1" />
                        {currentMember.points} แต้ม | {currentMember.level}
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
                  className="w-full flex items-center justify-center space-x-2 py-2 border-2 border-dashed border-gray-300 hover:border-blue-400 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <User size={20} />
                  <span>เพิ่มสมาชิก</span>
                </button>
              )}
            </div>

            <div className="mb-4 max-h-64 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">ไม่มีสินค้าในรายการ</p>
              ) : (
                cart.map((item) => (
                  <div key={item.product_id} className="border-b border-gray-200 py-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{item.product_name}</h4>
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
                        <span className="font-medium">{item.quantity}</span>
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
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between items-center text-xl font-bold mb-2">
                    <span>รวม:</span>
                    <span className="text-green-600">฿{getTotalAmount().toFixed(2)}</span>
                  </div>
                  
                  {/* Points Section */}
                  {currentMember && (
                    <div className="flex justify-between items-center text-sm text-blue-600 mb-2">
                      <span className="flex items-center">
                        <Star size={16} className="mr-1" />
                        แต้มที่จะได้รับ:
                      </span>
                      <span className="font-medium">+{calculatePoints()} แต้ม</span>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="mb-4">
                  <h3 className="font-medium mb-2">วิธีการชำระเงิน</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSelectedPayment("cash")}
                      className={`p-2 rounded text-sm flex flex-col items-center ${
                        selectedPayment === "cash"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      <Banknote size={20} />
                      <span>เงินสด</span>
                    </button>
                    <button
                      onClick={() => setSelectedPayment("promptpay")}
                      className={`p-2 rounded text-sm flex flex-col items-center ${
                        selectedPayment === "promptpay"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      <QrCode size={20} />
                      <span>จ่ายด้วย QR</span>
                    </button>
                  </div>
                </div>

                {selectedPayment === "cash" && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      จำนวนเงินที่รับ
                    </label>
                    <input
                      type="number"
                      value={customerPaid}
                      onChange={(e) => setCustomerPaid(e.target.value)}
                      placeholder="0.00"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {customerPaid && getChange() >= 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        เงินทอน: ฿{getChange().toFixed(2)}
                      </p>
                    )}
                    {customerPaid && getChange() < 0 && (
                      <p className="text-sm text-red-600 mt-1">
                        เงินไม่เพียงพอ
                      </p>
                    )}
                  </div>
                )}

                <button
                  onClick={qrSentToDisplay && selectedPayment === "promptpay" ? verifyPayment : processPayment}
                  disabled={!canProcessPayment() || isProcessing || (qrSentToDisplay && isVerifyingPayment)}
                  className={`w-full py-3 rounded-lg font-medium ${
                    qrSentToDisplay && selectedPayment === "promptpay"
                      ? isVerifyingPayment
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                      : canProcessPayment() && !isProcessing
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {qrSentToDisplay && selectedPayment === "promptpay"
                    ? isVerifyingPayment
                      ? "Verifying..."
                      : "Verify Payment"
                    : isProcessing
                    ? "กำลังประมวลผล..."
                    : "ชำระเงิน"
                  }
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Member Search Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 backdrop-blur-xl flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4 border border-blue-300 shadow-lg overflow-y-auto" style={{ maxHeight: '90vh' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center">
                <User className="mr-2" />
                {memberModalMode === 'search' ? 'Search Member' : 'Add New Member'}
              </h3>
              <button
                onClick={() => {
                  setShowMemberModal(false);
                  setMemberModalMode('search');
                  setNewMemberData({ name: '', phone: '', email: '', address: '' });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Mode Toggle */}
            <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setMemberModalMode('search')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  memberModalMode === 'search'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Search Member
              </button>
              <button
                onClick={() => setMemberModalMode('add')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  memberModalMode === 'add'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Add New Member
              </button>
            </div>

            {memberModalMode === 'search' ? (
              // Search Member Mode
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={memberPhone}
                    onChange={(e) => setMemberPhone(e.target.value)}
                    placeholder="Enter phone number..."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={10}
                  />
                </div>

                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => searchMember(memberPhone)}
                    disabled={!memberPhone || memberSearching}
                    className={`flex-1 py-2 rounded-lg font-medium ${
                      memberPhone && !memberSearching
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {memberSearching ? "Searching..." : "Search"}
                  </button>
                  <button
                    onClick={() => {
                      setShowMemberModal(false);
                      setMemberPhone("");
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>

                {/* Quick Member Selection */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">Quick Access Customers:</p>
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
                        className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded text-sm"
                      >
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-gray-600">{customer.phone_number}</div>
                      </button>
                    )) : (
                      <p className="text-sm text-gray-500 text-center py-2">No customers found</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              // Add New Member Mode
              <>
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newMemberData.name}
                      onChange={(e) => setNewMemberData({...newMemberData, name: e.target.value})}
                      placeholder="Enter full name"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={newMemberData.phone}
                      onChange={(e) => setNewMemberData({...newMemberData, phone: e.target.value})}
                      placeholder="08X-XXX-XXXX"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={10}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newMemberData.email}
                      onChange={(e) => setNewMemberData({...newMemberData, email: e.target.value})}
                      placeholder="example@email.com"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Address
                    </label>
                    <textarea
                      value={newMemberData.address}
                      onChange={(e) => setNewMemberData({...newMemberData, address: e.target.value})}
                      placeholder="Enter address"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={addNewMember}
                    disabled={!newMemberData.name || !newMemberData.phone || memberSearching}
                    className={`flex-1 py-2 rounded-lg font-medium ${
                      newMemberData.name && newMemberData.phone && !memberSearching
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {memberSearching ? "Adding Member..." : "Add Member"}
                  </button>
                  <button
                    onClick={() => {
                      setShowMemberModal(false);
                      setMemberModalMode('search');
                      setNewMemberData({ name: '', phone: '', email: '', address: '' });
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Note:</strong> New members will start at Bronze level with 0 points
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
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">ใบเสร็จรับเงิน</h3>
              <button
                onClick={() => setShowReceipt(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="text-center mb-4">
              <h4 className="font-bold">ร้านขายยา PharmaC</h4>
              <p className="text-sm text-gray-600">เลขที่: {receiptData.id}</p>
              <p className="text-sm text-gray-600">{receiptData.date}</p>
            </div>

            {/* Member Info in Receipt */}
            {receiptData.member && (
              <div className="border-t border-b border-gray-200 py-3 mb-4">
                <div className="flex items-center justify-center space-x-2">
                  <User size={16} />
                  <span className="font-medium">สมาชิก: {receiptData.member.name}</span>
                </div>
                <p className="text-center text-sm text-gray-600">
                  {receiptData.member.phone} | {receiptData.member.level}
                </p>
              </div>
            )}

            <div className="border-t border-b border-gray-200 py-4 mb-4">
              {receiptData.items.map((item: CartItem) => (
                <div key={item.product_id} className="flex justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{item.product_name}</p>
                    <p className="text-xs text-gray-600">
                      {item.quantity} x ฿{item.price?.toFixed(2)}
                    </p>
                  </div>
                  <span className="font-medium">฿{item.total.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>รวม:</span>
                <span className="font-bold">฿{receiptData.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>รับเงิน:</span>
                <span>฿{receiptData.amountPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>เงินทอน:</span>
                <span>฿{receiptData.change.toFixed(2)}</span>
              </div>
              
              {/* Points Earned */}
              {receiptData.member && receiptData.pointsEarned > 0 && (
                <div className="flex justify-between text-blue-600 font-medium">
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
                onClick={() => setShowReceipt(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg"
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
              <div className="text-left bg-gray-50 p-3 rounded-lg mb-4">
                <p className="text-sm font-medium mb-2">รายการสินค้า:</p>
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm mb-1">
                    <span>{item.product_name} x{item.quantity}</span>
                    <span>฿{item.total.toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>รวมทั้งหมด:</span>
                    <span>฿{getTotalAmount().toFixed(2)}</span>
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
                {qrSentToDisplay ? 'ตรวจสอบการชำระเงิน' : 'ยืนยันการชำระเงินด้วย QR Code'}
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
                    QR Code ถูกส่งไปยังหน้าจอลูกค้าแล้ว - รอการชำระเงิน
                  </span>
                </div>
              </div>
            )}
            
            <div className="mb-6">
              <h4 className="font-bold mb-4">รายการสินค้า</h4>
              
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
                    <span className="text-sm font-medium">สมาชิก: {currentMember.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Star size={14} className="text-yellow-500" />
                    <span className="text-xs text-gray-600">
                      จะได้รับ +{Math.floor(getTotalAmount() / 10)} แต้ม
                    </span>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">ยอดรวมทั้งหมด:</span>
                  <span className="text-xl font-bold text-green-600">
                    ฿{getTotalAmount().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowQRConfirmModal(false);
                  setQrSentToDisplay(false);
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg font-medium"
              >
                ยกเลิก
              </button>
              
              {!qrSentToDisplay ? (
                <button
                  onClick={confirmQRPayment}
                  disabled={isProcessing}
                  className={`flex-2 py-3 rounded-lg font-medium ${
                    isProcessing
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                  style={{ flex: 2 }}
                >
                  {isProcessing ? "กำลังส่ง QR Code..." : "ส่ง QR Code ไปหน้าจอลูกค้า"}
                </button>
              ) : (
                <button
                  onClick={() => {
                    verifyStatus();
                  }}
                  className="flex-2 bg-blue-600 hover:bg-blue-700  text-white py-3 rounded-lg font-medium"
                  style={{ flex: 2 }}
                >
                  ตรวจสอบการชำระเงิน
                </button>
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
              <p className="font-medium">QR Code ส่งสำเร็จ!</p>
              <p className="text-sm text-green-100">ส่งไปยังหน้าจอลูกค้าแล้ว</p>
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
              <h3 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-4">การชำระเงินเสร็จสมบูรณ์แล้ว</p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-semibold">#{orderId}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-semibold text-green-600">฿{getTotalAmount().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-semibold">PromptPay QR</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
              >
                Print Receipt
              </button>
              <button
                onClick={() => {
                  // Reset all states and prepare for new transaction
                  setShowPaymentSuccessModal(false);
                  setShowQRConfirmModal(false);
                  setCart([]);
                  setQrSentToDisplay(false);
                  setOrderId(null);
                  setPaymentIntentId(null);
                  setQrPaymentStatus('pending');
                  setQrCodeData(null);
                  setSelectedPayment('cash');
                  
                  // Refresh notifications to show latest orders
                  if ((window as any).refreshNotifications) {
                    (window as any).refreshNotifications();
                  }
                  
                  window.location.reload();
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium"
              >
                New Transaction
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
              <h3 className="text-2xl font-bold text-yellow-600 mb-2">Action Required!</h3>
              <p className="text-gray-600 mb-4">การชำระเงินต้องการการดำเนินการเพิ่มเติม</p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-semibold">#{orderId}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-semibold text-yellow-600">฿{getTotalAmount().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-yellow-600">Requires Action</span>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-700">
                  ลูกค้าจำเป็นต้องดำเนินการเพิ่มเติมในการชำระเงิน กรุณาติดต่อลูกค้าหรือลองตรวจสอบการชำระเงินอีกครั้ง
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
                Close
              </button>
              <button
                onClick={() => {
                  setShowRequiresActionModal(false);
                  verifyStatus(); // Check again
                }}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-medium"
              >
                Check Again
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
              <p className="font-medium">เกิดข้อผิดพลาด</p>
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
