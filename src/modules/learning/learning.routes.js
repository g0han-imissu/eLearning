import { Router } from "express";
import requireRoles from "../../middlewares/rbac.middleware.js";
import {
  listPrograms, listCourses, listClasses,
  createProgram, createCourse, createClass, enrollClass,
  getProgram, updateProgram, deleteProgram,
  getCourse, updateCourse, deleteCourse,
  getClass, updateClass, deleteClass,
} from "./learning.controller.js";

const router = Router();

router.get("/programs", listPrograms);
router.post("/programs", requireRoles("ADMIN"), createProgram);
router.get("/programs/:id", getProgram);
router.patch("/programs/:id", requireRoles("ADMIN"), updateProgram);
router.delete("/programs/:id", requireRoles("ADMIN"), deleteProgram);

router.get("/courses", listCourses);
router.post("/courses", requireRoles("ADMIN"), createCourse);
router.get("/courses/:id", getCourse);
router.patch("/courses/:id", requireRoles("ADMIN"), updateCourse);
router.delete("/courses/:id", requireRoles("ADMIN"), deleteCourse);

router.get("/classes", listClasses);
router.post("/classes", requireRoles("ADMIN", "TEACHER"), createClass);
router.get("/classes/:id", getClass);
router.patch("/classes/:id", requireRoles("ADMIN", "TEACHER"), updateClass);
router.delete("/classes/:id", requireRoles("ADMIN"), deleteClass);

router.post("/enrollments", requireRoles("ADMIN", "STUDENT"), enrollClass);

export default router;
