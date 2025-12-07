import { Router } from "express";
import controller from '../controller/inventory.controller.ts'
import upload from '../middleware/upload.middleware';

const router = Router();

router.post('/add-medicine', upload.single('image'), controller.add);
router.post('/get-prouduct/:id',controller.getId)
router.get('/get-medicine', controller.get);
router.put('/update-medicine/:id', upload.single('image'), controller.update);
router.delete('/delete-medicine/:id', controller.delete);

export default router;
