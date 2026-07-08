import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import cloudinary from "../../lib/cloudinary.js";
import { cloudinary as cloudinaryConfig } from "../../config/env.js";
import ApiError from "../../utils/apiError.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_ROOT = path.resolve(__dirname, "../../../uploads");

// Cloudinary chỉ được dùng khi đã cấu hình thật (không phải giá trị mẫu "your_...")
const isCloudinaryConfigured = () => {
  const { cloudName, apiKey, apiSecret } = cloudinaryConfig;
  return Boolean(cloudName && apiKey && apiSecret) &&
    ![cloudName, apiKey, apiSecret].some((v) => String(v).toLowerCase().startsWith("your"));
};

// File của mỗi tổ chức nằm trong folder riêng: org/<orgId>/<loại>
const orgFolder = (req, kind) => {
  const orgId = req.user?.organizationId || "platform";
  return `org/${orgId}/${kind}`;
};

const extFromMime = (mimetype, fallback) => {
  const map = {
    "video/mp4": ".mp4", "video/webm": ".webm", "video/quicktime": ".mov",
    "application/pdf": ".pdf", "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp",
  };
  return map[mimetype] || fallback || "";
};

// Lưu file vào ổ đĩa, trả về URL tương đối /uploads/<folder>/<file>
const saveLocal = (file, folder) => {
  const dir = path.join(UPLOAD_ROOT, folder);
  fs.mkdirSync(dir, { recursive: true });
  const ext = path.extname(file.originalname) || extFromMime(file.mimetype);
  const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  fs.writeFileSync(path.join(dir, name), file.buffer);
  return `/uploads/${folder}/${name}`;
};

const streamUpload = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(new ApiError(500, error.message));
      else resolve(result);
    });
    stream.end(buffer);
  });

export const uploadVideo = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, "No file uploaded");
    if (isCloudinaryConfigured()) {
      const result = await streamUpload(req.file.buffer, { resource_type: "video", folder: orgFolder(req, "videos") });
      return res.json({ url: result.secure_url, publicId: result.public_id, durationSecond: Math.round(result.duration || 0), provider: "cloudinary" });
    }
    const url = saveLocal(req.file, orgFolder(req, "videos"));
    res.json({ url, durationSecond: 0, fileSize: req.file.size, provider: "local" });
  } catch (e) { next(e); }
};

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, "No file uploaded");
    if (isCloudinaryConfigured()) {
      const result = await streamUpload(req.file.buffer, { resource_type: "raw", folder: orgFolder(req, "documents") });
      return res.json({ url: result.secure_url, publicId: result.public_id, fileType: req.file.mimetype, fileSize: req.file.size, provider: "cloudinary" });
    }
    const url = saveLocal(req.file, orgFolder(req, "documents"));
    res.json({ url, fileType: req.file.mimetype, fileSize: req.file.size, provider: "local" });
  } catch (e) { next(e); }
};

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, "No file uploaded");
    if (isCloudinaryConfigured()) {
      const result = await streamUpload(req.file.buffer, {
        resource_type: "image",
        folder: orgFolder(req, "images"),
        transformation: [{ width: 800, crop: "limit" }, { quality: "auto" }],
      });
      return res.json({ url: result.secure_url, publicId: result.public_id, provider: "cloudinary" });
    }
    const url = saveLocal(req.file, orgFolder(req, "images"));
    res.json({ url, provider: "local" });
  } catch (e) { next(e); }
};
