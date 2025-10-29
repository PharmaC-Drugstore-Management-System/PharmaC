// routes/group-sales-history.route.ts
import { Router } from "express";
import controller from "../controller/group-sales-history.controller";

const router = Router();

router.get("/:producttype", controller.listByProductType);

export default router;
