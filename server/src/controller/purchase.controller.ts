import purchaseService from "../services/purchase.service";

const controller = {
  // Create new PDF document
  pdf: async (req: any, res: any) => {
    try {
      const {
        userID,
        frontendURL,
        issueDate,
        prepareBy,
        description,
        podocData,
        signatureId,
      } = req.body;
      console.log('PDF request body:', req.body);
      console.log('SignatureId received:', signatureId);
      
      if (!frontendURL)
        return res
          .status(400)
          .json({ success: false, message: "No URL provided" });
      if (!userID)
        return res
          .status(404)
          .json({ sucess: false, message: "404 Not found user id" });

      // Pass cookies to service for Puppeteer authentication
      const cookies = req.cookies;
      const response = await purchaseService.createPDF(
        userID,
        frontendURL,
        description,
        issueDate,
        prepareBy,
        cookies,
        podocData,
        signatureId // Pass signature ID to service
      );
      console.log("Response : ", response);
      return res.status(200).json({ success: true, data: response });
    } catch (error: any) {
      console.error("Error in PDF controller:", error);
      return res
        .status(500)
        .json({
          success: false,
          message: "Failed to create PDF",
          error: error.message,
        });
    }
  },

  getCount: async (req: any, res: any) => {
    try {
      const response = await purchaseService.countPODocuments();
      return res.status(200).json({ success: true, data: response });
    } catch (error) {
      console.error("Failed to get PDF", error);
      res.status(500).json({ success: false, message: "Failed to Count documents" });
    }
  },

  // Get PDF file by ID and serve it
  getPDF: async (req: any, res: any) => {
    try {
      const documentId = parseInt(req.params.id);
      const pdfData = await purchaseService.getPODocument(documentId);

      // Set appropriate headers for PDF response
      res.setHeader("Content-Type", pdfData.mimeType);
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${pdfData.filename}"`
      );
      res.setHeader("Content-Length", pdfData.buffer.length);

      // Send the PDF buffer as response
      res.end(pdfData.buffer);
    } catch (err: any) {
      console.error("Failed to get PDF", err);
      res.status(500).json({ success: false, message: "Failed to get PDF" });
    }
  },

  // Get list of all PDF documents (metadata only)
  getAllPDFs: async (req: any, res: any) => {
    try {
      const documents = await purchaseService.getAllPODocuments();
      res.json({ success: true, documents });
    } catch (err: any) {
      console.error("Failed to get PDF list", err);
      res
        .status(500)
        .json({ success: false, message: "Failed to get PDF list" });
    }
  },
};

export default controller;
