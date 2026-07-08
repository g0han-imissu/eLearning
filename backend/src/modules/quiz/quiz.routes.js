import { Router } from "express";
import requireRoles from "../../middlewares/rbac.middleware.js";
import {
  getQuiz, updateQuiz,
  createQuestion, updateQuestion, deleteQuestion,
  createAnswer, updateAnswer, deleteAnswer,
} from "./quiz.controller.js";

const router = Router();

router.get("/:id", getQuiz);
router.patch("/:id", requireRoles("ORG_ADMIN", "TEACHER"), updateQuiz);

router.post("/questions", requireRoles("ORG_ADMIN", "TEACHER"), createQuestion);
router.patch("/questions/:id", requireRoles("ORG_ADMIN", "TEACHER"), updateQuestion);
router.delete("/questions/:id", requireRoles("ORG_ADMIN", "TEACHER"), deleteQuestion);

router.post("/answers", requireRoles("ORG_ADMIN", "TEACHER"), createAnswer);
router.patch("/answers/:id", requireRoles("ORG_ADMIN", "TEACHER"), updateAnswer);
router.delete("/answers/:id", requireRoles("ORG_ADMIN", "TEACHER"), deleteAnswer);

export default router;
