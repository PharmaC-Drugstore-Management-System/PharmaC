import { Router } from "express";
import controller from "../controller/historical-detail.controller.ts";
const router = Router();

router.get('/detail/:producttype', controller.getHistoricalDetail);

export default router;
