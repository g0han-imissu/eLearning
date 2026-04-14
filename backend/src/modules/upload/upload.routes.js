import { Router } from "express";
import requireRoles from "../../middlewares/rbac.middleware.js";
import { uploadVideo, uploadDocument, uploadImage } from "../../middlewares/upload.middleware.js";
import * as uploadController from "./upload.controller.js";

const router = Router();

router.post("/video", requireRoles("ADMIN", "TEACHER"), uploadVideo, uploadController.uploadVideo);
router.post("/document", requireRoles("ADMIN", "TEACHER"), uploadDocument, uploadController.uploadDocument);
router.post("/image", uploadImage, uploadController.uploadImage);

export default router;
