import { Router } from "express";
import { listUsers, updateUserStatus, assignRoles } from "./user.controller.js";
import {
  createUser, importUsers, listImportJobs, getImportJob,
  downloadJobCredentials, wipeJobCredentials, rollbackJob, downloadTemplate,
} from "./import.controller.js";
import { uploadSpreadsheet } from "../../middlewares/upload.middleware.js";

const router = Router();

router.get("/", listUsers);
router.post("/", createUser);

// Import CSV/XLSX — đặt trước các route /:id
router.get("/import-template", downloadTemplate);
router.post("/import", uploadSpreadsheet, importUsers);
router.get("/import-jobs", listImportJobs);
router.get("/import-jobs/:id", getImportJob);
router.get("/import-jobs/:id/credentials", downloadJobCredentials);
router.delete("/import-jobs/:id/credentials", wipeJobCredentials);
router.post("/import-jobs/:id/rollback", rollbackJob);

router.patch("/:id/status", updateUserStatus);
router.patch("/:id/roles", assignRoles);

export default router;
