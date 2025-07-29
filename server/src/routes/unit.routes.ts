import { Router } from "express";
import controller from '../controller/unit.controller.ts'
const router = Router();

router.post('/asd', controller.add);


export default router;
