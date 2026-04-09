const { Router } = require("express");
const requireRoles = require("../../middlewares/rbac.middleware");
const { listSessionsByClass, createLiveSession, markAttendance } = require("./live.controller");

const router = Router();

// GET /api/live/sessions/:classId?page=1&limit=10
router.get("/sessions/:classId", listSessionsByClass);

router.post("/sessions", requireRoles("ADMIN", "TEACHER"), createLiveSession);
router.post("/attendance", requireRoles("ADMIN", "TEACHER"), markAttendance);

module.exports = router;
