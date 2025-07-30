import { Router } from "express";
import controller from '../controller/unit.controller.ts'
const router = Router();

router.post('/add-unit', controller.add);
router.get('/get-unit', controller.get);



export default router;
