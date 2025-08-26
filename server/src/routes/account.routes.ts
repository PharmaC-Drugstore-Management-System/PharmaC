import { Router } from "express";
import controller from "../controller/account-detail.controller.ts";
import { verifyToken } from "../middleware/verifyToken.ts";
import upload from "../middleware/upload.middleware.ts";

const router = Router();

// Existing routes
router.post('/account-detail', controller.account);
router.post('/edit-account', controller.edit_account);

// Profile image upload route
router.post('/upload-profile-image', verifyToken, upload.single('profileImage'), controller.uploadProfileImage);

// New routes for role management
router.get('/get-all-employees', verifyToken, controller.getAllEmployees);
router.post('/update-employee-roles', verifyToken, controller.updateEmployeeRoles);

export default router;
