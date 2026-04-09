const { Router } = require("express");
const requireRoles = require("../../middlewares/rbac.middleware");
const { createProgram, createCourse, createClass, enrollClass } = require("./learning.controller");

const router = Router();

router.post("/programs", requireRoles("ADMIN"), createProgram);
router.post("/courses", requireRoles("ADMIN"), createCourse);
router.post("/classes", requireRoles("ADMIN", "TEACHER"), createClass);
router.post("/enrollments", requireRoles("ADMIN", "STUDENT"), enrollClass);

module.exports = router;
