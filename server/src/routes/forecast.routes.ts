import { Router } from "express";
import controller from "../controller/forecast.controller.ts";
const router = Router();

router.post('/forecast',controller.getForecastRevenue)

export default router;
