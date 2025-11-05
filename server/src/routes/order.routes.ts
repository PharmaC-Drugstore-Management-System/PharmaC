import { Router } from "express";

import controller from "../controller/order.controller";

const router = Router();

router.post('/createOrder', controller.createOrder)
router.get('/list',controller.list)
router.get('/recent', controller.getRecentOrders)
router.get('/latest', controller.getLatestOrders)  // เพิ่ม route ใหม่
router.post('/cancelOrder', controller.cancelOrder)  // Cancel order endpoint

export default router;
