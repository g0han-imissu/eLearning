import multer from "multer";
import ApiError from "../utils/apiError.js";

const storage = multer.memoryStorage();

const fileFilter = (allowedMimeTypes) => (_req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `File type not allowed. Allowed: ${allowedMimeTypes.join(", ")}`));
  }
};

export const uploadVideo = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: fileFilter(["video/mp4", "video/webm", "video/quicktime"]),
}).single("file");

export const uploadDocument = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: fileFilter([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]),
}).single("file");

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter(["image/jpeg", "image/png", "image/webp"]),
}).single("file");
