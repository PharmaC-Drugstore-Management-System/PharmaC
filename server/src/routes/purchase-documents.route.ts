import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';

const router = Router();

// Mock database - ในการใช้งานจริงจะต้องใช้ database จริง
let purchaseDocuments = [
  {
    id: 1,
    orderNumber: 'A000001',
    fileName: 'PO_A000001_Supplier1.pdf',
    issueDate: '2024-09-10',
    supplierName: 'บริษัท ยาดี จำกัด',
    createdBy: 'นาย สมชาย ใจดี',
    createdById: 1,
    signerName: 'นาย สมชาย ใจดี',
    itemCount: 5,
    totalAmount: 15000,
    filePath: '/uploads/po/PO_A000001.pdf',
    createdAt: '2024-09-10T08:30:00Z',
    updatedAt: '2024-09-10T08:30:00Z'
  },
  {
    id: 2,
    orderNumber: 'A000002',
    fileName: 'PO_A000002_Supplier2.pdf',
    issueDate: '2024-09-11',
    supplierName: 'บริษัท เภสัชภัณฑ์ ดีเยี่ยม จำกัด',
    createdBy: 'นางสาว สุดใส สวยงาม',
    createdById: 2,
    signerName: 'นางสาว สุดใส สวยงาม',
    itemCount: 8,
    totalAmount: 32500,
    filePath: '/uploads/po/PO_A000002.pdf',
    createdAt: '2024-09-11T10:15:00Z',
    updatedAt: '2024-09-11T10:15:00Z'
  },
  {
    id: 3,
    orderNumber: 'A000003',
    fileName: 'PO_A000003_Supplier1.pdf',
    issueDate: '2024-09-12',
    supplierName: 'บริษัท ยาดี จำกัด',
    createdBy: 'นาย ประเสริฐ มั่นคง',
    createdById: 3,
    signerName: 'นาย ประเสริฐ มั่นคง',
    itemCount: 12,
    totalAmount: 48750,
    filePath: '/uploads/po/PO_A000003.pdf',
    createdAt: '2024-09-12T14:20:00Z',
    updatedAt: '2024-09-12T14:20:00Z'
  }
];

// GET /purchase/documents - Get all purchase order documents
router.get('/documents', async (req, res) => {
  try {
    // ในการใช้งานจริง จะต้อง query จาก database
    // const documents = await PurchaseDocument.findAll({
    //   include: [
    //     { model: User, as: 'creator', attributes: ['id', 'firstname', 'lastname'] },
    //     { model: Supplier, attributes: ['name'] }
    //   ],
    //   order: [['createdAt', 'DESC']]
    // });

    res.json({
      success: true,
      data: purchaseDocuments
    });
  } catch (error) {
    console.error('Error fetching purchase documents:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลเอกสาร'
    });
  }
});

// GET /purchase/documents/:id - Get single document
router.get('/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const document = purchaseDocuments.find(doc => doc.id === parseInt(id));
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบเอกสาร'
      });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลเอกสาร'
    });
  }
});

// GET /purchase/download/:id - Download single document
router.get('/download/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const document = purchaseDocuments.find(doc => doc.id === parseInt(id));
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบเอกสาร'
      });
    }

    const filePath = path.join(process.cwd(), 'uploads', 'po', `PO_${document.orderNumber}.pdf`);
    
    // ตรวจสอบว่าไฟล์มีอยู่จริง
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบไฟล์เอกสาร'
      });
    }

    res.download(filePath, document.fileName);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดาวน์โหลดเอกสาร'
    });
  }
});

// POST /purchase/bulk-download - Bulk download documents
router.post('/bulk-download', async (req, res) => {
  try {
    const { documentIds } = req.body;
    
    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุเอกสารที่ต้องการดาวน์โหลด'
      });
    }

    const documents = purchaseDocuments.filter(doc => documentIds.includes(doc.id));
    
    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบเอกสารที่ระบุ'
      });
    }

    // สร้างไฟล์ ZIP
    const archive = archiver('zip', { zlib: { level: 9 } });
    const fileName = `PO_Documents_${new Date().toISOString().split('T')[0]}.zip`;

    res.attachment(fileName);
    archive.pipe(res);

    // เพิ่มไฟล์เข้า ZIP
    for (const document of documents) {
      const filePath = path.join(process.cwd(), 'uploads', 'po', `PO_${document.orderNumber}.pdf`);
      
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: document.fileName });
      }
    }

    await archive.finalize();
  } catch (error) {
    console.error('Error bulk downloading documents:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดาวน์โหลดเอกสาร'
    });
  }
});

