const { Router } = require("express");
const requireRoles = require("../../middlewares/rbac.middleware");
const {
  listPrograms, listCourses, listClasses,
  createProgram, createCourse, createClass, enrollClass,
} = require("./learning.controller");

const router = Router();

// GET — ai đã đăng nhập đều xem được danh sách
router.get("/programs", listPrograms);
router.get("/courses", listCourses);
router.get("/classes", listClasses);

// POST — chỉ đúng role mới được tạo
router.post("/programs", requireRoles("ADMIN"), createProgram);
router.post("/courses", requireRoles("ADMIN"), createCourse);
router.post("/classes", requireRoles("ADMIN", "TEACHER"), createClass);
router.post("/enrollments", requireRoles("ADMIN", "STUDENT"), enrollClass);

module.exports = router;
