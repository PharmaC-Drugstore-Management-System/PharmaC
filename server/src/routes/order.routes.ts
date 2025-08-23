import { Router } from "express";

import controller from "../controller/order.controller";

const router = Router();

router.post('/createOrder', controller.createOrder)

export default router;
