import express from 'express';
import controller from '../controller/purchase.controller.ts'
import { verifyToken } from '../middleware/verifyToken.ts';

const router = express.Router();

// Create new PDF document (requires authentication)
router.post('/pdf', verifyToken, controller.pdf);

// Get PDF file by ID (serves the actual PDF) - requires authentication
router.get('/pdf/:id', controller.getPDF);

// Get list of all PDF documents (metadata only) - requires authentication  
router.get('/pdfs', controller.getAllPDFs);

export default router;
