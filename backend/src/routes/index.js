import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import requireRoles from "../middlewares/rbac.middleware.js";
import { tenantMiddleware } from "../lib/tenantContext.js";
import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "../modules/users/user.routes.js";
import learningRoutes from "../modules/learning/learning.routes.js";
import contentRoutes from "../modules/content/content.routes.js";
import liveRoutes from "../modules/live/live.routes.js";
import studentRoutes from "../modules/student/student.routes.js";
import teacherRoutes from "../modules/teacher/teacher.routes.js";
import uploadRoutes from "../modules/upload/upload.routes.js";
import quizRoutes from "../modules/quiz/quiz.routes.js";
import platformRoutes from "../modules/platform/platform.routes.js";
import { submitRegistration } from "../modules/platform/platform.controller.js";

const router = Router();

// authed = xác thực + kích hoạt auto-scope theo organizationId cho mọi query Prisma
const authed = [authMiddleware, tenantMiddleware];

// Public: trường/doanh nghiệp gửi yêu cầu đăng ký sử dụng nền tảng
router.post("/organization-registrations", submitRegistration);

// Super Admin: quản trị nền tảng (không qua tenantMiddleware — thao tác xuyên org)
router.use("/platform", authMiddleware, requireRoles("SUPER_ADMIN"), platformRoutes);

router.use("/auth", authRoutes);
router.use("/users", ...authed, requireRoles("ORG_ADMIN"), userRoutes);
router.use("/learning", ...authed, learningRoutes);
router.use("/content", ...authed, contentRoutes);
router.use("/live", ...authed, liveRoutes);
router.use("/student", ...authed, requireRoles("STUDENT"), studentRoutes);
router.use("/teacher", ...authed, requireRoles("TEACHER", "ORG_ADMIN"), teacherRoutes);
router.use("/upload", ...authed, uploadRoutes);
router.use("/quizzes", ...authed, quizRoutes);

export default router;
