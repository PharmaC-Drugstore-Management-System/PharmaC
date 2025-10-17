import express from 'express';
import controller from '../controller/purchase.controller.ts'
import { verifyToken } from '../middleware/verifyToken.ts';
import prisma from '../utils/prisma.utils.ts';
import archiver from 'archiver';

const router = express.Router();

// Create new PDF document (requires authentication)
router.post('/pdf', verifyToken, controller.pdf);

// Get PDF file by ID (serves the actual PDF) - requires authentication
router.get('/pdf/:id', controller.getPDF);

// Get list of all PDF documents (metadata only) - requires authentication  
router.get('/pdfs', controller.getAllPDFs);

router.get('/count',controller.getCount)

// POST /purchase/documents/bulk-download - Bulk download documents
router.post('/documents/bulk-download', verifyToken, async (req, res) => {
  try {
    const { documentIds } = req.body;
    
    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุเอกสารที่ต้องการดาวน์โหลด'
      });
    }

    // Get documents from database
    const documents = await prisma.purchase_document.findMany({
      where: {
        purchase_document_id: {
          in: documentIds
        }
      }
    });
    
    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบเอกสารที่ระบุ'
      });
    }

    // Create ZIP file
    const archive = archiver('zip', { zlib: { level: 9 } });
    const fileName = `PO_Documents_${new Date().toISOString().split('T')[0]}.zip`;

    res.attachment(fileName);
    archive.pipe(res);

    // Add files to ZIP
    for (const document of documents) {
      if (document.pdf_file) {
        const pdfBuffer = Buffer.from(document.pdf_file);
        const fileName = document.pdf_filename || `PO_${document.purchase_document_id}.pdf`;
        archive.append(pdfBuffer, { name: fileName });
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

// DELETE /purchase/documents/bulk-delete - Bulk delete documents
router.delete('/documents/bulk-delete', verifyToken, async (req, res) => {
  try {
    const { documentIds } = req.body;
    
    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุเอกสารที่ต้องการลบ'
      });
    }

    // Delete documents from database
    const deletedDocuments = await prisma.purchase_document.deleteMany({
      where: {
        purchase_document_id: {
          in: documentIds
        }
      }
    });

    res.json({
      success: true,
      message: `ลบเอกสาร ${deletedDocuments.count} รายการเรียบร้อยแล้ว`,
      deletedCount: deletedDocuments.count
    });
  } catch (error) {
    console.error('Error bulk deleting documents:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบเอกสาร'
    });
  }
});

// POST /purchase/documents/bulk-share - Create shareable link for multiple documents
router.post('/documents/bulk-share', verifyToken, async (req, res) => {
  try {
    const { documentIds } = req.body;
    
    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุเอกสารที่ต้องการแชร์'
      });
    }

    // Check if documents exist
    const documents = await prisma.purchase_document.findMany({
      where: {
        purchase_document_id: {
          in: documentIds
        }
      },
      select: {
        purchase_document_id: true,
        pdf_filename: true
      }
    });
    
    if (documents.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบเอกสารที่ระบุ'
      });
    }

    // Create share token
    const shareToken = Buffer.from(JSON.stringify({
      documentIds,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      createdAt: new Date().toISOString()
    })).toString('base64');

    const shareUrl = `${req.protocol}://${req.get('host')}/api/purchase/shared/${shareToken}`;

    res.json({
      success: true,
      shareLink: shareUrl,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
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

export default router;
