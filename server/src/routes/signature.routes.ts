import { Router } from 'express';
import signatureController from '../controller/signature.controller'
import { verifyToken } from '../middleware/verifyToken.ts';
import signatureUpload from '../middleware/signature-upload.middleware';

const router = Router();

// Create signatures for a purchase order (requires authentication)
router.post('/create', verifyToken, signatureController.addSignature);

// Upload signature as image file (requires authentication)
router.post('/upload', verifyToken, signatureUpload.single('signature'), signatureController.uploadSignature);

// Get latest signature for authenticated user
router.get('/latest', verifyToken, signatureController.getLatestSignature);

// Get all signatures
router.get('/all', signatureController.getAllSignatures);

// Get signature by ID
router.get('/:id', signatureController.getSignature);

export default router;
