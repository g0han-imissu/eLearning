const { Router } = require("express");
const { listMyTeachingClasses, listStudentsByClass } = require("./teacher.controller");

const router = Router();

router.get("/classes", listMyTeachingClasses);
router.get("/classes/:classId/students", listStudentsByClass);

module.exports = router;
