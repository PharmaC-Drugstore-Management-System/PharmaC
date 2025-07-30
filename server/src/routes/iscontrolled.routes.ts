import {Router} from "express";
import controller from '../controller/iscontrolled.controller.ts';

const router = Router();
router.post('/add-controlled', controller.add);
router.get('/get-controlled', controller.get);

export default router;