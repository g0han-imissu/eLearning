import { Router } from "express";
import { listUsers, updateUserStatus, assignRoles } from "./user.controller.js";

const router = Router();

router.get("/", listUsers);
router.patch("/:id/status", updateUserStatus);
router.patch("/:id/roles", assignRoles);

export default router;
