import { Router } from "express";
import { listMyTeachingClasses, listStudentsByClass, getPendingRequests, approveOrRejectRequest } from "./teacher.controller.js";

const router = Router();

router.get("/classes", listMyTeachingClasses);
router.get("/classes/:classId/students", listStudentsByClass);
router.get("/classes/:classId/requests", getPendingRequests);
router.post("/classes/:classId/requests", approveOrRejectRequest);

export default router;
