import { Router } from "express";
import controller from '../controller/inventory.controller.ts'
const router = Router();

router.post('/add-medicine', controller.add);



export default router;
