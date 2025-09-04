import { Router } from "express";
import controller from '../controller/stock_trans.controller.ts'
const router = Router();

router.post('/add-stock', controller.add);
router.get('/get-stock', controller.get)

export default router;
