// routes/group-sales-history.route.ts
import { Router } from "express";
import controller from "../controller/group-sales-history.controller";

const router = Router();

// Changed from /:producttype to query parameter to support product types with '/' character
router.get("/", controller.listByProductType);

export default router;
