import { Router } from "express";
import controller from '../controller/inventory.controller.ts'
const router = Router();

router.post('/add-medicine', controller.add);
router.get('/get-medicine', controller.get);



export default router;
