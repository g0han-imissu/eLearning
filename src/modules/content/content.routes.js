const { Router } = require("express");
const requireRoles = require("../../middlewares/rbac.middleware");
const { createLecture, createModule, createContent } = require("./content.controller");

const router = Router();
router.post("/lectures", requireRoles("ADMIN", "TEACHER"), createLecture);
router.post("/modules", requireRoles("ADMIN", "TEACHER"), createModule);
router.post("/contents", requireRoles("ADMIN", "TEACHER"), createContent);

module.exports = router;
