import { Router } from "express";
import controller from "../controller/producttype.controller.js";

const router = Router();

router.get('/product-type', controller.getProductTypes);


export default router;
