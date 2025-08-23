import { Router } from "express";

import controller from "../controller/payment.controller";

const router = Router();

router.post('/intents', controller.paymentIntents)
router.post('/method', controller.paymentMethod)

export default router;
