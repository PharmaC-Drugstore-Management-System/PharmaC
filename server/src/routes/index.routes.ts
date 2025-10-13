import express from "express";

const router = express.Router();

import authRoute from "./auth.routes.ts";
router.use("/", authRoute);

import accountRoute from "./account.routes.ts";
router.use("/account", accountRoute);

import roleRoute from "./role.routes.ts";
router.use("/role", roleRoute);

import inventoryRoute from "./medicine.routes.ts";
router.use("/inventory", inventoryRoute);

import forecastRoute from "./forecast.routes.ts";
router.use("/arima", forecastRoute);

import purchaseRoute from "./purchase.routes.ts";
router.use("/purchase", purchaseRoute);

import purchaseDocumentsRoute from "./purchase-documents.route.ts";
router.use("/purchase-documents", purchaseDocumentsRoute);

import orderRoute from "./order.routes.ts";
router.use("/order", orderRoute);

import customerRoute from "./customer.routes.ts";
router.use("/customer", customerRoute);

import signatureRoute from "./signature.routes.ts";
router.use("/signature", signatureRoute);

import supplierRoute from "./supplier.routes.ts";
router.use("/suppliers", supplierRoute);

import productSupplierRoute from "./product-supplier.routes.ts";
router.use("/", productSupplierRoute);

import revenueRoute from "./revenue.routes.ts";
router.use("/revenue", revenueRoute);

import paymentRoute from "./payment.routes.ts";
router.use("/payment", paymentRoute);

import lotRoute from "./lot.routes.ts";
router.use("/lot", lotRoute);

import stockTransRoute from "./stock_trans.routes.ts"
router.use("/stock", stockTransRoute);

import predictorRoute from "./predictor.route.ts";
router.use("/predictor", predictorRoute);

import salesDataRoute from "./salesData.route.ts";
router.use("/sales", salesDataRoute);

import productTypeRoute from "./producttype.route.ts";
router.use("/product", productTypeRoute);

import dashboardRoute from "./dashboard.routes.ts"; 
router.use("/dashboard", dashboardRoute);

export default router;
