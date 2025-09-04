import { Router } from "express";
import controller from '../controller/lot.controller.ts'

const router = Router();

router.post('/add-lot', controller.add);
router.get('/get-lot', controller.get);
router.get('/get-lot/:id', controller.getById);
router.get('/get-lots-by-product/:productId', controller.getByProductId);

export default router;
