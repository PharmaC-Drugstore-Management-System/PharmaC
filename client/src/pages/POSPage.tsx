import { useState, useEffect } from "react";
import { Search, Plus, Minus, ShoppingCart, CreditCard, Banknote, Receipt, Trash2, X, User, Star, QrCode } from "lucide-react";
import "../styles/pos.css";

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
  const [selectedPayment, setSelectedPayment] = useState<"cash" | "qrcode" | "transfer">("cash");
  const [customerPaid, setCustomerPaid] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
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

  // Mock price data - you can fetch this from your API
  const productPrices: Record<number, number> = {
    26: 120.00,
    27: 85.50,
    // Add more product prices as needed
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
      // Mock member data - replace with actual API call
      const mockMembers: Member[] = [
        { id: "M001", name: "คุณสมชาย ใจดี", phone: "0812345678", points: 250, level: "Silver" },
        { id: "M002", name: "คุณสมหญิง รักสุขภาพ", phone: "0823456789", points: 150, level: "Bronze" },
        { id: "M003", name: "คุณวิชัย สุขสบาย", phone: "0834567890", points: 450, level: "Gold" },
      ];
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      const member = mockMembers.find(m => m.phone.includes(phone));
      if (member) {
        setCurrentMember(member);
        setShowMemberModal(false);
      } else {
        alert("ไม่พบข้อมูลสมาชิก");
      }
    } catch (error) {
      console.error("Error searching member:", error);
      alert("เกิดข้อผิดพลาดในการค้นหาสมาชิก");
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
      alert('กรุณากรอกชื่อและเบอร์โทรศัพท์');
      return;
    }

    setMemberSearching(true);
    try {
      // สร้างสมาชิกใหม่ (ในอนาคตจะเชื่อมต่อกับ API จริง)
      const newMember: Member = {
        id: `M${Date.now()}`,
        name: newMemberData.name,
        phone: newMemberData.phone,
        points: 0,
        level: 'Bronze'
      };

      await new Promise(resolve => setTimeout(resolve, 1000)); // จำลองการบันทึกข้อมูล

      setCurrentMember(newMember);
      setShowMemberModal(false);
      setNewMemberData({ name: '', phone: '', email: '', address: '' });
      setMemberModalMode('search');
      
      alert(`เพิ่มสมาชิกใหม่สำเร็จ: ${newMember.name}`);
    } catch (error) {
      console.error('Error adding member:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่มสมาชิก');
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
      // Simulate payment processing
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
        };      setReceiptData(receipt);
      setShowReceipt(true);
      setCart([]);
      setCustomerPaid("");
      
    } catch (error) {
      console.error("Payment processing error:", error);
      alert("เกิดข้อผิดพลาดในการชำระเงิน");
    } finally {
      setIsProcessing(false);
    }
  };

  const canProcessPayment = () => {
    const total = getTotalAmount();
    const paid = parseFloat(customerPaid) || 0;
    return cart.length > 0 && (selectedPayment !== "cash" || paid >= total);
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
                      onClick={() => setSelectedPayment("qrcode")}
                      className={`p-2 rounded text-sm flex flex-col items-center ${
                        selectedPayment === "qrcode"
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
                  onClick={processPayment}
                  disabled={!canProcessPayment() || isProcessing}
                  className={`w-full py-3 rounded-lg font-medium ${
                    canProcessPayment() && !isProcessing
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isProcessing ? "กำลังประมวลผล..." : "ชำระเงิน"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Member Search Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center">
                <User className="mr-2" />
                {memberModalMode === 'search' ? 'ค้นหาสมาชิก' : 'เพิ่มสมาชิกใหม่'}
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
                ค้นหาสมาชิก
              </button>
              <button
                onClick={() => setMemberModalMode('add')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  memberModalMode === 'add'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                เพิ่มสมาชิกใหม่
              </button>
            </div>

            {memberModalMode === 'search' ? (
              // Search Member Mode
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="tel"
                    value={memberPhone}
                    onChange={(e) => setMemberPhone(e.target.value)}
                    placeholder="กรอกเบอร์โทรศัพท์..."
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
                    {memberSearching ? "กำลังค้นหา..." : "ค้นหา"}
                  </button>
                  <button
                    onClick={() => {
                      setShowMemberModal(false);
                      setMemberPhone("");
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg"
                  >
                    ยกเลิก
                  </button>
                </div>

                {/* Quick Member Selection */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">สมาชิกตัวอย่าง (Demo):</p>
                  <div className="space-y-2">
                    {[
                      { phone: "0812345678", name: "คุณสมชาย ใจดี" },
                      { phone: "0823456789", name: "คุณสมหญิง รักสุขภาพ" },
                      { phone: "0834567890", name: "คุณวิชัย สุขสบาย" },
                    ].map((member, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setMemberPhone(member.phone);
                          searchMember(member.phone);
                        }}
                        className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded text-sm"
                      >
                        <div className="font-medium">{member.name}</div>
                        <div className="text-gray-600">{member.phone}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              // Add New Member Mode
              <>
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      ชื่อ-นามสกุล <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newMemberData.name}
                      onChange={(e) => setNewMemberData({...newMemberData, name: e.target.value})}
                      placeholder="กรอกชื่อ-นามสกุล"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      เบอร์โทรศัพท์ <span className="text-red-500">*</span>
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
                      อีเมล
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
                      ที่อยู่
                    </label>
                    <textarea
                      value={newMemberData.address}
                      onChange={(e) => setNewMemberData({...newMemberData, address: e.target.value})}
                      placeholder="กรอกที่อยู่"
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
                    {memberSearching ? "กำลังเพิ่มสมาชิก..." : "เพิ่มสมาชิก"}
                  </button>
                  <button
                    onClick={() => {
                      setShowMemberModal(false);
                      setMemberModalMode('search');
                      setNewMemberData({ name: '', phone: '', email: '', address: '' });
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg"
                  >
                    ยกเลิก
                  </button>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 <strong>หมายเหตุ:</strong> สมาชิกใหม่จะเริ่มต้นที่ระดับ Bronze และได้รับ 0 แต้ม
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
    </div>
  );
}
