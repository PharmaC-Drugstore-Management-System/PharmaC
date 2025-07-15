import { useState } from "react";
import { Printer, Download } from "lucide-react";

const PurchaseOrderDocument = () => {
  const [orderData] = useState({
    orderNumber: "A000001",
    issueDate: "12/10/08",
    supplier: "SPR-207: SIAM PHARMACEUTICAL CO.,LTD.",
    contactName: "Samophone",
    taxId: "2050103665259",
    address: "9.99 ซอ 10 ตรวจ 5",
    preparedBy: "Loatlong Zhongguo",
    items: [
      {
        id: 1,
        description: "ATHAULIA-S",
        quantity: 500,
        unitPrice: 83.33,
        discount: 0.0,
        amount: 25000.0,
      },
      {
        id: 2,
        description: "CEMOL 500mg ช่า ญาง 1000 S",
        quantity: 15,
        unitPrice: 45.0,
        discount: 0.0,
        amount: 675.0,
      },
      {
        id: 3,
        description: "A-MOL Para 250mg/5ml 60ml",
        quantity: 150,
        unitPrice: 8.0,
        discount: 0.0,
        amount: 1200.0,
      },
      {
        id: 4,
        description: "BAKAMOL 10 S",
        quantity: 100,
        unitPrice: 5.0,
        discount: 0.0,
        amount: 500.0,
      },
    ],
    subtotal: 27375.0,
    specialDiscount: 0.0,
    afterDiscount: 27375.0,
    vat: 0.0,
    total: 27375.0,
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // This would typically trigger a PDF download
    alert("Download functionality would be implemented here");
  };

  return (
    // Print and Save to local
    <div>
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
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">💊</span>
                </div>
                <h1 className="text-2xl font-bold text-teal-700">PharmaC</h1>
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
                      A000001
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
                  {/* Empty rows for spacing */}
                  {[...Array(10)].map((_, index) => (
                  <tr key={`empty-${index}`}>
                    <td className="border border-gray-300 p-4">&nbsp;</td>
                    <td className="border border-gray-300 p-4">&nbsp;</td>
                    <td className="border border-gray-300 p-4">&nbsp;</td>
                    <td className="border border-gray-300 p-4">&nbsp;</td>
                    <td className="border border-gray-300 p-4">&nbsp;</td>
                    <td className="border border-gray-300 p-4">&nbsp;</td>
                  
                   
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
                    หนึ่งล้านสองหมื่นห้าร้อย
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
                  {/* Left Column - Approver */}
                  <div className="border-r border-gray-400 p-6 flex flex-col justify-end">
                    <div className="border-b border-gray-400 mb-3 pb-2">
                      <div className="h-16"></div> {/* Space for signature */}
                    </div>
                    <div className="text-center text-sm">
                      <div className="mb-1">ผู้ตรวจสอบ / Approver</div>
                      <div>
                        วันที่ / Date
                        ................................................
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Authorized Signature */}
                  <div className="p-6 flex flex-col justify-end">
                    <div className="border-b border-gray-400 mb-3 pb-2">
                      <div className="h-16"></div> {/* Space for signature */}
                    </div>
                    <div className="text-center text-sm">
                      <div className="mb-1">
                        ผู้มีอำนาจลงนาม / Authorized Signature
                      </div>
                      <div>
                        วันที่ / Date
                        ................................................
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
      </div>
    </div>
  );
};

export default PurchaseOrderDocument;
