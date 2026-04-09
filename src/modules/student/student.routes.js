const { Router } = require("express");
const { me, myProgress } = require("./student.controller");

const router = Router();
router.get("/me", me);
router.get("/progress", myProgress);

module.exports = router;
