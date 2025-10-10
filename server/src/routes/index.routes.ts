import express from "express";

const router = express.Router();

import authRoute from "./auth.routes.ts";
router.use("/api", authRoute);

import accountRoute from "./account.routes.ts";
router.use("/api/account", accountRoute);

import roleRoute from "./role.routes.ts";
router.use("/api/role", roleRoute);

import inventoryRoute from "./medicine.routes.ts";
router.use("/api/inventory", inventoryRoute);

import forecastRoute from "./forecast.routes.ts";
router.use("/api/arima", forecastRoute);

import purchaseRoute from "./purchase.routes.ts";
router.use("/api/purchase", purchaseRoute);

import purchaseDocumentsRoute from "./purchase-documents.route.ts";
router.use("/api/purchase-documents", purchaseDocumentsRoute);

import orderRoute from "./order.routes.ts";
router.use("/api/order", orderRoute);

import customerRoute from "./customer.routes.ts";
router.use("/api/customer", customerRoute);

import signatureRoute from "./signature.routes.ts";
router.use("/api/signature", signatureRoute);

import supplierRoute from "./supplier.routes.ts";
router.use("/api/suppliers", supplierRoute);

import productSupplierRoute from "./product-supplier.routes.ts";
router.use("/api", productSupplierRoute);

import revenueRoute from "./revenue.routes.ts";
router.use("/api/revenue", revenueRoute);

import paymentRoute from "./payment.routes.ts";
router.use("/api/payment", paymentRoute);

import lotRoute from "./lot.routes.ts";
router.use("/api/lot", lotRoute);

import stockTransRoute from "./stock_trans.routes.ts"
router.use("/api/stock", stockTransRoute);

export default router;
