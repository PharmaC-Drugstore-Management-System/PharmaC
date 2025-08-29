import prisma from "../utils/prisma.utils";
import fs from "fs";
import path from "path";

interface SignatureData {
  signer_name: string;
  signed_at?: Date;
  signature_image?: string;
}

interface SignatureWithImageData {
  signer_name: string;
  signature_data_url: string; // Base64 image data
  signed_at?: Date;
}

interface PurchaseDocumentWithSignature {
  description?: string;
  issue_date?: Date;
  employee_id?: number;
  store_id?: number;
  suplier_id?: number;
  pdf_file?: Buffer;
  pdf_filename?: string;
  pdf_mime?: string;
  signature_data?: SignatureData;
}

const signatureService = {
  // Create a new signature with image conversion
  add: async (data: SignatureData) => {
    try {
      const currentTime = new Date();
      console.log(`💾 Creating new signature for "${data.signer_name}" at ${currentTime.toISOString()}`);
      
      const newSignature = await prisma.po_signature.create({
        data: {
          signer_name: data.signer_name,
          signature_image: data.signature_image,
          signed_at: currentTime, // Always use current timestamp
        },
      });
      
      console.log(`✅ New signature created:`, {
        id: newSignature.id,
        signer_name: newSignature.signer_name,
        signed_at: newSignature.signed_at,
        timestamp: currentTime.toISOString()
      });
      
      return newSignature;
    } catch (error: any) {
      console.error("Error in signatureService.add():", error.message);
      throw error;
    }
  },

  // Create signature with Base64 image data (converts to file)
  addWithImageData: async (data: SignatureWithImageData) => {
    try {
      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), "uploads", "signatures");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Convert base64 to image file
      let imageUrl = null;
      if (data.signature_data_url) {
        // Extract base64 data (remove data:image/png;base64, prefix)
        const base64Data = data.signature_data_url.replace(/^data:image\/[a-z]+;base64,/, "");
        
        // Generate unique filename
        const fileName = `signature-${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;
        const filePath = path.join(uploadDir, fileName);
        
        // Save base64 as image file
        fs.writeFileSync(filePath, base64Data, 'base64');
        
        // Create URL for the saved image
        imageUrl = `http://localhost:5000/uploads/signatures/${fileName}`;
      }

      const currentTime = new Date();
      console.log(`💾 Creating new signature with image for "${data.signer_name}" at ${currentTime.toISOString()}`);

      const newSignature = await prisma.po_signature.create({
        data: {
          signer_name: data.signer_name,
          signature_image: imageUrl,
          signed_at: currentTime, // Always use current timestamp
        },
      });
      
      console.log(`✅ New signature with image created:`, {
        id: newSignature.id,
        signer_name: newSignature.signer_name,
        signed_at: newSignature.signed_at,
        signature_image: newSignature.signature_image,
        timestamp: currentTime.toISOString()
      });
      
      return newSignature;
    } catch (error: any) {
      console.error("Error in signatureService.addWithImageData():", error.message);
      throw error;
    }
  },

  // Get signature by ID
  getSignature: async (id: number) => {
    try {
      const signature = await prisma.po_signature.findUnique({
        where: { id }
      });

      if (!signature) {
        return null;
      }

      // Get all purchase documents that reference this signature
      const purchaseDocuments = await prisma.purchase_document.findMany({
        where: { signature_fk: id },
        select: {
          purchase_document_id: true,
          description: true,
          issue_date: true,
          pdf_filename: true,
        }
      });

      return {
        ...signature,
        purchase_documents: purchaseDocuments
      };
    } catch (error: any) {
      console.error("Error in signatureService.getSignature():", error.message);
      throw error;
    }
  },

  // Get all signatures
  getAllSignatures: async () => {
    try {
      const signatures = await prisma.po_signature.findMany({
        orderBy: {
          signed_at: 'desc'
        }
      });

      // For each signature, get the associated purchase documents
      const signaturesWithDocuments = await Promise.all(
        signatures.map(async (signature) => {
          const purchaseDocuments = await prisma.purchase_document.findMany({
            where: { signature_fk: signature.id },
            select: {
              purchase_document_id: true,
              description: true,
              issue_date: true,
              pdf_filename: true,
            }
          });

          return {
            ...signature,
            purchase_documents: purchaseDocuments
          };
        })
      );

      return signaturesWithDocuments;
    } catch (error: any) {
      console.error("Error in signatureService.getAllSignatures():", error.message);
      throw error;
    }
  },

  // Update signature
  updateSignature: async (id: number, data: Partial<SignatureData>) => {
    try {
      return await prisma.po_signature.update({
        where: { id },
        data: {
          ...(data.signer_name && { signer_name: data.signer_name }),
          ...(data.signature_image && { signature_image: data.signature_image }),
          ...(data.signed_at && { signed_at: data.signed_at }),
        }
      });
    } catch (error: any) {
      console.error("Error in signatureService.updateSignature():", error.message);
      throw error;
    }
  },

  // Delete signature
  deleteSignature: async (id: number) => {
    try {
      // Check if signature is being used by any purchase documents
      const connectedDocuments = await prisma.purchase_document.findMany({
        where: { signature_fk: id }
      });

      if (connectedDocuments.length > 0) {
        throw new Error(`Cannot delete signature. It is being used by ${connectedDocuments.length} purchase document(s).`);
      }

      return await prisma.po_signature.delete({
        where: { id }
      });
    } catch (error: any) {
      console.error("Error in signatureService.deleteSignature():", error.message);
      throw error;
    }
  },

  // Create purchase document with signature
  createPurchaseDocumentWithSignature: async (data: PurchaseDocumentWithSignature) => {
    try {
      // Use transaction to ensure both signature and document are created together
      const result = await prisma.$transaction(async (tx) => {
        let signatureId = null;

        // Create signature if signature data is provided
        if (data.signature_data) {
          const signature = await tx.po_signature.create({
            data: {
              signer_name: data.signature_data.signer_name,
              signature_image: data.signature_data.signature_image,
              signed_at: data.signature_data.signed_at || new Date(),
            }
          });
          signatureId = signature.id;
        }

        // Create purchase document
        const document = await tx.purchase_document.create({
          data: {
            description: data.description,
            issue_date: data.issue_date || new Date(),
            employee_id: data.employee_id,
            store_id: data.store_id,
            suplier_id: data.suplier_id,
            pdf_file: data.pdf_file,
            pdf_filename: data.pdf_filename,
            pdf_mime: data.pdf_mime,
            signature_fk: signatureId, // Link to signature
          }
        });

        return { document, signatureId };
      });

      return result;
    } catch (error: any) {
      console.error("Error in signatureService.createPurchaseDocumentWithSignature():", error.message);
      throw error;
    }
  },

  // Link existing signature to purchase document
  linkSignatureToPurchaseDocument: async (purchaseDocumentId: number, signatureId: number) => {
    try {
      // Verify signature exists
      const signature = await prisma.po_signature.findUnique({
        where: { id: signatureId }
      });

      if (!signature) {
        throw new Error(`Signature with ID ${signatureId} not found`);
      }

      // Update purchase document with signature reference
      return await prisma.purchase_document.update({
        where: { purchase_document_id: purchaseDocumentId },
        data: { signature_fk: signatureId },
        include: {
          po_signature: true
        }
      });
    } catch (error: any) {
      console.error("Error in signatureService.linkSignatureToPurchaseDocument():", error.message);
      throw error;
    }
  },

  // Remove signature from purchase document
  unlinkSignatureFromPurchaseDocument: async (purchaseDocumentId: number) => {
    try {
      return await prisma.purchase_document.update({
        where: { purchase_document_id: purchaseDocumentId },
        data: { signature_fk: null }
      });
    } catch (error: any) {
      console.error("Error in signatureService.unlinkSignatureFromPurchaseDocument():", error.message);
      throw error;
    }
  },

  // Verify signature (simplified since we removed hash verification)
  verifySignature: async (id: number) => {
    try {
      const signature = await prisma.po_signature.findUnique({
        where: { id }
      });

      if (!signature) {
        throw new Error(`Signature with ID ${id} not found`);
      }

      return {
        isValid: true, // Signature exists and is valid
        signature
      };
    } catch (error: any) {
      console.error("Error in signatureService.verifySignature():", error.message);
      throw error;
    }
  },

  // Get latest signature by signer name
  getLatestBySignerName: async (signerName: string) => {
    try {
      console.log(`🔍 Searching for latest signature by signer: "${signerName}"`);
      
      // First, let's see all signatures for this signer for debugging
      const allSignatures = await prisma.po_signature.findMany({
        where: { 
          signer_name: signerName 
        },
        orderBy: [
          { signed_at: 'desc' },
          { id: 'desc' } // Use ID as secondary sort to ensure newest comes first
        ]
      });

      console.log(`📝 Found ${allSignatures.length} signatures for "${signerName}":`, 
        allSignatures.map(sig => ({
          id: sig.id,
          signed_at: sig.signed_at,
          created: new Date(sig.signed_at || '').toISOString()
        }))
      );

      // Get the most recent one
      const latestSignature = allSignatures[0] || null;
      
      if (latestSignature) {
        console.log(`✅ Latest signature found:`, {
          id: latestSignature.id,
          signer_name: latestSignature.signer_name,
          signed_at: latestSignature.signed_at,
          signature_image: latestSignature.signature_image ? 'Has image' : 'No image'
        });
      } else {
        console.log(`❌ No signatures found for signer: "${signerName}"`);
      }

      return latestSignature;
    } catch (error: any) {
      console.error("Error in signatureService.getLatestBySignerName():", error.message);
      throw error;
    }
  }
};

export default signatureService;
