import { Router } from "express";
import controller from '../controller/revenue.controller.ts';
const router = Router();

router.get('/revenue', controller.revenue);
router.get('/monthly-revenue', controller.monthlyRevenue);
router.get('/daily-revenue', controller.dailyRevenue);

export default router;
