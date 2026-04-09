const { Router } = require("express");
const requireRoles = require("../../middlewares/rbac.middleware");
const { listLectures, createLecture, createModule, createContent } = require("./content.controller");

const router = Router();

router.get("/lectures", listLectures);

router.post("/lectures", requireRoles("ADMIN", "TEACHER"), createLecture);
router.post("/modules", requireRoles("ADMIN", "TEACHER"), createModule);
router.post("/contents", requireRoles("ADMIN", "TEACHER"), createContent);

module.exports = router;
