const { Router } = require("express");
const requireRoles = require("../../middlewares/rbac.middleware");
const { uploadVideo, uploadDocument, uploadImage } = require("../../middlewares/upload.middleware");
const uploadController = require("./upload.controller");

const router = Router();

// Chỉ ADMIN và TEACHER mới được upload nội dung
// uploadVideo là multer middleware — chạy trước, xử lý file từ request
// uploadController.uploadVideo — chạy sau, đẩy lên Cloudinary
router.post("/video", requireRoles("ADMIN", "TEACHER"), uploadVideo, uploadController.uploadVideo);
router.post("/document", requireRoles("ADMIN", "TEACHER"), uploadDocument, uploadController.uploadDocument);

// Upload ảnh đại diện — ai cũng được
router.post("/image", uploadImage, uploadController.uploadImage);

module.exports = router;