// DELETE /purchase/bulk-delete - Bulk delete documents
router.delete('/bulk-delete', async (req, res) => {
  try {
    const { documentIds } = req.body;
    
    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุเอกสารที่ต้องการลบ'
      });
    }

    // ลบไฟล์ออกจากระบบ
    const documentsToDelete = purchaseDocuments.filter(doc => documentIds.includes(doc.id));
    
    for (const document of documentsToDelete) {
      const filePath = path.join(process.cwd(), 'uploads', 'po', `PO_${document.orderNumber}.pdf`);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // ลบจาก mock database
    purchaseDocuments = purchaseDocuments.filter(doc => !documentIds.includes(doc.id));

    res.json({
      success: true,
      message: `ลบเอกสาร ${documentsToDelete.length} รายการเรียบร้อยแล้ว`,
      deletedCount: documentsToDelete.length
    });
  } catch (error) {
    console.error('Error bulk deleting documents:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบเอกสาร'
    });
  }
});

// POST /purchase/bulk-share - Create shareable link for multiple documents
router.post('/bulk-share', async (req, res) => {
  try {
    const { documentIds } = req.body;
    
    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุเอกสารที่ต้องการแชร์'
      });
    }

    const documents = purchaseDocuments.filter(doc => documentIds.includes(doc.id));
    
    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบเอกสารที่ระบุ'
      });
    }

    // สร้าง share token (ในการใช้งานจริงจะเก็บใน database)
    const shareToken = Buffer.from(JSON.stringify({
      documentIds,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 วัน
      createdAt: new Date().toISOString()
    })).toString('base64');

    const shareUrl = `${req.protocol}://${req.get('Host')}/purchase/shared/${shareToken}`;

    res.json({
      success: true,
      shareUrl,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      documentCount: documents.length
    });
  } catch (error) {
    console.error('Error creating share link:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างลิงก์แชร์'
    });
  }
});

// GET /purchase/shared/:token - Access shared documents
router.get('/shared/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Decode token
    const decodedData = JSON.parse(Buffer.from(token, 'base64').toString());
    const { documentIds, expiresAt } = decodedData;

    // ตรวจสอบความถูกต้องของ token
    if (new Date() > new Date(expiresAt)) {
      return res.status(410).json({
        success: false,
        message: 'ลิงก์แชร์หมดอายุแล้ว'
      });
    }

    const documents = purchaseDocuments.filter(doc => documentIds.includes(doc.id));
    
    // ส่งหน้าเว็บสำหรับแสดงเอกสารที่แชร์
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>เอกสาร Purchase Order ที่แชร์</title>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .document { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .download-btn { background: #007bff; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>เอกสาร Purchase Order ที่แชร์</h1>
        <p>จำนวนเอกสาร: ${documents.length} รายการ</p>
        <p>ลิงก์นี้จะหมดอายุในวันที่: ${new Date(expiresAt).toLocaleDateString('th-TH')}</p>
        
        ${documents.map(doc => `
          <div class="document">
            <h3>${doc.orderNumber} - ${doc.fileName}</h3>
            <p>ผู้จัดจำหน่าย: ${doc.supplierName}</p>
            <p>วันที่: ${new Date(doc.issueDate).toLocaleDateString('th-TH')}</p>
            <p>จำนวนเงิน: ${doc.totalAmount.toLocaleString('th-TH')} บาท</p>
            <a href="/purchase/download/${doc.id}" class="download-btn">ดาวน์โหลด</a>
          </div>
        `).join('')}
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error accessing shared documents:', error);
    res.status(400).json({
      success: false,
      message: 'ลิงก์แชร์ไม่ถูกต้อง'
    });
  }
});

// POST /purchase/save - Save new purchase order document
router.post('/save', async (req, res) => {
  try {
    const {
      orderNumber,
      supplierName,
      items,
      totalAmount,
      signatureData,
      supplierDetails
    } = req.body;

    // สร้างเอกสารใหม่
    const newDocument = {
      id: purchaseDocuments.length + 1,
      orderNumber,
      fileName: `PO_${orderNumber}_${supplierName.replace(/\s+/g, '_')}.pdf`,
      issueDate: supplierDetails?.issueDate || new Date().toISOString().split('T')[0],
      supplierName,
      createdBy: 'ผู้ใช้ปัจจุบัน', // จะต้องดึงจาก req.user ในการใช้งานจริง
      createdById: 1, // จะต้องดึงจาก req.user ในการใช้งานจริง
      signerName: signatureData?.signerName || 'ผู้เซ็นไม่ระบุ',
      itemCount: items?.length || 0,
      totalAmount: totalAmount || 0,
      filePath: `/uploads/po/PO_${orderNumber}.pdf`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // เพิ่มเข้า mock database
    purchaseDocuments.push(newDocument);

    res.json({
      success: true,
      message: 'บันทึกเอกสาร Purchase Order เรียบร้อยแล้ว',
      data: newDocument
    });
  } catch (error) {
    console.error('Error saving purchase document:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการบันทึกเอกสาร'
    });
  }
});

export default router;