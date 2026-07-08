import { Router } from "express";
import requireRoles from "../../middlewares/rbac.middleware.js";
import { listSessionsByClass, createLiveSession, joinSession, markAttendance } from "./live.controller.js";

const router = Router();

router.get("/sessions/:classId", listSessionsByClass);
router.post("/sessions", requireRoles("ORG_ADMIN", "TEACHER"), createLiveSession);
router.post("/sessions/:sessionId/join", joinSession);
router.post("/attendance", requireRoles("ORG_ADMIN", "TEACHER"), markAttendance);

export default router;
