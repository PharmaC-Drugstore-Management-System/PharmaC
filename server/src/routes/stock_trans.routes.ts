import { Router } from "express";
import controller from '../controller/stock_trans.controller.ts'
const router = Router();

router.post('/add-stock', controller.add);
router.get('/get-stock', controller.get);
router.get('/get-stock/:id', controller.getById);
router.get('/lot/:lotId', controller.getByLotId);
router.get('/product/:productId', controller.getByProductId);
router.get('/filter', controller.getWithFilters);

export default router;
