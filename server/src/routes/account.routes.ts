import { Router } from "express";
import controller from "../controller/account-detail.controller.ts";
const router = Router();

router.get('/account-detail', controller.account);
router.post('/edit-account',controller.edit_account)

export default router;
