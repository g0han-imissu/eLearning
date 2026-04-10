const multer = require("multer");
const ApiError = require("../utils/apiError");

// Lưu file tạm vào RAM thay vì ổ đĩa — để đẩy thẳng lên Cloudinary
const storage = multer.memoryStorage();

// Kiểm tra loại file được phép upload
const fileFilter = (allowedMimeTypes) => (_req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // cho phép
  } else {
    cb(new ApiError(400, `File type not allowed. Allowed: ${allowedMimeTypes.join(", ")}`));
  }
};

// Middleware upload video (tối đa 500MB)
const uploadVideo = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: fileFilter(["video/mp4", "video/webm", "video/quicktime"]),
}).single("file"); // "file" là tên field mà frontend gửi lên

// Middleware upload tài liệu PDF/Word (tối đa 20MB)
const uploadDocument = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: fileFilter([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]),
}).single("file");

// Middleware upload ảnh đại diện (tối đa 5MB)
const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter(["image/jpeg", "image/png", "image/webp"]),
}).single("file");

module.exports = { uploadVideo, uploadDocument, uploadImage };
