import { Router } from "express";
import requireRoles from "../../middlewares/rbac.middleware.js";
import {
  getQuiz, updateQuiz,
  createQuestion, updateQuestion, deleteQuestion,
  createAnswer, updateAnswer, deleteAnswer,
} from "./quiz.controller.js";

const router = Router();

router.get("/:id", getQuiz);
router.patch("/:id", requireRoles("ADMIN", "TEACHER"), updateQuiz);

router.post("/questions", requireRoles("ADMIN", "TEACHER"), createQuestion);
router.patch("/questions/:id", requireRoles("ADMIN", "TEACHER"), updateQuestion);
router.delete("/questions/:id", requireRoles("ADMIN", "TEACHER"), deleteQuestion);

router.post("/answers", requireRoles("ADMIN", "TEACHER"), createAnswer);
router.patch("/answers/:id", requireRoles("ADMIN", "TEACHER"), updateAnswer);
router.delete("/answers/:id", requireRoles("ADMIN", "TEACHER"), deleteAnswer);

export default router;
