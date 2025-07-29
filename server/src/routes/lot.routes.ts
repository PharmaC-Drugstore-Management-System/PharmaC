import { Router } from "express";
import controller from '../controller/unit.controller.ts'
const router = Router();

router.post('/add-lot', controller.add);
router.get('/get-lot', controller.get);


export default router;
