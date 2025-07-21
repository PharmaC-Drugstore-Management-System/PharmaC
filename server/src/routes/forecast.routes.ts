import { Router } from "express";
import controller from "../controller/forecast.controller";
const router = Router();

router.post('/forecast',controller.getForecastRevenue)

export default router;
