import { useEffect, useState } from "react";
import thaiBahtText from 'thai-baht-text';
import { Printer, Download } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const PurchaseOrderDocument = () => {
  const location = useLocation();
  const [userID, setUserID] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  // Type definitions
  type OrderItem = {
    id: number;
    name: string;
    brand: string;
    amount: number;
    unit: string;
    price: number;
    image: string;
  };

  type TransformedOrderItem = {
    id: number; 
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    amount: number;
  };

  // Get data from navigation state or sessionStorage fallback
  const { selectedItems, supplierDetails, signatures } = location.state || {};

  // Fallback: try to get from sessionStorage if navigation state is empty
  const getDataFromStorage = () => {
    try {
      const stored = sessionStorage.getItem('podoc_payload');
      const parsed = stored ? JSON.parse(stored) : null;
      console.log('Data from sessionStorage:', parsed);
      return parsed;
    } catch {
      return null;
    }
  };

  // Type definition for signature data
  type SignatureFromDB = {
    id: number; 
    signature_image: string;
    signer_name: string;
    signed_at: string;
  };

  // Type definition for user info from /api/me
  type UserInfo = {
    id: number;
    firstname?: string;
    lastname?: string;
    email?: string;
    employee_id?: string;
  };

  // State for signature data from database
  const [dbSignatureData, setDbSignatureData] = useState<SignatureFromDB | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null); // Add typed state for user info
  
  // Function to fetch latest signature from database for current user
  const fetchLatestSignature = async () => {
    try {
      const token = localStorage.getItem('token'); // Get JWT token
      
      const response = await fetch('http://localhost:5000/signature/latest', {
        method: 'GET',
        credentials: 'include',
        headers: {  
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Latest signature from database:', result.data);
        setDbSignatureData(result.data);
        return result.data;
      } else {
        console.log('No signature found in database');
        return null;
      }
    } catch (error) {
      console.error('Error fetching signature from database:', error);
      return null;
    }
  };

  const fallbackData = getDataFromStorage();
  const items = selectedItems || fallbackData?.items || [];
  const supplier = supplierDetails || fallbackData?.supplierDetails || {};
  
  // Use database signature if available, otherwise use local signature data
  const localSignatures = signatures || fallbackData?.signatures || { purchaser: null };
  
  console.log('DB Signature from state:', dbSignatureData);
  console.log('Local Signatures:', localSignatures);
  console.log('User Info:', userInfo);
  
  // Get signer name from logged-in user info
  let signerName = 'Unknown Signer';
  if (userInfo) {
    if (userInfo.firstname && userInfo.lastname) {
      signerName = `${userInfo.firstname} ${userInfo.lastname}`;
    } else if (userInfo.firstname) {
      signerName = userInfo.firstname;
    } else if (userInfo.email) {
      signerName = userInfo.email;
    }
  }
  
  // Prioritize POForm signature over database signature for display
  const signatureData = {
    purchaser: localSignatures.purchaser || dbSignatureData?.signature_image, // Use POForm signature first
    signerName: signerName, // Always use logged-in user name
    signedAt: localSignatures.purchaser ? 
      new Date() : // Use current time for new signatures
      (dbSignatureData?.signed_at ? 
        new Date(dbSignatureData.signed_at) : // Parse database date properly
        null
      )
  };
  
  console.log('Final signature data:', signatureData);
  
  // Debug date formatting
  if (signatureData.signedAt) {
    console.log('📅 Date debugging:', {
      rawDate: signatureData.signedAt,
      iso: signatureData.signedAt.toISOString(),
      localString: signatureData.signedAt.toLocaleDateString(),
      thaiFormat: signatureData.signedAt.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }),
      source: localSignatures.purchaser ? 'POForm (new Date())' : 'Database'
    });
  }

  // Transform selected items to order data format
  const transformedItems: TransformedOrderItem[] = items.map((item: OrderItem, index: number) => ({
    id: index + 1,
    description: item.name || "Unknown Product",
    quantity: item.amount || 0,
    unitPrice: item.price || 0,
    discount: 0.0,
    amount: (item.amount || 0) * (item.price || 0),
  }));
  const [documentCount, setDocumentCount] = useState(0);
  // Calculate totals
  const subtotal = transformedItems.reduce((sum, item) => sum + item.amount, 0);
  const specialDiscount = 0.0;
  const afterDiscount = subtotal - specialDiscount;
  const vat = 0.0;
  const total = afterDiscount + vat;

  // Create order data dynamically with updated document count
  const orderData = {
    orderNumber: `A${String(documentCount + 1).padStart(6, '0')}`,
    issueDate: supplier.issueDate || new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }),
    supplier: supplier.supplier || "No Supplier Specified",
    contactName: supplier.contactName || "No Contact Name",
    taxId: supplier.taxId || "No Tax ID",
    address: supplier.address || "No Address",
    preparedBy: supplier.preparedBy || "No Prepared By",
    items: transformedItems,
    subtotal: subtotal,
    specialDiscount: specialDiscount,
    afterDiscount: afterDiscount,
    vat: vat,
    total: total,
  };

  // using `thai-baht-text` package for baht text conversion

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // This would typically trigger a PDF download
    alert("Download functionality would be implemented here");
  };


  const countDoc = async () => {
    try {
      const response = await fetch('http://localhost:5000/purchase/count', {
        method: 'GET',
        credentials: 'include'
      });
      const count = await response.json();

      setDocumentCount(count.data);
    } catch (error) {
      console.error('Error fetching document count:', error);
    }
  }

  // Function to save signature to database
  const saveSignatureToDatabase = async () => {
    // Check if we already have signature data from database
    if (fallbackData?.signatureFromDB) {
      console.log('Using existing signature from database:', fallbackData.signatureFromDB);
      return fallbackData.signatureFromDB;
    }

    // Use original signature data from navigation state or local storage
    const originalSignatures = signatures || fallbackData?.signatures;
    const localSignatureData = originalSignatures?.purchaser;
    
    console.log('Original signatures:', originalSignatures);
    console.log('Local signature data:', localSignatureData);
    
    if (!localSignatureData) {
      throw new Error('No signature data found');
    }

    try {
      // Convert data URL to blob
      const response = await fetch(localSignatureData);
      const blob = await response.blob();
      
      // Create FormData to send the signature image
      const formData = new FormData();
      formData.append('signature', blob, `signature_${Date.now()}.png`);
      
      // Save signature to database
      const signatureResponse = await fetch('http://localhost:5000/signature/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!signatureResponse.ok) {
        throw new Error('Failed to save signature');
      }

      const signatureResult = await signatureResponse.json();
      console.log('Signature saved successfully:', signatureResult);
      
      return signatureResult.data; // Return signature data including ID
    } catch (error) {
      console.error('Error saving signature:', error);
      throw error;
    }
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      let savedSignature = null;
      
      // Check if we have any signature data (original signatures from POForm)
      const originalSignatures = signatures || fallbackData?.signatures;
      const hasSignature = originalSignatures?.purchaser || fallbackData?.signatureFromDB;
      
      console.log('Original signatures from POForm:', originalSignatures);
      console.log('Has signature to process:', !!hasSignature);
      
      if (hasSignature) {
        console.log('Processing signature...');
        savedSignature = await saveSignatureToDatabase();
        console.log('Saved signature result:', savedSignature);
      } else {
        console.log('No signature data found to save');
      }

      // เก็บ payload ให้ backend เข้าถึงได้ (Puppeteer จะเข้าไปอ่าน sessionStorage)
      const payloadData = {
        items: orderData.items,
        supplierDetails: supplier,
        signatures: signatureData,
        total: orderData.total,
        // Include saved signature if available
        signatureFromDB: savedSignature
      };
      
      sessionStorage.setItem('podoc_payload', JSON.stringify(payloadData));
      console.log('Updated sessionStorage with saved signature:', payloadData);

      // Log the request data for debugging
      const requestData = {
        userID: userID,
        description: `Purchase Order ${orderData.orderNumber}`,
        frontendURL: window.location.href, 
        issueDate: orderData.issueDate,
        preparedBy: orderData.preparedBy,
        signatureId: savedSignature?.id, // Include signature ID for reference
        // Send the data that should appear in the PDF
        podocData: {
          supplierDetails: {
            supplier: orderData.supplier,
            contactName: orderData.contactName,
            taxId: orderData.taxId,
            address: orderData.address,
            issueDate: orderData.issueDate,
            preparedBy: orderData.preparedBy,
            businessLogo: supplier.businessLogo, // Include the uploaded image
          },
          items: items,
          total: orderData.total,
          signature: savedSignature // Include signature info in PDF data
        }
      };
      
      console.log('PDF Request Data:', requestData);

      // ส่ง request ไป backend ให้ Puppeteer generate PDF
      const response = await fetch('http://localhost:5000/purchase/pdf', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      if (data?.success) {
        // Show success animation for 2 seconds before navigating
        setIsProcessing(false);
        setShowSuccess(true);
        
        setTimeout(() => {
          // Clear sessionStorage and navigate to doc-record
          sessionStorage.removeItem('podoc_payload');
          navigate('/doc-record');
        }, 2000);
      } else {
        setIsProcessing(false);
        console.warn('Failed to save PDF on server', data);
      }
    } catch (error) {
      setIsProcessing(false);
      console.error('Error creating PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert('เกิดข้อผิดพลาดในการบันทึกเอกสาร: ' + errorMessage);
    }
  };


  const checkme = async () => {
    try {
      const authme = await fetch('http://localhost:5000/api/me', {
        method: 'GET',
        credentials: 'include'
      })
      const data = await authme.json();
      setUserID(data.user.id);
      setUserInfo(data.user); // Store user info for signature name
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
    countDoc()
    fetchLatestSignature() // Fetch signature from database
    
    // Console log the data being used in PODoc
    console.log('PODoc received data:', {
      selectedItems: items,
      supplierDetails: supplier,
      transformedItems,
      orderData,
      signatureData: signatureData
    });
    
    // Check if signatureFromDB is available
    if (fallbackData?.signatureFromDB) {
      console.log('Found signature from database:', fallbackData.signatureFromDB);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    // Print and Save to local
    <div>
      {/* Loading Processing Modal */}
      {(isProcessing || showSuccess) && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 shadow-2xl">
            <div className="text-center">
              {isProcessing && (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800 mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Creating a PDF files</h3>
                  <p className="text-gray-600 text-sm">Please wait...</p>
                </>
              )}
              {showSuccess && (
                <>
                  <div className="rounded-full h-12 w-12 bg-green-100 mx-auto mb-4 flex items-center justify-center animate-bounce">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">PDF Created Successfully!</h3>
                  <p className="text-gray-600 text-sm">Navigating to document page...</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-end gap-2 p-4 no-print">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          <Download size={16} />
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          <Printer size={16} />
        </button>
      </div>

      {/* Document Content */}
      <div className="print-container">
        <div className="mx-auto bg-white min-h-screen printable-content">
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                {supplier.businessLogo ? (
                  <div className="flex items-center justify-center">
                    <img src={supplier.businessLogo} alt="Supplier Logo" className="w-50 h-25 object-contain" />
                  </div>
                ) : null}
              </div>
              <div className="text-right text-sm text-gray-600">
                <div>PharmaC</div>
                <div>
                  123-45 ก่อนใหญ่กับ นครขอนแก่น เมืองก่อนง ก่อนขันมาก เวลาโล
                  ดิติง
                </div>
                <div>02-555-5555 pharmac@gmail.com</div>
              </div>
            </div>

            {/* Purchase Order Title */}
            <div className="flex justify-end w-full">
              <div className="flex items-stretch mb-6">
                {/* Left Section - Black Background */}
                <div className="bg-black text-white px-8 py-4 flex items-center justify-center min-w-[200px] rounded-tl-xl ">
                  <div className="text-center">
                    <div className="text-lg font-bold leading-tight">
                      Purchase Order
                    </div>
                    <div className="text-sm mt-1">ใบสั่งซื้อ</div>
                  </div>
                </div>

                {/* Right Section - White Background with Border */}
                <div className="border border-l-0 border-gray-400 bg-white px-6 py-4 flex flex-col justify-center min-w-[150px]">
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">
                      ต้นฉบับ / Original
                    </div>
                    <div className="text-xl font-bold text-gray-800">
                      A{String(documentCount + 1).padStart(6, '0')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Supplier and Order Information */}
            <div className="grid grid-cols-2  mb-6">
              <div className="space-y-4 p-2 border border-gray-300">
                <div style={{ display: "flex", alignItems: "baseline" }}>
                  <div style={{ marginRight: "10px" }}>
                    <strong>ผู้จัดจำหน่าย</strong>
                    <div className="text-xs">
                      <strong>(Contact Name)</strong>
                    </div>
                  </div>
                  <div>{orderData.contactName}</div>
                </div>

                <div style={{ display: "flex", alignItems: "baseline" }}>
                  <div style={{ marginRight: "10px" }}>
                    <strong>เลขประจำตัวผู้เสียภาษี</strong>
                    <div className="text-xs">
                      <strong>(Tax ID)</strong>
                    </div>
                  </div>
                  <div> {orderData.taxId}</div>
                </div>

                <div style={{ display: "flex", alignItems: "baseline" }}>
                  <div style={{ marginRight: "10px" }}>
                    <strong>ที่อยู่</strong>
                    <div className="text-xs">
                      <strong>(Address)</strong>
                    </div>
                  </div>
                  <div> {orderData.address}</div>
                </div>
              </div>
              <div className="space-y-4 p-2 border border-gray-300">
                <div style={{ display: "flex", alignItems: "baseline" }}>
                  <div style={{ marginRight: "10px" }}>
                    <strong>ผู้จัดหา</strong>
                    <div className="text-xs">
                      <strong>(Supplier)</strong>
                    </div>
                  </div>
                  <div> {orderData.supplier}</div>
                </div>
                <div style={{ display: "flex", alignItems: "baseline" }}>
                  <div style={{ marginRight: "10px" }}>
                    <strong>วันที่</strong>
                    <div className="text-xs">
                      <strong>(Issue Date)</strong>
                    </div>
                  </div>
                  <div> {orderData.issueDate}</div>
                </div>

                <div style={{ display: "flex", alignItems: "baseline" }}>
                  <div style={{ marginRight: "10px" }}>
                    <strong>ผู้จัดทำ</strong>
                    <div className="text-xs">
                      <strong>(Prepared By)</strong>
                    </div>
                  </div>
                  <div> {orderData.preparedBy}</div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="table-wrapper mb-6">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-black text-white">
                    <th className="border border-gray-300 p-2 text-left">
                      ลำดับ
                      <br />
                      No
                    </th>
                    <th className="border border-gray-300 p-2 text-left">
                      รายการ
                      <br />
                      Description
                    </th>
                    <th className="border border-gray-300 p-2 text-center">
                      จำนวน
                      <br />
                      Quantity
                    </th>
                    <th className="border border-gray-300 p-2 text-center">
                      ราคาต่อหน่วย
                      <br />
                      Unit Price
                    </th>
                    <th className="border border-gray-300 p-2 text-center">
                      ส่วนลด
                      <br />
                      Discount
                    </th>
                    <th className="border border-gray-300 p-2 text-center">
                      จำนวนเงิน (บาท)
                      <br />
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orderData.items.map((item) => (
                    <tr key={item.id}>
                      <td className="border border-gray-300 p-2 text-center">
                        {item.id}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {item.description}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {item.quantity}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {item.unitPrice.toFixed(2)}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {item.discount.toFixed(2)}
                      </td>
                      <td className="border border-gray-300 p-2 text-right">
                        {item.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Comments and Totals */}
            <div className="grid grid-cols-2 gap-10 mb-6">
              <div>
                <div className="font-bold mb-2">Comments</div>
                <div className="border border-gray-300 h-24 p-2"></div>
                <div className="flex justify-between items-start bg-gray-100 px-4 py-2 text-sm">
                  <div>
                    <div className="font-semibold">จำนวนเงิน</div>
                    <div>Amount</div>
                  </div>
                  <div className="text-xl pt-1 pr-2">
                    {typeof thaiBahtText === 'function' ? thaiBahtText(orderData.total) : ''}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    รวมเป็นเงิน
                    <br />
                    Subtotal
                  </div>
                  <div className="text-right bg-gray-100 p-2">
                    {orderData.subtotal.toFixed(2)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    ค่าส่วนลดพิเศษ
                    <br />
                    Special Discount
                  </div>
                  <div className="text-right bg-gray-100 p-2">
                    {orderData.specialDiscount.toFixed(2)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    ยอดคงเหลือหลังหักส่วนลด
                    <br />
                    After Discount
                  </div>
                  <div className="text-right bg-gray-100 p-2">
                    {orderData.afterDiscount.toFixed(2)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    ภาษีมูลค่าเพิ่ม เปอร์เซ็นต์ 7 %<br />
                    Value added Tax
                  </div>
                  <div className="text-right bg-gray-100 p-2">
                    {orderData.vat.toFixed(2)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 font-bold">
                  <div>
                    ค่าสินค้าและบริการรวม
                    <br />
                    Total
                  </div>
                  <div className="text-right bg-black text-white p-2">
                    {orderData.total.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Section */}
            <div className="print-footer  mx-auto bg-white" >
              <div className="border border-gray-400">
                <div className="grid grid-cols-2 h-50">
                  {/* Left Column - Purchaser */}
                  <div className="border-r border-gray-400 p-6 flex flex-col justify-end">
                    <div className="border-b border-gray-400 mb-3 pb-2">
                      {signatureData.purchaser ? (
                        <div className="h-16 flex items-center justify-center">
                          <img 
                            src={signatureData.purchaser} 
                            alt="Purchaser Signature" 
                            className="max-h-full max-w-full object-contain"
                            onLoad={() => console.log('Signature image loaded successfully:', signatureData.purchaser)}
                            onError={(e) => {
                              console.error('Failed to load signature image:', signatureData.purchaser);
                              console.error('Image error:', e);
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-16">
                          {/* No signature to display */}
                        </div>
                      )}
                    </div>
                    <div className="text-center text-sm">
                      <div className="mb-1">ผู้ซื้อ / Purchaser</div>
                      <div>
                        วันที่ / Date: {signatureData.signedAt ? 
                          signatureData.signedAt.toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: '2-digit', 
                            day: '2-digit'
                          }) : 
                          (signatureData.purchaser ? 
                            new Date().toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit'
                            }) : 
                            '................................................'
                          )
                        }
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Empty for Supplier (to be signed later) */}
                  <div className="p-6 flex flex-col justify-end">
                    <div className="border-b border-gray-400 mb-3 pb-2">
                      <div className="h-16"></div> {/* Empty space for supplier signature */}
                    </div>
                    <div className="text-center text-sm">
                      <div className="mb-1">
                        ผู้ขาย / Supplier
                      </div>
                      <div>
                        วันที่ / Date: ................................................
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="  bg-black text-white text-center py-4 px-6 rounded-b-2xl">
                <div className="text-lg font-semibold mb-1">PharmaC</div>
                <div className="text-sm">
                  123/45 ถนนนิมิต ตำบลนิมิต เขตปทุม แขวงอาคารบิน จังหวัดนนทบุรี
                  10555 โทรศัพท์ 095-555-5555 อีเมล lookatme@gmail.com
                </div>
              </div>
            </div>

          </div>
        </div>
        <div className="mt-12 flex justify-center w-full">
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className={`p-6 rounded-xl font-bold transition-colors duration-200 ${
              isProcessing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-800 hover:bg-green-900'
            } text-white`}
            style={{ width: '500px' }}
          >
            {isProcessing ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderDocument;
