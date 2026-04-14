import { Router } from "express";
import requireRoles from "../../middlewares/rbac.middleware.js";
import { listSessionsByClass, createLiveSession, markAttendance } from "./live.controller.js";

const router = Router();

router.get("/sessions/:classId", listSessionsByClass);
router.post("/sessions", requireRoles("ADMIN", "TEACHER"), createLiveSession);
router.post("/attendance", requireRoles("ADMIN", "TEACHER"), markAttendance);

export default router;
