const { Router } = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const requireRoles = require("../middlewares/rbac.middleware");
const authRoutes = require("../modules/auth/auth.routes");
const userRoutes = require("../modules/users/user.routes");
const learningRoutes = require("../modules/learning/learning.routes");
const contentRoutes = require("../modules/content/content.routes");
const liveRoutes = require("../modules/live/live.routes");
const studentRoutes = require("../modules/student/student.routes");
const teacherRoutes = require("../modules/teacher/teacher.routes");
const uploadRoutes = require("../modules/upload/upload.routes");

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", authMiddleware, requireRoles("ADMIN"), userRoutes);
router.use("/learning", authMiddleware, learningRoutes);
router.use("/content", authMiddleware, contentRoutes);
router.use("/live", authMiddleware, liveRoutes);
router.use("/student", authMiddleware, requireRoles("STUDENT"), studentRoutes);
router.use("/teacher", authMiddleware, requireRoles("TEACHER", "ADMIN"), teacherRoutes);
router.use("/upload", authMiddleware, uploadRoutes);

module.exports = router;
