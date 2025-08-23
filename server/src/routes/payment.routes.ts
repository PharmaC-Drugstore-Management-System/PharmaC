import { Router } from "express";

import controller from "../controller/payment.controller";

const router = Router();

router.post('/intents', controller.paymentIntents)
router.post('/method', controller.paymentMethod)
router.post('/qr-code',controller.paymentQrcode)

router.get('/check',controller.paymentCheck)

export default router;
