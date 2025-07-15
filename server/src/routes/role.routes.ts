import { Router } from "express";
import controller from '../controller/role.controller.ts'
const router = Router();

router.put('/edit-role', controller.editrole);
router.post('/add-role', controller.role)

export default router;
