import { Router } from "express";

import controller from "../controller/order.controller";

const router = Router();

router.post('/createOrder', controller.createOrder)
router.get('/list',controller.list)
router.get('/recent', controller.getRecentOrders)

export default router;
