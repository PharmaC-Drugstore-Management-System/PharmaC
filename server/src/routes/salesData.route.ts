import { Router } from "express";
import controller from '../controller/salesData.controller.ts'
const router = Router();

router.get('/sales-volume', controller.getSalesVolume);


export default router;
