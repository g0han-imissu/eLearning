import { Router } from "express";
import requireRoles from "../../middlewares/rbac.middleware.js";
import {
  listLectures, createLecture, getLecture, updateLecture, deleteLecture,
  createModule, getModule, updateModule, deleteModule,
  createContent, getContent, updateContent, deleteContent,
} from "./content.controller.js";

const router = Router();

router.get("/lectures", listLectures);
router.post("/lectures", requireRoles("ORG_ADMIN", "TEACHER"), createLecture);
router.get("/lectures/:id", getLecture);
router.patch("/lectures/:id", requireRoles("ORG_ADMIN", "TEACHER"), updateLecture);
router.delete("/lectures/:id", requireRoles("ORG_ADMIN", "TEACHER"), deleteLecture);

router.post("/modules", requireRoles("ORG_ADMIN", "TEACHER"), createModule);
router.get("/modules/:id", getModule);
router.patch("/modules/:id", requireRoles("ORG_ADMIN", "TEACHER"), updateModule);
router.delete("/modules/:id", requireRoles("ORG_ADMIN", "TEACHER"), deleteModule);

router.post("/contents", requireRoles("ORG_ADMIN", "TEACHER"), createContent);
router.get("/contents/:id", getContent);
router.patch("/contents/:id", requireRoles("ORG_ADMIN", "TEACHER"), updateContent);
router.delete("/contents/:id", requireRoles("ORG_ADMIN", "TEACHER"), deleteContent);

export default router;
