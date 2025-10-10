import { Router } from "express";
import controller from "../controller/dashboard.controller.ts";
const router = Router();

router.get('/total-sales',controller.getTotalSales)
router.get('/total-order',controller.getTotalOrder)
router.get('/total-product',controller.getTotalProduct)
router.get('/total-member',controller.getTotalMember)
router.get('/inventory-by-product-type', controller.getInventoryByProductType)
router.get('/restock-recommendations', controller.getRestockRecommendations)

export default router;
