import { Router } from "express";
import { listMyTeachingClasses, listStudentsByClass } from "./teacher.controller.js";

const router = Router();

router.get("/classes", listMyTeachingClasses);
router.get("/classes/:classId/students", listStudentsByClass);

export default router;
