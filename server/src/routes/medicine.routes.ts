import { Router } from "express";
import controller from '../controller/inventory.controller.ts'
import upload from '../middleware/upload.middleware';

const router = Router();

router.post('/add-medicine', upload.single('image'), controller.add);
router.get('/get-medicine', controller.get);

export default router;
