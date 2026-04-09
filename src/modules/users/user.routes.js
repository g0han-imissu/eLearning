const { Router } = require("express");
const { listUsers, updateUserStatus, assignRoles } = require("./user.controller");

const router = Router();
router.get("/", listUsers);
router.patch("/:id/status", updateUserStatus);
router.patch("/:id/roles", assignRoles);

module.exports = router;
