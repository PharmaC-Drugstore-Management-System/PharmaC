import { Router } from "express";

import controller from "../controller/order.controller";

const router = Router();

router.post('/createOrder', controller.createOrder)
router.get('/list',controller.list)

export default router;
