import { Router } from "express";
import controller from '../controller/lot.controller.ts'
const router = Router();

router.post('/add-lot', controller.add);

export default router;
