import { Router } from "express";
import predictorController from "../controller/predictor.controller.js";

const router = Router();

router.post('/generate', predictorController.generate);
router.get('/status', predictorController.status);

export default router;
