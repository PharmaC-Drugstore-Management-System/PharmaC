import prisma from "../utils/prisma.utils";
import puppeteer from "puppeteer";
import signatureService from "./signature.service";

const purchaseService = {
  createPDF: async (
    userID : any,
    frontendURL: any,
    description: any,
    issueDate: any,
    prepareBy: any,
    cookies?: any,
    podocData?: any,
    signatureId?: number
  ) => {
    try {
      console.log('createPDF called with signatureId:', signatureId);
      
      // Fetch signature data if signatureId is provided
      let signatureData = null;
      if (signatureId) {
        signatureData = await signatureService.getSignature(signatureId);
        console.log('Retrieved signature data:', signatureData);
      } else {
        console.log('No signatureId provided');
      }

      const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();
      
      // Set cookies if provided (for authentication)
      if (cookies) {
        const cookieString = Object.entries(cookies)
          .map(([name, value]) => `${name}=${value}`)
          .join('; ');
        await page.setExtraHTTPHeaders({
          'Cookie': cookieString
        });
      }
      
      await page.goto(frontendURL, { waitUntil: "networkidle0" });

      // If we have data to inject, set it in sessionStorage and reload
      if (podocData) {
        // Include signature data in the payload
        const enhancedPodocData = {
          ...podocData,
          signatureFromDB: signatureData // Add signature data from database
        };
        
        console.log('Injecting PODoc data with signature:', enhancedPodocData);
        
        // Inject the data into sessionStorage
        await page.evaluate((data) => {
          sessionStorage.setItem('podoc_payload', JSON.stringify(data));
        }, enhancedPodocData);
        
        // Reload the page to use the injected data
        await page.reload({ waitUntil: "networkidle0" });
        
        // Wait for the page to render with the new data
        await page.waitForSelector('.printable-content', { timeout: 10000 });
        
        // Wait a bit for React to render with the new data
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      // Generate PDF
      const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
      console.log("Generate PDF")
      await browser.close();


      // Find employee by firstname
      const findEmployee = await prisma.employee.findFirst({
        where: {
          employee_id : userID     // replace with actual variable
        }
      });

      if(!findEmployee){
        console.error("Error not found employee id in database")
        throw new Error('Not found employee id in database')
      }

      // Get current document count for filename
      const docCount = await prisma.purchase_document.count({});
      const nextDocNumber = docCount + 1;

      console.log('Creating document with signature_fk:', signatureId);

      const created = await prisma.purchase_document.create({
        data: {
          employee_id: userID, 
          description: description || "",
          issue_date: issueDate ? new Date(issueDate) : new Date(), // Convert string to Date
          pdf_file: pdfBuffer,
          pdf_filename: `PO-A${String(nextDocNumber).padStart(6, '0')}.pdf`,
          pdf_mime: "application/pdf",
          signature_fk: signatureId || null, // Link to signature if provided
        },
      });

      console.log('Document created with signature_fk:', created.signature_fk);

      return created
    } catch (error) {
      console.error("Error creating PDF:", error);
      throw error; // Re-throw the error so controller can handle it
    }
  },
  // Get PDF document from database
  getPODocument: async (documentId: number) => {
    try {
      const document = await prisma.purchase_document.findUnique({
        where: {
          purchase_document_id: documentId,
        },
        select: {
          purchase_document_id: true,
          description: true,
          issue_date: true,
          pdf_file: true,
          pdf_filename: true,
          pdf_mime: true,
        },
      });

      if (!document || !document.pdf_file) {
        throw new Error("PDF document not found");
      }

      return {
        id: document.purchase_document_id,
        filename: document.pdf_filename || "document.pdf",
        mimeType: document.pdf_mime || "application/pdf",
        buffer: document.pdf_file, // This is the binary PDF data
        description: document.description,
        issueDate: document.issue_date,
      };
    } catch (error) {
      throw error;
    }
  },

  // Get list of all PDF documents (metadata only, no binary data)
  getAllPODocuments: async () => {
    try {
      const documents = await prisma.purchase_document.findMany({
        select: {
          purchase_document_id: true,
          description: true,
          issue_date: true,
          pdf_filename: true,
          pdf_mime: true,
          signature_fk: true,
          // Include signature data
          po_signature: {
            select: {
              id: true,
              signer_name: true,
              signature_image: true,
              signed_at: true,
            }
          },
          // Include employee data
          employee: {
            select: {
              firstname: true,
              lastname: true,
              email: true,
            }
          }
          // Note: We don't select pdf_file to avoid loading large binary data
        },
        orderBy: {
          issue_date: "desc",
        },
      });

      return documents;
    } catch (error) {
      throw error;
    }
  },
  // Return count of purchase_document rows
  countPODocuments: async () => {
    try {
      const count = await prisma.purchase_document.count({});
      return count;
    } catch (error) {
      console.error('Error counting purchase_documents:', error);
      throw error;
    }
  },
};

export default purchaseService;
