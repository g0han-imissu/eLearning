import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import requireRoles from "../middlewares/rbac.middleware.js";
import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "../modules/users/user.routes.js";
import learningRoutes from "../modules/learning/learning.routes.js";
import contentRoutes from "../modules/content/content.routes.js";
import liveRoutes from "../modules/live/live.routes.js";
import studentRoutes from "../modules/student/student.routes.js";
import teacherRoutes from "../modules/teacher/teacher.routes.js";
import uploadRoutes from "../modules/upload/upload.routes.js";
import quizRoutes from "../modules/quiz/quiz.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", authMiddleware, requireRoles("ADMIN"), userRoutes);
router.use("/learning", authMiddleware, learningRoutes);
router.use("/content", authMiddleware, contentRoutes);
router.use("/live", authMiddleware, liveRoutes);
router.use("/student", authMiddleware, requireRoles("STUDENT"), studentRoutes);
router.use("/teacher", authMiddleware, requireRoles("TEACHER", "ADMIN"), teacherRoutes);
router.use("/upload", authMiddleware, uploadRoutes);
router.use("/quizzes", authMiddleware, quizRoutes);

export default router;
