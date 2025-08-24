import { Router } from "express";
import controller from '../controller/membership.controller.ts'

const router = Router();

router.post('/add-member', controller.add);
router.get('/get-member', controller.get);

export default router;
