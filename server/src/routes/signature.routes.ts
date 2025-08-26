import { Router } from 'express';
import signatureController from '../controller/signature.controller'

const router = Router();

// Create signatures for a purchase order
router.post('/create', signatureController.addSignature);

// Get signatures for a purchase order
// router.get('/:po_id', signatureController.getSignatures);

// Verify signature integrity
// router.get('/:po_id/verify/:signer_type', signatureController.verifySignature);

// Get signature audit log
// router.get('/:po_id/audit', signatureController.getAuditLog);

export default router;
