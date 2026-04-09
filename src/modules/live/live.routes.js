const { Router } = require("express");
const requireRoles = require("../../middlewares/rbac.middleware");
const { createLiveSession, markAttendance } = require("./live.controller");

const router = Router();
router.post("/sessions", requireRoles("ADMIN", "TEACHER"), createLiveSession);
router.post("/attendance", requireRoles("ADMIN", "TEACHER"), markAttendance);

module.exports = router;
