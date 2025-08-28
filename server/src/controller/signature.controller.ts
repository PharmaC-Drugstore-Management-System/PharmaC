import signatureService from "../services/signature.service";

const controller = {
    // Create signature with authentication
    addSignature: async (req: any, res: any) => {
        try {
            // Get user info from token/session (assuming it's available in req.user)
            const user = req.user; // This should be populated by your auth middleware
            
            if (!user) {
                return res.status(401).json({ error: "Authentication required" });
            }

            const { signature_data_url } = req.body;
            
            if (!signature_data_url) {
                return res.status(400).json({ error: "Signature data is required" });
            }

            // Create signature with user info and image data
            const signatureData = {
                signer_name: user.name || user.username || `User ${user.id}`,
                signature_data_url: signature_data_url,
                signed_at: new Date()
            };

            const newSignature = await signatureService.addWithImageData(signatureData);
            
            res.status(201).json({
                success: true,
                message: "Signature saved successfully",
                data: newSignature
            });
        } catch (error: any) {
            console.error("Error in controller.addSignature():", error.message);
            res.status(500).json({ error: "Internal Server Error", details: error.message });
        }
    },

    // Get all signatures
    getAllSignatures: async (req: any, res: any) => {
        try {
            const signatures = await signatureService.getAllSignatures();
            res.status(200).json({
                success: true,
                data: signatures
            });
        } catch (error: any) {
            console.error("Error in controller.getAllSignatures():", error.message);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Get signature by ID
    getSignature: async (req: any, res: any) => {
        try {
            const { id } = req.params;
            const signature = await signatureService.getSignature(parseInt(id));
            
            if (!signature) {
                return res.status(404).json({ error: "Signature not found" });
            }

            res.status(200).json({
                success: true,
                data: signature
            });
        } catch (error: any) {
            console.error("Error in controller.getSignature():", error.message);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Upload signature image file
    uploadSignature: async (req: any, res: any) => {
        try {
            // Check if user is authenticated
            if (!req.user) {
                return res.status(401).json({ error: "Authentication required" });
            }

            // Check if file was uploaded
            if (!req.file) {
                return res.status(400).json({ error: "No signature file uploaded" });
            }

            const file = req.file;
            const userId = req.user.id;
            const userName = req.user.name || req.user.employee_name || 'Unknown User';

            // Create signature image URL using the actual filename from multer
            const signatureImageUrl = `http://localhost:5000/uploads/signatures/${file.filename}`;

            console.log('Signature file saved as:', file.filename);
            console.log('Signature URL:', signatureImageUrl);

            // Save signature to database
            const signatureData = {
                signer_name: userName,
                signature_image: signatureImageUrl,
                signed_at: new Date(),
            };

            const savedSignature = await signatureService.add(signatureData);

            console.log(`✅ Signature saved for user ${userName} (ID: ${userId}): ${signatureImageUrl}`);

            res.status(201).json({
                success: true,
                message: "Signature uploaded and saved successfully",
                data: {
                    id: savedSignature.id,
                    signer_name: savedSignature.signer_name,
                    signature_image: savedSignature.signature_image,
                    signed_at: savedSignature.signed_at,
                    filename: file.filename
                }
            });

        } catch (error: any) {
            console.error("Error in controller.uploadSignature():", error.message);
            res.status(500).json({ 
                success: false,
                error: "Internal Server Error",
                message: error.message 
            });
        }
    }
}

export default controller