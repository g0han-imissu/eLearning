import { Router } from "express";
import requireRoles from "../../middlewares/rbac.middleware.js";
import {
  listPrograms, listCourses, listClasses,
  createProgram, createCourse, createClass, enrollClass,
  getProgram, updateProgram, deleteProgram,
  getCourse, updateCourse, deleteCourse, getCourseTeachers,
  getClass, updateClass, deleteClass,
} from "./learning.controller.js";

const router = Router();

router.get("/programs", listPrograms);
router.post("/programs", requireRoles("ORG_ADMIN"), createProgram);
router.get("/programs/:id", getProgram);
router.patch("/programs/:id", requireRoles("ORG_ADMIN"), updateProgram);
router.delete("/programs/:id", requireRoles("ORG_ADMIN"), deleteProgram);

router.get("/courses", listCourses);
router.post("/courses", requireRoles("ORG_ADMIN"), createCourse);
router.get("/courses/:id", getCourse);
router.get("/courses/:id/teachers", requireRoles("ORG_ADMIN"), getCourseTeachers);
router.patch("/courses/:id", requireRoles("ORG_ADMIN"), updateCourse);
router.delete("/courses/:id", requireRoles("ORG_ADMIN"), deleteCourse);

router.get("/classes", listClasses);
router.post("/classes", requireRoles("ORG_ADMIN", "TEACHER"), createClass);
router.get("/classes/:id", getClass);
router.patch("/classes/:id", requireRoles("ORG_ADMIN", "TEACHER"), updateClass);
router.delete("/classes/:id", requireRoles("ORG_ADMIN"), deleteClass);

router.post("/enrollments", requireRoles("ORG_ADMIN", "STUDENT"), enrollClass);

export default router;
