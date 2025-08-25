import { Router } from "express";
import controller from "../controller/account-detail.controller.ts";
import { verifyToken } from "../middleware/verifyToken.ts";

const router = Router();

// Existing routes
router.post('/account-detail', controller.account);
router.post('/edit-account', controller.edit_account);

export default router;
