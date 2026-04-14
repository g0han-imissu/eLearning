import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
  register, login, refresh, logout,
  requestChangePassword, confirmChangePassword,
  updateProfile, verifyEmail,
} from "./auth.controller.js";

const router = Router();

router.post("/register", register);
router.get("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", authMiddleware, logout);
router.post("/change-password/request", authMiddleware, requestChangePassword);
router.post("/change-password/confirm", authMiddleware, confirmChangePassword);
router.patch("/profile", authMiddleware, updateProfile);

export default router;
