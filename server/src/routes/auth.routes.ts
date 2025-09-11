import { Router } from "express";
import controller from "../controller/auth.controller.ts"
import {verifyToken} from "../middleware/verifyToken.ts"

const router = Router();

router.post('/register',controller.register)

router.post('/login',controller.authenAndSendOtp)
router.post('/verify',controller.verifyLogin)

router.post('/otp-status',controller.getOtpStatus)
router.post('/resend-otp',controller.resendOtp)

router.post('/logout',controller.logout)
router.get('/me',verifyToken,controller.me)

export default router;
