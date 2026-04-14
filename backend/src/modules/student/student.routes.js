import { Router } from "express";
import { me, myProgress, submitQuiz, updateProgress, myEnrollments, joinByCode } from "./student.controller.js";

const router = Router();

router.get("/me", me);
router.get("/progress", myProgress);
router.get("/enrollments", myEnrollments);
router.post("/join", joinByCode);
router.post("/quiz-submit", submitQuiz);
router.patch("/progress", updateProgress);

export default router;
