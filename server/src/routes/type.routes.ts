import { Router } from "express";
import controller from '../controller/type.controller.ts'
const router = Router();

router.post('/add-type', controller.add);
router.get('/get-type', controller.get)


export default router;
