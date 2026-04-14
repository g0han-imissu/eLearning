import { Router } from "express";
import requireRoles from "../../middlewares/rbac.middleware.js";
import {
  listLectures, createLecture, getLecture, updateLecture, deleteLecture,
  createModule, getModule, updateModule, deleteModule,
  createContent, getContent, deleteContent,
} from "./content.controller.js";

const router = Router();

router.get("/lectures", listLectures);
router.post("/lectures", requireRoles("ADMIN", "TEACHER"), createLecture);
router.get("/lectures/:id", getLecture);
router.patch("/lectures/:id", requireRoles("ADMIN", "TEACHER"), updateLecture);
router.delete("/lectures/:id", requireRoles("ADMIN", "TEACHER"), deleteLecture);

router.post("/modules", requireRoles("ADMIN", "TEACHER"), createModule);
router.get("/modules/:id", getModule);
router.patch("/modules/:id", requireRoles("ADMIN", "TEACHER"), updateModule);
router.delete("/modules/:id", requireRoles("ADMIN", "TEACHER"), deleteModule);

router.post("/contents", requireRoles("ADMIN", "TEACHER"), createContent);
router.get("/contents/:id", getContent);
router.delete("/contents/:id", requireRoles("ADMIN", "TEACHER"), deleteContent);

export default router;
