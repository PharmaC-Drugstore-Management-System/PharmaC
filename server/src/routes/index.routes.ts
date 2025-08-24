import express from "express";

const router = express.Router();

import authRoute from "./auth.routes.ts";
router.use("/api", authRoute);

import accountRoute from "./account.routes.ts";
router.use("/acc", accountRoute);

import roleRoute from "./role.routes.ts";
router.use("/role", roleRoute);

import inventoryRoute from "./medicine.routes.ts";
router.use("/inventory", inventoryRoute);

import forecastRoute from "./forecast.routes.ts";
router.use("/arima", forecastRoute);

import purchaseRoute from "./purchase.routes.ts";
router.use("/purchase", purchaseRoute);

import orderRoute from "./order.routes.ts"
router.use("/order",orderRoute)

// import cartRoute from "./cart.routes.ts"
// router.use("/cart", cartRoute)

import memberRoute from "./membership.routes.ts"
router.use("/membership", memberRoute)

import paymentRoute from "./payment.routes.ts"
router.use("/payment", paymentRoute)
export default router;
