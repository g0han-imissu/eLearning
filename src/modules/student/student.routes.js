import { Router } from "express";
import { me, myProgress, submitQuiz, updateProgress } from "./student.controller.js";

const router = Router();

router.get("/me", me);
router.get("/progress", myProgress);
router.post("/quiz-submit", submitQuiz);
router.patch("/progress", updateProgress);

export default router;
